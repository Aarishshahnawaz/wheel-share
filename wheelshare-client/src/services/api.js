const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
const getUserToken = () => {
  try { return JSON.parse(localStorage.getItem('ws_user') || '{}').token || null; }
  catch { return null; }
};

const getAdminToken = () => {
  try { return JSON.parse(localStorage.getItem('ws_admin') || '{}').token || null; }
  catch { return null; }
};

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    // If token expired, clear localStorage and redirect to login
    if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
      localStorage.removeItem('ws_user');
      localStorage.removeItem('ws_admin');
      window.location.href = '/login';
    }
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiLogin      = (body) => fetch(`${BASE}/auth/login`,       { method: 'POST', headers: headers(null), body: JSON.stringify(body) }).then(handle);
export const apiSignup     = (body) => fetch(`${BASE}/auth/signup`,      { method: 'POST', headers: headers(null), body: JSON.stringify(body) }).then(handle);
export const apiAdminLogin = (body) => fetch(`${BASE}/auth/admin-login`, { method: 'POST', headers: headers(null), body: JSON.stringify(body) }).then(handle);

// ── User ──────────────────────────────────────────────────────────────────────
export const apiGetMe         = ()     => fetch(`${BASE}/users/me`,      { headers: headers(getUserToken()) }).then(handle);
export const apiUpdateProfile = (body) => fetch(`${BASE}/users/profile`, { method: 'PATCH', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);
export const apiSubmitKyc     = (body) => fetch(`${BASE}/users/kyc`,     { method: 'PATCH', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);

// ── Admin — Stats ─────────────────────────────────────────────────────────────
export const apiAdminGetStats = () =>
  fetch(`${BASE}/admin/stats`, { headers: headers(getAdminToken()) }).then(handle);

// ── Admin — Users ─────────────────────────────────────────────────────────────
export const apiAdminGetUsers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE}/admin/users?${qs}`, { headers: headers(getAdminToken()) }).then(handle);
};

export const apiAdminToggleBan = (id) =>
  fetch(`${BASE}/admin/users/${id}/ban`, { method: 'PATCH', headers: headers(getAdminToken()) }).then(handle);

export const apiAdminGetUserDetail = (id) =>
  fetch(`${BASE}/admin/users/${id}`, { headers: headers(getAdminToken()) }).then(handle);

export const apiAdminDeleteUser = (id) =>
  fetch(`${BASE}/admin/users/${id}`, { method: 'DELETE', headers: headers(getAdminToken()) }).then(handle);

// ── Admin — KYC ───────────────────────────────────────────────────────────────
export const apiAdminGetKyc = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE}/admin/kyc?${qs}`, { headers: headers(getAdminToken()) }).then(handle);
};

export const apiAdminGetKycStats = () =>
  fetch(`${BASE}/admin/kyc/stats`, { headers: headers(getAdminToken()) }).then(handle);

export const apiAdminGetKycDetail = (id) =>
  fetch(`${BASE}/admin/kyc/${id}`, { headers: headers(getAdminToken()) }).then(handle);

export const apiAdminUpdateKyc = (id, body) =>
  fetch(`${BASE}/admin/kyc/${id}`, { method: 'PATCH', headers: headers(getAdminToken()), body: JSON.stringify(body) }).then(handle);

// ── Admin — Vehicles ──────────────────────────────────────────────────────────
export const apiAdminGetVehicles = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE}/admin/vehicles?${qs}`, { headers: headers(getAdminToken()) }).then(handle);
};

// ── Vehicles (marketplace) ────────────────────────────────────────────────────
export const apiGetAllVehicles = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE}/vehicles?${qs}`, { headers: headers(getUserToken()) }).then(handle);
};

export const apiGetMyVehicles = () =>
  fetch(`${BASE}/vehicles/my`, { headers: headers(getUserToken()) }).then(handle);

export const apiGetVehicleById = (id) =>
  fetch(`${BASE}/vehicles/${id}`, { headers: headers(getUserToken()) }).then(handle);

