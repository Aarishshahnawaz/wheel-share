import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SearchPage from './pages/SearchPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/payment/PaymentPage';
import ListVehiclePage from './pages/list/ListVehiclePage';
import MyVehiclesPage from './pages/list/MyVehiclesPage';
import EditVehiclePage from './pages/list/EditVehiclePage';
import TrackingPage from './pages/tracking/TrackingPage';
import EarningsPage from './pages/owner/EarningsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReviewsPage from './pages/ReviewsPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/chat/ChatPage';
import ChatsListPage from './pages/chat/ChatsListPage';
import KycGuard from './components/KycGuard';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminKycPage from './pages/admin/AdminKycPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminKyc from './admin/pages/AdminKyc';
import AdminUsers from './admin/pages/AdminUsers';
import AdminUserDetail from './admin/pages/AdminUserDetail';
import AdminVehicles from './admin/pages/AdminVehicles';
import AdminEarnings from './admin/pages/AdminEarnings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rent"     element={<KycGuard action="rent"><SearchPage /></KycGuard>} />
        <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
        <Route path="/book/:id" element={<KycGuard action="book"><BookingPage /></KycGuard>} />
        <Route path="/pay/:id"  element={<PaymentPage />} />
        <Route path="/list"     element={<KycGuard action="list"><ListVehiclePage /></KycGuard>} />
        <Route path="/my-vehicles" element={<MyVehiclesPage />} />
        <Route path="/edit-vehicle/:id" element={<EditVehiclePage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bookings" element={<MyBookingsPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/booking/:id" element={<BookingDetailsPage />} />
        <Route path="/owner-bookings" element={<OwnerBookingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/chat" element={<ChatsListPage />} />
        <Route path="/chat/:bookingId" element={<ChatPage />} />
        {/* Old admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/kyc" element={<AdminKycPage />} />
        {/* New admin panel */}
        <Route path="/admin2/login"    element={<AdminLogin />} />
        <Route path="/admin2"          element={<AdminDashboard />} />
        <Route path="/admin2/kyc"      element={<AdminKyc />} />
        <Route path="/admin2/users"    element={<AdminUsers />} />
        <Route path="/admin2/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin2/vehicles" element={<AdminVehicles />} />
        <Route path="/admin2/earnings" element={<AdminEarnings />} />
      </Routes>
    </BrowserRouter>
  );
}
