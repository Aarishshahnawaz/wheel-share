# 🚗 WheelShare - Peer-to-Peer Vehicle Rental Platform

A modern, full-stack vehicle rental marketplace that connects vehicle owners with renters. Built with React, Node.js, MongoDB, and Socket.io for real-time features.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://wheel-share-z5wy.vercel.app/)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-18+-green)
![React](https://img.shields.io/badge/React-19-blue)

## 🌐 Live Demo

**🚀 [View Live Application](https://wheel-share-z5wy.vercel.app/)**

Try it out:
- Browse vehicles
- Create an account
- List your vehicle
- Book a ride

**Admin Panel**: [https://wheel-share-z5wy.vercel.app/admin2/login](https://wheel-share-z5wy.vercel.app/admin2/login)
```
Email: admin@wheelshare.com
Password: admin123
```

## 🌟 Features

### For Renters
- 🔍 **Smart Search** - Find vehicles by location, type, and price
- 📅 **Easy Booking** - Simple booking flow with date selection
- 💬 **Real-time Chat** - Communicate with vehicle owners
- ⭐ **Reviews & Ratings** - Read and write reviews
- 📱 **Responsive Design** - Works on all devices

### For Vehicle Owners
- 📝 **List Vehicles** - Easy vehicle listing with photo upload
- 💰 **Earnings Dashboard** - Track your income and bookings
- 🔔 **Notifications** - Real-time booking notifications
- 📊 **Analytics** - View performance metrics
- ✅ **Booking Management** - Accept/reject booking requests

### For Admins
- 👥 **User Management** - Manage users and permissions
- 🚗 **Vehicle Oversight** - Monitor all listed vehicles
- 📋 **KYC Verification** - Verify user documents
- 📈 **Platform Analytics** - View platform-wide statistics
- 💵 **Revenue Tracking** - Monitor platform earnings

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

### DevOps & Deployment
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **AWS EKS** - Cloud hosting
- **Vercel** - Frontend hosting
- **GitHub Actions** - CI/CD
- **Prometheus & Grafana** - Monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Aarishshahnawaz/wheel-share.git
cd wheel-share
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd wheelshare-server
npm install

# Install frontend dependencies
cd ../wheelshare-client
npm install
```

3. **Configure environment variables**

Backend `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/wheelshare
JWT_SECRET=your_jwt_secret_here
ADMIN_SECRET=your_admin_secret_here
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start the application**

```bash
# Start backend (from wheelshare-server directory)
npm run dev

# Start frontend (from wheelshare-client directory)
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:5173/admin2/login

### Default Admin Credentials
```
Email: admin@wheelshare.com
Password: admin123
```

## 📦 Deployment

### Deploy to Vercel (Frontend)

```bash
cd wheelshare-client
vercel --prod
```

Set environment variable in Vercel:
- `VITE_API_URL`: Your backend API URL

### Deploy to Render (Backend)

1. Connect your GitHub repository
2. Select `wheelshare-server` directory
3. Set environment variables
4. Deploy

### Deploy to AWS EKS (Full Stack)

```bash
cd k8s
kubectl apply -f secrets.yaml
kubectl apply -f mongo-pvc.yaml
kubectl apply -f mongo-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

See [k8s/README.md](k8s/README.md) for detailed instructions.

## 🏗️ Project Structure

```
wheel-share/
├── wheelshare-client/          # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── admin/              # Admin panel
│   │   └── App.jsx             # Main app component
│   ├── public/                 # Static assets
│   └── package.json
│
├── wheelshare-server/          # Node.js backend
│   ├── src/
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Custom middleware
│   │   └── app.js              # Express app
│   ├── uploads/                # Uploaded files
│   ├── index.js                # Server entry point
│   └── package.json
│
├── k8s/                        # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongo-deployment.yaml
│   └── ...
│
└── docker-compose.yml          # Docker Compose config
```

## 🔑 Key Features Implementation

### Real-time Chat
- Socket.io for instant messaging
- Room-based chat per booking
- Online status indicators
- Message notifications

### File Upload
- Multer for handling multipart/form-data
- Image optimization
- Multiple file upload support
- Secure file storage

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Owner, Admin)
- Secure password hashing with bcrypt
- Token expiration and refresh

### KYC Verification
- Document upload (ID, License, etc.)
- Admin review workflow
- Status tracking (Pending, Approved, Rejected)
- Image zoom for document verification

### Payment Integration Ready
- Booking cost calculation
- Earnings tracking
- Commission management
- Payment history

## 📊 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/vehicles` - Create vehicle listing
- `PATCH /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user bookings
- `GET /api/bookings/owner` - Get owner bookings
- `PATCH /api/bookings/:id/accept` - Accept booking
- `PATCH /api/bookings/:id/reject` - Reject booking

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/kyc` - KYC submissions
- `PATCH /api/admin/kyc/:id` - Update KYC status

See full API documentation in [API.md](docs/API.md)

## 🧪 Testing

```bash
# Run backend tests
cd wheelshare-server
npm test

# Run frontend tests
cd wheelshare-client
npm test
```

## 🔒 Security

- Environment variables for sensitive data
- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aarish Shahnawaz**
- GitHub: [@Aarishshahnawaz](https://github.com/Aarishshahnawaz)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Socket.io for real-time capabilities
- Tailwind CSS for the utility-first CSS framework

## 📞 Support

For support, email aarishaps2003@gmail.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Vehicle insurance integration
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Social media login
- [ ] Vehicle tracking (GPS)

---

Made with ❤️ by Aarish Shahnawaz
