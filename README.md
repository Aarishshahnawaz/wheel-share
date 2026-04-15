# WheelShare 🚗

A P2P vehicle rental platform where users can rent or list bikes and cars directly — no middleman.

---

## Problem Statement

In India, short-term vehicle rentals are expensive and limited to commercial services. Private vehicle owners have idle assets while renters overpay. WheelShare bridges this gap by connecting owners and renters directly on a trusted platform.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Realtime | Socket.io |
| Icons | Lucide React |
| Routing | React Router v7 |

---

## Getting Started

**Prerequisites:** Node.js v18+, MongoDB on port 27017

```bash
# Terminal 1 — Backend
cd wheelshare-server
node index.js

# Terminal 2 — Frontend
cd wheelshare-client
npm run dev
```

- App → `http://localhost:5173`
- API → `http://localhost:5000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/admin-login` | Admin login |
| GET | `/api/vehicles` | Get all vehicles |
| POST | `/api/vehicles` | List a vehicle |
| PATCH | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | My bookings |
| GET | `/api/admin/users` | All users (admin) |
| GET | `/api/admin/kyc` | KYC requests (admin) |
| PATCH | `/api/admin/kyc/:id` | Approve/reject KYC |
| GET | `/api/admin/stats` | Platform stats |

---


## Future Scope

- **Payment Gateway** — Razorpay/Stripe integration for online payments
- **GPS Live Tracking** — Real-time vehicle tracking during rental
- **Rating & Reviews** — Post-trip reviews for owners and renters
- **Mobile App** — React Native version for iOS & Android
- **AI Pricing** — Dynamic pricing based on demand and season
- **Insurance API** — Auto-generate trip insurance at booking
- **Multi-city Expansion** — Scale beyond current city support
