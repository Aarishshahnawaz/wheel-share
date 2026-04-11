export const MOCK_STATS = {
  totalUsers: 52840,
  totalVehicles: 12430,
  totalBookings: 89210,
  platformEarnings: 4821600,
  monthlyGrowth: { users: 12.4, vehicles: 8.7, bookings: 18.2, earnings: 22.1 },
};

export const MONTHLY_EARNINGS = [
  { month: 'Oct', amount: 312000 },
  { month: 'Nov', amount: 428000 },
  { month: 'Dec', amount: 389000 },
  { month: 'Jan', amount: 521000 },
  { month: 'Feb', amount: 614000 },
  { month: 'Mar', amount: 782000 },
];

export const MOCK_USERS = [
  { id: 'u1', name: 'Priya Sharma',   email: 'priya@example.com',  phone: '9876543210', city: 'Mumbai',    role: 'user',  status: 'active',   kycStatus: 'pending',  joinedAt: '2026-01-15', bookings: 8,  vehicles: 0 },
  { id: 'u2', name: 'Arjun Mehta',    email: 'arjun@example.com',  phone: '9123456780', city: 'Delhi',     role: 'user',  status: 'active',   kycStatus: 'verified', joinedAt: '2026-01-20', bookings: 3,  vehicles: 2 },
  { id: 'u3', name: 'Sneha Reddy',    email: 'sneha@example.com',  phone: '9988776655', city: 'Bangalore', role: 'user',  status: 'active',   kycStatus: 'verified', joinedAt: '2026-02-01', bookings: 12, vehicles: 1 },
  { id: 'u4', name: 'Vikram Tiwari',  email: 'vikram@example.com', phone: '9001122334', city: 'Delhi',     role: 'user',  status: 'banned',   kycStatus: 'rejected', joinedAt: '2026-02-10', bookings: 1,  vehicles: 0 },
  { id: 'u5', name: 'Ananya Bose',    email: 'ananya@example.com', phone: '9876001234', city: 'Bangalore', role: 'user',  status: 'active',   kycStatus: 'pending',  joinedAt: '2026-02-18', bookings: 5,  vehicles: 1 },
  { id: 'u6', name: 'Rohit Kulkarni', email: 'rohit@example.com',  phone: '9765432100', city: 'Pune',      role: 'user',  status: 'active',   kycStatus: 'pending',  joinedAt: '2026-03-01', bookings: 0,  vehicles: 0 },
  { id: 'u7', name: 'Meera Patel',    email: 'meera@example.com',  phone: '9654321098', city: 'Hyderabad', role: 'user',  status: 'inactive', kycStatus: 'verified', joinedAt: '2026-03-05', bookings: 7,  vehicles: 3 },
  { id: 'u8', name: 'Karthik Nair',   email: 'karthik@example.com',phone: '9543210987', city: 'Chennai',   role: 'user',  status: 'active',   kycStatus: 'verified', joinedAt: '2026-03-10', bookings: 15, vehicles: 2 },
];

export const MOCK_VEHICLES = [
  { id: 'v1', name: 'Royal Enfield Classic 350', type: 'bike', owner: 'Arjun Mehta',    city: 'Mumbai',    price: 699,  status: 'approved', bookings: 34, earnings: 28420, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80' },
  { id: 'v2', name: 'Maruti Swift Dzire',         type: 'car',  owner: 'Sneha Reddy',    city: 'Bangalore', price: 1299, status: 'approved', bookings: 21, earnings: 32180, image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=300&q=80' },
  { id: 'v3', name: 'Honda Activa 6G',            type: 'bike', owner: 'Ananya Bose',    city: 'Bangalore', price: 299,  status: 'pending',  bookings: 0,  earnings: 0,     image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300&q=80' },
  { id: 'v4', name: 'Hyundai Creta',              type: 'car',  owner: 'Meera Patel',    city: 'Hyderabad', price: 2199, status: 'approved', bookings: 18, earnings: 47120, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&q=80' },
  { id: 'v5', name: 'Bajaj Pulsar NS200',         type: 'bike', owner: 'Rohit Kulkarni', city: 'Pune',      price: 499,  status: 'pending',  bookings: 0,  earnings: 0,     image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=300&q=80' },
  { id: 'v6', name: 'Tata Nexon EV',              type: 'car',  owner: 'Karthik Nair',   city: 'Chennai',   price: 1799, status: 'approved', bookings: 12, earnings: 25840, image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&q=80' },
  { id: 'v7', name: 'KTM Duke 390',               type: 'bike', owner: 'Arjun Mehta',    city: 'Delhi',     price: 899,  status: 'removed',  bookings: 5,  earnings: 5120,  image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&q=80' },
];

export const MOCK_KYC = [
  { id: 'u1', name: 'Priya Sharma',   email: 'priya@example.com',  phone: '9876543210', kycStatus: 'pending',  license: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', aadhaar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', submittedAt: '2026-03-28' },
  { id: 'u5', name: 'Ananya Bose',    email: 'ananya@example.com', phone: '9876001234', kycStatus: 'pending',  license: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400', aadhaar: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400', submittedAt: '2026-03-27' },
  { id: 'u6', name: 'Rohit Kulkarni', email: 'rohit@example.com',  phone: '9765432100', kycStatus: 'pending',  license: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400', aadhaar: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', submittedAt: '2026-03-26' },
  { id: 'u3', name: 'Sneha Reddy',    email: 'sneha@example.com',  phone: '9988776655', kycStatus: 'verified', license: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400', aadhaar: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400', submittedAt: '2026-02-20' },
  { id: 'u4', name: 'Vikram Tiwari',  email: 'vikram@example.com', phone: '9001122334', kycStatus: 'rejected', license: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400', aadhaar: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400', submittedAt: '2026-02-15', rejectionReason: 'Blurry document image' },
];
