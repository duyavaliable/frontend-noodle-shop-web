import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../style/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle menu trên thiết bị di động
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Kiểm tra quyền để hiển thị menu phù hợp
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Bán Mì</h2>
          <button className="close-menu" onClick={toggleMenu}>×</button>
        </div>
        
        <div className="user-info">
          <div className="avatar">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <p className="username">{currentUser?.username || 'User'}</p>
            <p className="role">{currentUser?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</p>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <ul>
            <li>
              <Link to="/admin/dashboard">
                <span className="icon">📊</span>
                Tổng quan
              </Link>
            </li>
            
            <li>
              <Link to="/categories">
                <span className="icon">📋</span>
                Quản lý danh mục
              </Link>
            </li>
            
            <li>
              <Link to="/products">
                <span className="icon">🍜</span>
                Quản lý sản phẩm
              </Link>
            </li>
            
            <li>
              <Link to="/orders">
                <span className="icon">📦</span>
                Quản lý đơn hàng
              </Link>
            </li>
            
            {isAdmin && (
              <li>
                <Link to="/users">
                  <span className="icon">👥</span>
                  Quản lý người dùng
                </Link>
              </li>
            )}
            
            <li>
              <Link to="/settings">
                <span className="icon">⚙️</span>
                Cài đặt
              </Link>
            </li>
            
            <li>
              <button onClick={handleLogout} className="logout-button">
                <span className="icon">🚪</span>
                Đăng xuất
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="main-content">
        <header className="dashboard-header">
          <button className="menu-toggle" onClick={toggleMenu}>☰</button>
          <h1>Bảng điều khiển</h1>
        </header>
        
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Xin chào, {currentUser?.username || 'User'}!</h2>
            <p>Chào mừng đến với hệ thống quản lý Bán Mì.</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Tổng số đơn hàng</h3>
              <p className="stat-value">0</p>
            </div>
            
            <div className="stat-card">
              <h3>Sản phẩm</h3>
              <p className="stat-value">0</p>
            </div>
            
            <div className="stat-card">
              <h3>Danh mục</h3>
              <p className="stat-value">0</p>
            </div>
            
            <div className="stat-card">
              <h3>Doanh thu</h3>
              <p className="stat-value">0₫</p>
            </div>
          </div>
          
          <div className="quick-actions">
            <h3>Thao tác nhanh</h3>
            <div className="action-buttons">
              <Link to="/categories" className="action-button">
                <span className="action-icon">📋</span>
                Quản lý danh mục
              </Link>
              <Link to="/products" className="action-button">
                <span className="action-icon">🍜</span>
                Quản lý sản phẩm
              </Link>
              <Link to="/orders" className="action-button">
                <span className="action-icon">📦</span>
                Quản lý đơn hàng
              </Link>
              {isAdmin && (
                <Link to="/users" className="action-button">
                  <span className="action-icon">👥</span>
                  Quản lý người dùng
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;