export const apiCreateVehicle = (body) =>
  fetch(`${BASE}/vehicles`, { method: 'POST', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);

export const apiUpdateVehicle = (id, body) =>
  fetch(`${BASE}/vehicles/${id}`, { method: 'PATCH', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);

export const apiToggleVehicleAvailability = (id) =>
  fetch(`${BASE}/vehicles/${id}/availability`, { method: 'PATCH', headers: headers(getUserToken()) }).then(handle);

export const apiDeleteVehicle = (id) =>
  fetch(`${BASE}/vehicles/${id}`, { method: 'DELETE', headers: headers(getUserToken()) }).then(handle);

export const apiToggleVehicleLive = (id) =>
  fetch(`${BASE}/vehicles/${id}/live`, { method: 'PATCH', headers: headers(getUserToken()) }).then(handle);

// ── Upload ────────────────────────────────────────────────────────────────────
export const apiUploadPhotos = (files) => {
  const form = new FormData();
  files.forEach(f => form.append('photos', f));
  const token = getUserToken();
  return fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  }).then(handle);
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const apiCreateBooking = (body) =>
  fetch(`${BASE}/bookings`, { method: 'POST', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);

export const apiGetMyBookings = () =>
  fetch(`${BASE}/bookings/my`, { headers: headers(getUserToken()) }).then(handle);

export const apiCancelBooking = (id) =>
  fetch(`${BASE}/bookings/${id}/cancel`, { method: 'PATCH', headers: headers(getUserToken()) }).then(handle);

export const apiRateBooking = (id, body) =>
  fetch(`${BASE}/bookings/${id}/rate`, { method: 'PATCH', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);

// ── Reviews ───────────────────────────────────────────────────────────────────
export const apiCreateReview     = (body) => fetch(`${BASE}/reviews`,         { method: 'POST', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);
export const apiGetOwnerReviews  = ()     => fetch(`${BASE}/reviews/owner`,   { headers: headers(getUserToken()) }).then(handle);
export const apiGetMyReviews     = ()     => fetch(`${BASE}/reviews/my`,      { headers: headers(getUserToken()) }).then(handle);
export const apiGetVehicleReviews = (id)  => fetch(`${BASE}/reviews/vehicle/${id}`, { headers: headers(getUserToken()) }).then(handle);

// ── Notifications ─────────────────────────────────────────────────────────────
export const apiGetNotifications = () =>
  fetch(`${BASE}/notifications`, { headers: headers(getUserToken()) }).then(handle);

export const apiMarkNotificationRead = (id) =>
  fetch(`${BASE}/notifications/${id}/read`, { method: 'PATCH', headers: headers(getUserToken()) }).then(handle);

export const apiMarkAllNotificationsRead = () =>
  fetch(`${BASE}/notifications/read-all`, { method: 'PATCH', headers: headers(getUserToken()) }).then(handle);

// ── Chats ─────────────────────────────────────────────────────────────────────
export const apiGetMyChats = () =>
  fetch(`${BASE}/chats`, { headers: headers(getUserToken()) }).then(handle);

export const apiGetChatByBooking = (bookingId) =>
  fetch(`${BASE}/chats/booking/${bookingId}`, { headers: headers(getUserToken()) }).then(handle);

export const apiGetMessages = (chatId) =>
  fetch(`${BASE}/chats/${chatId}/messages`, { headers: headers(getUserToken()) }).then(handle);

export const apiSendMessage = (chatId, body) =>
  fetch(`${BASE}/chats/${chatId}/messages`, { method: 'POST', headers: headers(getUserToken()), body: JSON.stringify(body) }).then(handle);

// ── Booking owner actions ─────────────────────────────────────────────────────
export const apiGetOwnerBookings = () =>
  fetch(`${BASE}/bookings/owner`, { headers: headers(getUserToken()) }).then(handle);

export const apiAcceptBooking = (id) =>
  fetch(`${BASE}/bookings/${id}/accept`, { method: 'PATCH', headers: headers(getUserToken()) }).then(handle);

export const apiRejectBooking = (id, reason = '') =>
  fetch(`${BASE}/bookings/${id}/reject`, { method: 'PATCH', headers: headers(getUserToken()), body: JSON.stringify({ reason }) }).then(handle);

export const apiCompleteBooking = (id) =>
  fetch(`${BASE}/bookings/${id}/complete`, { method: 'PATCH', headers: headers(getUserToken()) }).then(handle);
