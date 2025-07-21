import React, {useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext,AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Category from './pages/Category';
import Products from './pages/Products';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrdersSuccsess';
import Menu from './pages/Menu';


// // Protected Route component (chi cho phep user da dang nhap truy cap)
// const ProtectedRoute = ({ children }) => {
//   const { currentUser, loading } = useContext(AuthContext);
  
//   if (loading) {
//     return <div>Loading...</div>;
//   }
  
//   if (!currentUser) {
//     return <Navigate to="/login" />;
//   }
  
//   return children;
// };

// User Route component (chi cho phep nguoi dung thuong truy cap)
const UserRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser || currentUser.role !== 'user') {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin or Staff Route component (chi cho phep admin hoac staff truy cap)
const AdminOrStaffRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Hàm điều hướng dựa vào role của user
const HomeRedirect = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) return <UserDashboard />;

  if (currentUser.role === 'admin' || currentUser.role === 'staff') {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <Navigate to="/dashboard" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin/signup" element={<SignUp />} />
          <Route path="/staff/signup" element={<SignUp />} />

          {/* Public Routes */}
          <Route path="/menu" element={<Menu />} />

          {/* Protected Routes for Admin and Staff */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminOrStaffRoute>
                <AdminDashboard />
              </AdminOrStaffRoute>
            }
          />

          <Route 
            path="/categories" 
            element={
              <AdminOrStaffRoute>
                <Category />
              </AdminOrStaffRoute>
            } 
          />

          <Route 
            path="/products" 
            element={
              <AdminOrStaffRoute>
                <Products />
              </AdminOrStaffRoute>
            } 
          />
          
          {/* Protected Routes for Regular Users */}
          <Route 
            path="/dashboard" 
            element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            }
          />

          <Route path="/cart" element={<Cart />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          <Route 
            path="/user/orders" 
            element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            }
          />

          <Route 
            path="/user/profile" 
            element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;