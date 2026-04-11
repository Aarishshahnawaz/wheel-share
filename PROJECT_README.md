# WheelShare — Complete Project Documentation

> A peer-to-peer vehicle rental platform built for India. Owners list their bikes and cars, renters discover and book them. Think Airbnb, but for vehicles.

---

## Table of Contents

1. [What is WheelShare?](#1-what-is-wheelshare)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How to Run](#4-how-to-run)
5. [Frontend — Every File Explained](#5-frontend--every-file-explained)
6. [Backend — Every File Explained](#6-backend--every-file-explained)
7. [Database Models](#7-database-models)
8. [API Reference](#8-api-reference)
9. [Feature Walkthroughs](#9-feature-walkthroughs)
10. [Admin Panel](#10-admin-panel)
11. [Key Design Decisions](#11-key-design-decisions)
12. [Credentials & Defaults](#12-credentials--defaults)

---

## 1. What is WheelShare?

WheelShare is a full-stack web application that lets vehicle owners in India rent out their bikes and cars to other users on an hourly or daily basis — similar to how Airbnb works for homes.

### Two types of users

| Role | What they do |
|------|-------------|
| **Owner** | Lists their vehicle, sets price and availability, approves/rejects booking requests, earns money |
| **Renter** | Searches for vehicles by city, books them, pays, tracks the ride, leaves a review |

### Two types of listings

| Type | How it works |
|------|-------------|
| **Personal Listing** | Owner rents their personal vehicle on specific dates, hourly pricing, time-window based |
| **Business Listing** | Fleet/commercial owner, available on selected days of the week (Mon–Sun), daily + hourly pricing |

---

## 2. Tech Stack

### Frontend
- **React 18** + **Vite** — fast dev server, component-based UI
- **React Router v6** — client-side routing (SPA)
- **Tailwind CSS v4** — utility-first styling
- **Lucide React** — icon library
- **Socket.io-client** — real-time chat and notifications

### Backend
- **Node.js** + **Express** — REST API server
- **MongoDB** + **Mongoose** — database and ODM
- **JWT (jsonwebtoken)** — authentication tokens
- **bcryptjs** — password hashing
- **Socket.io** — real-time bidirectional events
- **Multer** — file/image upload handling
- **Cloudinary** (optional) — image hosting

### Dev Tools
- **ESLint** — code linting
- **dotenv** — environment variables

---

## 3. Project Structure

```
RentIt/
├── wheelshare-client/          ← React frontend
│   ├── public/                 ← Static assets (favicon, icons)
│   ├── src/
│   │   ├── admin/              ← Admin panel (separate mini-app)
│   │   │   ├── components/     ← AdminShell, AdminUI shared components
│   │   │   ├── context/        ← AdminStore (admin state management)
│   │   │   ├── data/           ← Mock data for charts
│   │   │   └── pages/          ← Dashboard, KYC, Users, Vehicles, Earnings
│   │   ├── assets/             ← Images (hero.png, etc.)
│   │   ├── components/         ← All reusable UI components
│   │   │   ├── admin/          ← Admin-specific components
│   │   │   ├── booking/        ← Booking flow steps
│   │   │   ├── dashboard/      ← Owner dashboard widgets
│   │   │   ├── list/           ← Vehicle listing steps
│   │   │   ├── search/         ← Search page components
│   │   │   ├── tracking/       ← Live tracking UI
│   │   │   └── vehicle/        ← Vehicle detail page components
│   │   ├── context/            ← React Context providers
│   │   ├── data/               ← Static demo data
│   │   ├── hooks/              ← Custom React hooks
│   │   ├── pages/              ← Route-level page components
│   │   └── services/           ← API call functions (api.js)
│   ├── index.html
│   └── package.json
│
└── wheelshare-server/          ← Node.js backend
    ├── src/
    │   ├── controllers/        ← Business logic for each feature
    │   ├── middleware/         ← Auth guards
    │   ├── models/             ← MongoDB schemas
    │   └── routes/             ← Express route definitions
    ├── uploads/                ← Locally uploaded images
    ├── index.js                ← Server entry point
    └── package.json
```

---

## 4. How to Run

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)

### Step 1 — Backend
```bash
cd wheelshare-server
npm install
# Create .env file:
# MONGO_URI=mongodb://localhost:27017/wheelshare
# JWT_SECRET=your_secret_key
# PORT=5000
node index.js
# Server starts at http://localhost:5000
```

### Step 2 — Frontend
```bash
cd wheelshare-client
npm install
npm run dev
# App starts at http://localhost:5173
```

### Step 3 — Create Admin Account
```bash
# POST http://localhost:5000/api/auth/create-admin
# Body: { "name": "Super Admin", "email": "admin@wheelshare.com", "password": "admin123" }
# Then visit: http://localhost:5173/admin2/login
```

---

## 5. Frontend — Every File Explained

### `src/main.jsx`
The entry point. Wraps the entire app in all Context providers (Auth, Role, Location, VehicleStore) and renders `<App />` into the DOM.

### `src/App.jsx`
Defines all client-side routes using React Router. Every URL maps to a page component. Also imports the admin pages under `/admin2/*` prefix.

### `src/App.css` / `src/index.css`
Global styles. `index.css` sets up Tailwind base layers and custom CSS variables (orange gradient `btn-primary`, animation keyframes like `animate-modal`).

---

### Context Providers (`src/context/`)

| File | Purpose |
|------|---------|
| `AuthContext.jsx` | Stores logged-in user info (name, id, token). Reads from `localStorage` key `ws_user`. Provides `login()`, `logout()`, `user` to the whole app. |
| `RoleContext.jsx` | Tracks whether the current user is acting as `owner` or `renter`. A single user can switch roles. Stored in `localStorage` key `ws_role`. |
| `LocationContext.jsx` | Global city/state/lat/lng selection. Shows `LocationModal` on first visit. Persisted in `localStorage` key `userLocation`. Used by search to filter vehicles by city. |
| `VehicleStoreContext.jsx` | Manages the owner's listed vehicles. Fetches from backend on mount, falls back to `localStorage` when offline. Provides `addVehicle`, `updateVehicle`, `deleteVehicle`, `toggleAvailability`. |

---

### Pages (`src/pages/`)

#### Public Pages
| File | Route | What it does |
|------|-------|-------------|
| `LandingPage.jsx` | `/` | Marketing homepage. Shows Hero, HowItWorks, WhatYouCanDo, TrustSection, CityStrip, FinalCTA, Footer. |
| `LoginPage.jsx` | `/login` | Email/phone + password login form. Calls `POST /api/auth/login`. Saves token to `localStorage`. |
| `SignupPage.jsx` | `/signup` | Registration form. Calls `POST /api/auth/signup`. |

#### Renter Pages
| File | Route | What it does |
|------|-------|-------------|
| `SearchPage.jsx` | `/rent` | Vehicle search with filters (type, city, price, fuel, tags). Uses `useVehicleSearch` hook. Shows `FilterSidebar` + grid of `VehicleCard`. |
| `VehicleDetailPage.jsx` | `/vehicle/:id` | Full vehicle detail. Shows gallery, specs, owner card, reviews, map, and `BookingPanel`. |
| `MyBookingsPage.jsx` | `/my-bookings` | List of all bookings made by the renter. Each card shows status, vehicle, dates, amount. |
| `BookingDetailsPage.jsx` | `/booking/:id` | Detailed view of one booking. Shows Flipkart-style status tracker, pickup location, payment breakdown. Different view for owner vs renter. |

#### Booking Flow Pages
| File | Route | What it does |
|------|-------|-------------|
| `booking/BookingPage.jsx` | `/book/:id` | 3-step booking wizard: Schedule → Add-ons → Review & Confirm. Calls `POST /api/bookings`. |
| `payment/PaymentPage.jsx` | `/pay/:id` | Payment screen (UI only, no real payment gateway yet). |

#### Owner Pages
| File | Route | What it does |
|------|-------|-------------|
| `dashboard/DashboardPage.jsx` | `/dashboard` | Owner's home. Shows stats, recent activity, quick actions, earnings chart. |
| `list/ListVehiclePage.jsx` | `/list` | 4-step vehicle listing wizard: Photos → Details → Pricing → Availability. |
| `list/MyVehiclesPage.jsx` | `/my-vehicles` | Grid of owner's listed vehicles with edit/delete/toggle controls. |
| `list/EditVehiclePage.jsx` | `/edit-vehicle/:id` | Same 4-step form pre-filled with existing vehicle data. |
| `OwnerBookingsPage.jsx` | `/owner-bookings` | Booking requests received by the owner. Accept/Reject controls. |
| `owner/EarningsPage.jsx` | `/earnings` | Earnings breakdown with chart. |

#### Shared Pages
| File | Route | What it does |
|------|-------|-------------|
| `ProfilePage.jsx` | `/profile` | View/edit user profile. Upload profile photo. Submit KYC documents. |
| `NotificationsPage.jsx` | `/notifications` | List of all notifications (booking requests, acceptances, messages). |
| `ReviewsPage.jsx` | `/reviews` | Reviews received by the owner. |
| `SettingsPage.jsx` | `/settings` | Account settings. |
| `chat/ChatsListPage.jsx` | `/chat` | List of all active chats. |
| `chat/ChatPage.jsx` | `/chat/:bookingId` | Real-time chat for a specific booking. Uses Socket.io. |

---

### Components (`src/components/`)

#### Landing Page Components
| File | What it does |
|------|-------------|
| `Hero.jsx` | Big hero section with headline, CTA buttons, hero image. |
| `HowItWorks.jsx` | 3-step explainer: List → Book → Earn. |
| `WhatYouCanDo.jsx` | Feature highlights for owners and renters. |
| `TrustSection.jsx` | Trust badges (insured, verified, etc.). |
| `CityStrip.jsx` | Horizontal scrolling strip of available cities. |
| `FinalCTA.jsx` | Bottom call-to-action section. |
| `Footer.jsx` | Site footer with links. |
| `Navbar.jsx` | Top navigation bar. Shows login/signup or user avatar. |

#### Search Components
| File | What it does |
|------|-------------|
| `search/SearchBar.jsx` | City + vehicle type + date/time search inputs. |
| `search/FilterSidebar.jsx` | Left sidebar with price range, fuel type, tags, booking type filters. |
| `search/VehicleCard.jsx` | Individual vehicle card in search results. Shows image, price (hourly + daily if both set), availability badge, Book Now button. |

#### Vehicle Detail Components
| File | What it does |
|------|-------------|
| `vehicle/ImageGallery.jsx` | Photo gallery with thumbnail strip. |
| `vehicle/BookingPanel.jsx` | Sticky right panel on detail page. Shows price, availability window, rental mode selector (hourly/daily), Book Now button. |
| `vehicle/OwnerCard.jsx` | Owner profile card with rating and contact. |
| `vehicle/ReviewsSection.jsx` | List of user reviews with star ratings. |
| `vehicle/MapSection.jsx` | Approximate pickup location on a map. |

#### Booking Flow Components
| File | What it does |
|------|-------------|
| `booking/StepIndicator.jsx` | Progress bar showing current step (1/2/3). |
| `booking/StepSchedule.jsx` | Date + time picker. Personal vehicles: fixed date, time slots within owner window. Business: date range picker. |
| `booking/StepAddons.jsx` | Optional add-ons: insurance, helmet, GPS, roadside assist. |
| `booking/StepReview.jsx` | Final summary before confirming. Shows all pricing. |
| `booking/BookingConfirmed.jsx` | Success screen after booking is created. |

#### Vehicle Listing Components
| File | What it does |
|------|-------------|
| `list/ListStepIndicator.jsx` | 4-step progress indicator for listing flow. |
| `list/StepPhotos.jsx` | Photo upload step. Supports multiple images. |
| `list/StepDetails.jsx` | Vehicle info: brand, model, year, fuel, city, address, features. |
| `list/StepPricing.jsx` | Price per hour (required) + price per day (optional for personal, required for business). Discount sliders. |
| `list/StepAvailability.jsx` | Availability setup. Personal: date picker (calendar popup, multi-select). Business: Mon–Sun day buttons. Both: time window, instant book toggle, Go Live toggle. |

#### Dashboard Components
| File | What it does |
|------|-------------|
| `dashboard/DashboardLayout.jsx` | Wrapper with sidebar + topbar for all dashboard pages. |
| `dashboard/Sidebar.jsx` | Left navigation. Shows different items for owner vs renter role. |
| `dashboard/StatsBar.jsx` | Row of stat cards (total earnings, bookings, vehicles). |
| `dashboard/EarningsChart.jsx` | Bar chart of monthly earnings. |
| `dashboard/ProfileCard.jsx` | User profile summary card. |
| `dashboard/PerformanceCard.jsx` | Vehicle performance metrics. |
| `dashboard/QuickActions.jsx` | Shortcut buttons (List Vehicle, Find a Ride, etc.). |
| `dashboard/RecentActivity.jsx` | Recent bookings/events feed. |

#### Utility Components
| File | What it does |
|------|-------------|
| `Navbar.jsx` | Top nav with logo, links, user menu. |
| `LocationModal.jsx` | City selection modal shown on first visit. Dropdown with Indian cities. |
| `RoleModal.jsx` | Modal to switch between Owner and Renter role. |
| `RoleSwitcher.jsx` | Button that opens RoleModal. |
| `KycGuard.jsx` | Wrapper that blocks access to booking/listing if KYC is not submitted. Shows prompt to complete KYC. |

---

### Hooks (`src/hooks/`)

| File | What it does |
|------|-------------|
| `useVehicleSearch.js` | Fetches all vehicles from backend, merges with static demo data, applies all filters (city, type, price, fuel, tags, time window). Returns filtered results. |
| `useVehicleById.js` | Fetches a single vehicle by ID. Handles static demo IDs (1–9), MongoDB ObjectIds (24-char hex), and offline local IDs. |
| `useSocket.js` | Connects to Socket.io server with user's auth token. Returns the socket instance for real-time events. |

---

### Services (`src/services/api.js`)
Single file with all API call functions. Each function is a named export like `apiLogin`, `apiCreateBooking`, etc. Uses `fetch` with JWT token from `localStorage`. Admin functions use a separate `getAdminToken()` helper that reads from `ws_admin` key.

---

### Static Data (`src/data/`)

| File | What it does |
|------|-------------|
| `vehicles.js` | 9 hardcoded demo vehicles (bikes and cars) shown on the search page even when no real vehicles are listed. Used as fallback. |
| `cities.js` | List of Indian cities with state names used in the location picker. |

---

## 6. Backend — Every File Explained

### `index.js` (root)
Server entry point. Creates the Express app, attaches Socket.io to the HTTP server, connects to MongoDB, and starts listening on port 5000.

### `src/app.js`
Configures Express middleware (CORS, JSON body parser, static file serving) and registers all route files under `/api/*` prefix. Has a catch-all 404 handler at the bottom.

---

### Routes (`src/routes/`)

| File | Base Path | What it handles |
|------|-----------|----------------|
| `auth.js` | `/api/auth` | Signup, login, admin login, create admin |
| `user.js` | `/api/users` | Get current user profile, update profile, submit KYC |
| `vehicles.js` | `/api/vehicles` | CRUD for vehicles, toggle availability, toggle live status |
| `bookings.js` | `/api/bookings` | Create booking, get my bookings, owner bookings, accept/reject/complete/cancel/rate |
| `admin.js` | `/api/admin` | Stats, user management, KYC management, vehicle management |
| `chats.js` | `/api/chats` | Get chats, get messages, send message |
| `notifications.js` | `/api/notifications` | Get notifications, mark read, mark all read |
| `reviews.js` | `/api/reviews` | Create review, get owner reviews, get vehicle reviews |
| `upload.js` | `/api/upload` | Upload up to 8 images using Multer, returns URLs |
| `dev.js` | `/api/dev` | Development-only helpers (reset users, fix vehicles). Disabled in production. |

---

### Controllers (`src/controllers/`)

#### `authController.js`
- `signup` — validates email/phone, hashes password, creates User, returns JWT
- `login` — finds user by email or phone, compares password, returns JWT + user data
- `adminLogin` — same as login but checks `role === 'admin'`
- `createAdmin` — bootstrap endpoint to create the first admin account

#### `vehicleController.js`
- `getAllVehicles` — returns all vehicles with optional city/type filters. Used by the search page.
- `getMyVehicles` — returns only the logged-in owner's vehicles
- `getVehicleById` — returns one vehicle by MongoDB `_id`
- `createVehicle` — creates a new vehicle listing, sets `ownerId` from JWT
- `updateVehicle` — updates vehicle fields, checks ownership
- `deleteVehicle` — soft-deletes (or hard-deletes) a vehicle
- `toggleAvailability` — flips `isAvailable` boolean
- `toggleLive` — flips `isLive` boolean (makes vehicle show as "Available Now")

#### `bookingController.js`
- `createBooking` — creates booking, sets `userId`, `ownerId`, `vehicleId`, calculates total, creates a Chat room and Notification
- `getMyBookings` — returns all bookings where `userId` matches logged-in user, populates vehicle info
- `getOwnerBookings` — returns all bookings where `ownerId` matches, populates renter info
- `getBookingById` — returns one booking with full populated data
- `acceptBooking` — owner accepts, status → `confirmed`, sends notification to renter
- `rejectBooking` — owner rejects, status → `cancelled`, sends notification
- `cancelBooking` — renter cancels, status → `cancelled`
- `completeBooking` — marks trip as `completed`, updates vehicle `isCurrentlyBooked = false`
- `rateBooking` — renter leaves star rating + review text on a completed booking

#### `adminController.js`
- `getStats` — counts total/active/banned users, KYC counts
- `getUsers` — paginated user list with search and status filter
- `getUserDetail` — full user profile + their vehicles + their bookings (as renter and owner) + earnings summary
- `toggleBan` — flips `isActive` on a user (ban/unban)
- `deleteUser` — permanently deletes a user (cannot delete admins)
- `getVehicles` — returns all vehicles for admin review

#### `kycController.js`
- `getKycRequests` — returns users filtered by KYC status (pending/verified/rejected)
- `getKycStats` — counts per status
- `getKycDetail` — full KYC data for one user including document URLs
- `updateKycStatus` — admin approves or rejects KYC, saves reason if rejected

#### `chatController.js`
- `getMyChats` — returns all chats where user is a participant
- `getChatByBooking` — finds or creates a chat room for a booking
- `getMessages` — returns all messages in a chat
- `sendMessage` — saves message to DB, emits Socket.io event to the other participant

#### `notificationController.js`
- `getNotifications` — returns all notifications for logged-in user, sorted newest first
- `markRead` — marks one notification as read
- `markAllRead` — marks all as read

#### `reviewController.js`
- `createReview` — creates a review linked to a vehicle and booking
- `getOwnerReviews` — reviews for vehicles owned by logged-in user
- `getMyReviews` — reviews written by logged-in user
- `getVehicleReviews` — all reviews for a specific vehicle

---

### Middleware (`src/middleware/auth.js`)

Two functions exported:

- `protect` — verifies JWT from `Authorization: Bearer <token>` header. Attaches `req.user` to the request. Returns 401 if missing or invalid.
- `adminOnly` — checks `req.user.role === 'admin'`. Returns 403 if not admin. Used on all `/api/admin/*` routes.

---

## 7. Database Models

### User
```
name, email, phone, password (hashed), profileImage, role (user/admin),
isActive (ban flag), kyc { license, aadhaar, pan, status, rejectionReason }
```
- `password` has `select: false` — never returned in queries unless explicitly selected
- `email` and `phone` are both `sparse: true` — allows null but enforces uniqueness when set
- KYC is an embedded sub-document (not a separate collection)

### Vehicle
```
ownerId, type (bike/car), brand, model, year, fuel, seats,
city, area, address, landmark, lat, lng,
pricingType, dailyPrice, hourlyPrice, isDailyEnabled,
weeklyDiscount, monthlyDiscount, deposit,
photos [{ url, public_id }], description, features [],
availableDays [], availableDates [], startTime, endTime,
instantBook, blockedDates [], isAvailable, isLive,
isCurrentlyBooked, bookingType, ownerListingType, status
```
- `ownerListingType: 'personal'` → date-based availability, hourly pricing
- `ownerListingType: 'business'` → day-based availability, daily + hourly pricing
- `status: 'pending'` by default — admin must approve before it appears in search

### Booking
```
userId (renter), vehicleId, ownerId,
startDate, endDate, startTime, endTime, days,
subtotal, addonsTotal, insurance, serviceFee, total,
addons [], status (pending/confirmed/active/completed/cancelled),
vehicleSnapshot { name, image, city, area, type, price },
rating { stars, review, createdAt }
```
- `vehicleSnapshot` stores a copy of vehicle info at booking time so it's preserved even if the vehicle is deleted later

### Chat
```
bookingId (unique — one chat per booking),
participants [userId, ownerId],
lastMessage { text, senderId, createdAt },
renterId, ownerId
```

### Message
```
chatId, senderId, text, createdAt
```

### Notification
```
recipientId, senderId, type, title, body, bookingId, isRead, data
```
- Types: `booking_request`, `booking_accepted`, `booking_rejected`, `booking_cancelled`, `new_message`, `booking_completed`

### Review
```
vehicleId, bookingId, reviewerId, ownerId, stars, comment, createdAt
```

---

## 8. API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | None | Register new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| POST | `/api/auth/admin-login` | None | Admin login |
| POST | `/api/auth/create-admin` | None | Bootstrap admin account |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | User JWT | Get own profile |
| PATCH | `/api/users/profile` | User JWT | Update name/email/phone/photo |
| PATCH | `/api/users/kyc` | User JWT | Submit KYC documents |

### Vehicles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/vehicles` | None | Get all vehicles (search) |
| GET | `/api/vehicles/my` | User JWT | Get owner's vehicles |
| GET | `/api/vehicles/:id` | None | Get one vehicle |
| POST | `/api/vehicles` | User JWT | Create listing |
| PATCH | `/api/vehicles/:id` | User JWT | Update listing |
| DELETE | `/api/vehicles/:id` | User JWT | Delete listing |
| PATCH | `/api/vehicles/:id/availability` | User JWT | Toggle available on/off |
| PATCH | `/api/vehicles/:id/live` | User JWT | Toggle live/offline |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | User JWT | Create booking |
| GET | `/api/bookings/my` | User JWT | My bookings (as renter) |
| GET | `/api/bookings/owner` | User JWT | Bookings received (as owner) |
| GET | `/api/bookings/:id` | User JWT | Get one booking |
| PATCH | `/api/bookings/:id/accept` | User JWT | Owner accepts |
| PATCH | `/api/bookings/:id/reject` | User JWT | Owner rejects |
| PATCH | `/api/bookings/:id/cancel` | User JWT | Renter cancels |
| PATCH | `/api/bookings/:id/complete` | User JWT | Mark completed |
| PATCH | `/api/bookings/:id/rate` | User JWT | Leave rating |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin JWT | Dashboard stats |
| GET | `/api/admin/users` | Admin JWT | All users (paginated) |
| GET | `/api/admin/users/:id` | Admin JWT | Full user detail |
| PATCH | `/api/admin/users/:id/ban` | Admin JWT | Ban/unban user |
| DELETE | `/api/admin/users/:id` | Admin JWT | Delete user |
| GET | `/api/admin/kyc` | Admin JWT | KYC requests |
| PATCH | `/api/admin/kyc/:id` | Admin JWT | Approve/reject KYC |
| GET | `/api/admin/vehicles` | Admin JWT | All vehicles |

---

## 9. Feature Walkthroughs

### How a Renter Books a Vehicle

1. User visits `/` (landing page) and clicks "Find a Ride"
2. `LocationModal` appears if no city is saved — user picks their city
3. User lands on `/rent` (SearchPage)
4. `useVehicleSearch` hook fetches all vehicles from `GET /api/vehicles`, merges with 9 static demo vehicles
5. Filters are applied: city match, type, price range, fuel, tags, time window (for personal listings)
6. User clicks a `VehicleCard` → navigates to `/vehicle/:id`
7. `useVehicleById` hook fetches vehicle detail from `GET /api/vehicles/:id`
8. User sees gallery, specs, owner info, reviews, and the `BookingPanel`
9. `BookingPanel` shows price (hourly/daily or both), availability window, "Available Now" badge if `isLive = true`
10. User clicks "Book Now" → navigates to `/book/:id`
11. `KycGuard` checks if user has submitted KYC — if not, shows prompt
12. `BookingPage` shows 3-step wizard:
    - **Step 1 (Schedule):** For personal vehicles — fixed date (today), pick pickup/return time within owner's window, minimum 2 hours. For business — date range picker + time slots.
    - **Step 2 (Add-ons):** Optional extras (insurance ₹199/day, helmet ₹49/day, GPS ₹99/trip, etc.)
    - **Step 3 (Review):** Full price breakdown — subtotal + add-ons + insurance (₹99) + service fee (8%)
13. User confirms → `POST /api/bookings` is called
14. Backend creates Booking, creates a Chat room, sends notification to owner
15. User sees `BookingConfirmed` screen with booking ID
16. User can view booking at `/booking/:id` — shows Flipkart-style status tracker

---

### How an Owner Lists a Vehicle

1. Owner goes to `/list` (guarded by KycGuard)
2. `ListVehiclePage` shows 4-step wizard:
    - **Step 1 (Photos):** Upload vehicle photos
    - **Step 2 (Details):** Brand, model, year, fuel, city, address, features (helmet, AC, GPS, etc.), listing type (Personal/Business)
    - **Step 3 (Pricing):** For Personal — hourly price required, daily price optional toggle. For Business — both hourly and daily required. Discount sliders for weekly/monthly.
    - **Step 4 (Availability):** For Personal — compact calendar popup, multi-date selection, time window. For Business — Mon–Sun day buttons, time window. Both have: advance notice, booking preference (instant/advance/both), Instant Book toggle, Go Live toggle.
3. Owner clicks "Submit Listing" → `POST /api/vehicles`
4. Vehicle is created with `status: 'pending'` — admin must approve it
5. Owner can see it in `/my-vehicles`

---

### How the Booking Status Flow Works

```
pending → confirmed (owner accepts) → active (trip starts) → completed
       ↘ cancelled (owner rejects or renter cancels)
```

- When booking is `pending`: owner sees it in "Booking Requests" with Accept/Reject buttons
- When `confirmed`: renter gets notification, can see pickup details
- When `completed`: renter can leave a star rating + review
- Each status change triggers a Notification to the other party

---

### How Real-Time Chat Works

1. When a booking is created, `bookingController.createBooking` also creates a `Chat` document with `bookingId`, `renterId`, `ownerId`
2. Both users can open the chat at `/chat/:bookingId`
3. `ChatPage` connects to Socket.io via `useSocket` hook
4. When a message is sent: saved to DB via `POST /api/chats/:chatId/messages`, then emitted via Socket.io to the recipient's room
5. Recipient receives the message in real-time without refreshing

---

### How KYC Works

1. User goes to `/profile` and uploads Driving License, Aadhaar, PAN card images
2. `PATCH /api/users/kyc` saves the image URLs to `user.kyc`
3. `KycGuard` component checks `user.kyc.status` — if not `verified`, blocks booking/listing
4. Admin goes to `/admin2/kyc` → sees all pending KYC requests
5. Admin clicks a user → opens `KycDetailModal` with document images
6. Admin clicks Approve → `PATCH /api/admin/kyc/:id` sets `status: 'verified'`
7. User can now book and list vehicles

---

### How the Location System Works

1. On first visit, `LocationContext` checks `localStorage` for `userLocation`
2. If not found, `LocationModal` is shown — user picks city from a dropdown of Indian cities
3. Selected `{ city, state, lat, lng }` is saved to `localStorage` and React context
4. `SearchPage` reads the city from context and pre-fills the city filter
5. `DashboardPage` shows a location pill in the topbar
6. User can change city anytime by clicking the location pill

---

### How the Role System Works

1. A single user account can act as both Owner and Renter
2. `RoleContext` stores the current role (`owner` or `renter`) in `localStorage`
3. `Sidebar` shows different menu items based on role:
   - Owner: Dashboard, My Vehicles, Booking Requests, Earnings, List Vehicle
   - Renter: Dashboard, Find a Ride, My Bookings, Chat
4. `VehicleCard` shows "Your listing" badge and "Manage →" button if the viewer is the owner
5. Owners cannot book their own vehicles (checked in `BookingPanel` and `BookingPage`)

---

## 10. Admin Panel

The admin panel is a completely separate mini-app living under `/admin2/*`. It has its own:
- Shell layout (`AdminShell.jsx`) with dark sidebar
- State management (`AdminStore.jsx`) separate from the main app
- Auth stored in `localStorage` key `ws_admin`

### Admin Pages

| Page | Route | What it does |
|------|-------|-------------|
| Login | `/admin2/login` | Admin-only login form |
| Dashboard | `/admin2` | Stats cards, KYC alert, revenue chart, recent users, recent vehicles |
| KYC Requests | `/admin2/kyc` | Table of all KYC submissions. Approve/Reject with modal showing documents. |
| Users | `/admin2/users` | Full user list with search, filter by status. Click any row to open detail page. |
| User Detail | `/admin2/users/:id` | 5-tab profile: Profile info + Admin Actions, Vehicles, Bookings (as renter + owner), Earnings, KYC documents |
| Vehicles | `/admin2/vehicles` | All listed vehicles. Approve/reject listings. |
| Earnings | `/admin2/earnings` | Platform earnings overview. |

### Admin Actions Available
- Ban / Unban any user
- Delete any user account (cannot delete admins)
- Approve / Reject KYC documents
- View all vehicles listed by a user
- View all bookings made by or received by a user
- See total earnings and spending per user

---

## 11. Key Design Decisions

### Why two listing types (Personal vs Business)?
Personal owners rent their own vehicle occasionally — they need date-specific availability (e.g., "available April 9 and 10 only"). Business owners have a fleet and are available every Monday–Friday. These are fundamentally different availability models.

### Why store `vehicleSnapshot` in Booking?
If a vehicle is deleted or edited after a booking is made, the booking should still show the original vehicle name, image, and price. The snapshot preserves this.

### Why `localStorage` fallback in VehicleStoreContext?
The app should work even when the backend is temporarily offline. Vehicles are saved locally and synced when the server comes back. This is the offline-first pattern.

### Why `sparse: true` on email and phone in User model?
Some users might sign up with only email (no phone) or only phone (no email). `sparse: true` allows multiple documents to have `null` for that field while still enforcing uniqueness for non-null values.

### Why is `password` field `select: false`?
Security. By default, every `User.find()` query will NOT include the password hash. You have to explicitly do `.select('+password')` to get it — which only happens in the login controller.

### Why does the frontend use `user.id` vs `user._id`?
MongoDB returns `_id`. The `AdminStore` normalizes it to `id: u._id` for convenience. The `AdminUserDetail` page uses `useParams()` to get the ID from the URL and passes it directly to the API — so it always uses the raw MongoDB `_id` string.

### Why Socket.io for chat instead of polling?
Polling (repeatedly asking "any new messages?") wastes bandwidth and adds latency. Socket.io keeps a persistent connection open so messages arrive instantly without the client asking.

---

## 12. Credentials & Defaults

### Admin Account
```
Email:    admin@wheelshare.com
Password: admin123
URL:      http://localhost:5173/admin2/login
```

### Default Ports
```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
MongoDB:   mongodb://localhost:27017/wheelshare
```

### Environment Variables (wheelshare-server/.env)
```
MONGO_URI=mongodb://localhost:27017/wheelshare
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

### localStorage Keys Used by Frontend
| Key | What it stores |
|-----|---------------|
| `ws_user` | `{ token, id, name, email, role, kyc }` — logged-in user |
| `ws_admin` | `{ token, name, email }` — logged-in admin |
| `ws_role` | `"owner"` or `"renter"` — current active role |
| `userLocation` | `{ city, state, lat, lng }` — selected city |
| `ws_vehicles_<userId>` | Owner's vehicles (offline cache) |
| `ws_marketplace_vehicles` | All marketplace vehicles (offline cache) |

---

*This document covers 100% of the WheelShare codebase. Every file, every model, every API endpoint, and every feature flow is explained above.*
