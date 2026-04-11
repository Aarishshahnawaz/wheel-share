const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helpers ───────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const ok  = (res, data, status = 200) =>
  res.status(status).json({ success: true, ...data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // ── 1. Basic validation ──────────────────────────────────────────────────
    if (!name || !name.trim()) {
      return fail(res, 'Full name is required');
    }
    if (!password || password.length < 8) {
      return fail(res, 'Password must be at least 8 characters');
    }
    if (!email && !phone) {
      return fail(res, 'Email or phone number is required');
    }

    // ── 2. Normalise inputs ──────────────────────────────────────────────────
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? String(phone).trim()       : null;  // force String

    // ── 3. Duplicate check — only include fields that were provided ──────────
    const orConditions = [];
    if (cleanEmail) orConditions.push({ email: cleanEmail });
    if (cleanPhone) orConditions.push({ phone: cleanPhone });

    // orConditions will always have at least one entry (validated above)
    const existing = await User.findOne({ $or: orConditions });

    if (existing) {
      if (cleanEmail && existing.email === cleanEmail) {
        return fail(res, 'An account with this email already exists', 409);
      }
      if (cleanPhone && existing.phone === cleanPhone) {
        return fail(res, 'An account with this phone number already exists', 409);
      }
      return fail(res, 'Account already exists', 409);
    }

    // ── 4. Create user (password hashed by pre-save hook) ────────────────────
    const userData = {
      name:     name.trim(),
      password,
    };
    if (cleanEmail) userData.email = cleanEmail;
    if (cleanPhone) userData.phone = cleanPhone;

    const user  = await User.create(userData);
    const token = signToken(user._id);

    return ok(res, { token, user: user.toSafeObject() }, 201);

  } catch (e) {
    // Mongoose duplicate key (race condition safety net)
    if (e.code === 11000) {
      const field = Object.keys(e.keyPattern || {})[0] || 'field';
      return fail(res, `This ${field} is already registered`, 409);
    }
    console.error('[signup error]', e.message);
    return fail(res, 'Signup failed. Please try again.', 500);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return fail(res, 'Email or phone is required');
    }
    if (!password) {
      return fail(res, 'Password is required');
    }

    // Build query based on whether identifier looks like an email
    const isEmail = identifier.includes('@');
    const query   = isEmail
      ? { email: identifier.trim().toLowerCase() }
      : { phone: String(identifier).trim() };

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return fail(res, 'No account found with this email or phone. Please sign up first.', 401);
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return fail(res, 'Incorrect password. Please try again.', 401);
    }

    const token = signToken(user._id);
    return ok(res, { token, user: user.toSafeObject() });

  } catch (e) {
    console.error('[login error]', e.message);
    return fail(res, 'Login failed. Please try again.', 500);
  }
};

// ── POST /api/auth/admin-login ────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return fail(res, 'Invalid admin credentials', 401);
    }

    const token = signToken(user._id);
    return ok(res, { token, user: user.toSafeObject() });

  } catch (e) {
    console.error('[adminLogin error]', e.message);
    return fail(res, 'Admin login failed', 500);
  }
};

// ── POST /api/auth/create-admin ───────────────────────────────────────────────
exports.createAdmin = async (req, res) => {
  try {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return fail(res, 'Forbidden', 403);
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) return fail(res, 'Name, email and password are required');

    const cleanEmail = email.toLowerCase().trim();
    const existing  = await User.findOne({ email: cleanEmail });

    if (existing) {
      existing.role = 'admin';
      await existing.save();
      return ok(res, { message: 'User promoted to admin' });
    }

    const user = await User.create({ name: name.trim(), email: cleanEmail, password, role: 'admin' });
    return ok(res, { user: user.toSafeObject() }, 201);

  } catch (e) {
    console.error('[createAdmin error]', e.message);
    return fail(res, 'Failed to create admin', 500);
  }
};
