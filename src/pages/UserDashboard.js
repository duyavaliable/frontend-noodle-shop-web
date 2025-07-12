import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../style/UserDashboard.css';

const UserDashboard = () => {
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
            <p className="role">Khách hàng</p>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <ul>
            <li>
              <Link to="/user/dashboard">
                <span className="icon">📊</span>
                Trang chủ
              </Link>
            </li>
            
            <li>
              <Link to="/menu">
                <span className="icon">🍜</span>
                Thực đơn
              </Link>
            </li>
            
            <li>
              <Link to="/cart">
                <span className="icon">🛒</span>
                Giỏ hàng
              </Link>
            </li>
            
            <li>
              <Link to="/user/orders">
                <span className="icon">📦</span>
                Đơn hàng của tôi
              </Link>
            </li>
            
            <li>
              <Link to="/user/profile">
                <span className="icon">👤</span>
                Thông tin cá nhân
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
          <h1>Trang chủ</h1>
        </header>
        
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Xin chào, {currentUser?.username || 'User'}!</h2>
            <p>Chào mừng đến với Bán Mì. Chúng tôi rất vui khi được phục vụ bạn.</p>
          </div>
          
          <div className="featured-products">
            <h3>Món ăn nổi bật</h3>
            <div className="product-grid">
              <div className="product-card">
                <div className="product-image">🍜</div>
                <h4>Mì bò</h4>
                <p className="product-description">Mì với thịt bò hầm chín mềm và nước dùng đậm đà</p>
                <p className="product-price">50.000₫</p>
                <Link to="/menu" className="view-menu-btn">Xem thực đơn</Link>
              </div>
              
              <div className="product-card">
                <div className="product-image">🍜</div>
                <h4>Mì hải sản</h4>
                <p className="product-description">Mì với tôm, mực và các loại hải sản tươi ngon</p>
                <p className="product-price">60.000₫</p>
                <Link to="/menu" className="view-menu-btn">Xem thực đơn</Link>
              </div>
              
              <div className="product-card">
                <div className="product-image">🍜</div>
                <h4>Mì chay</h4>
                <p className="product-description">Mì với nấm và các loại rau củ hữu cơ</p>
                <p className="product-price">45.000₫</p>
                <Link to="/menu" className="view-menu-btn">Xem thực đơn</Link>
              </div>
              
              <div className="product-card">
                <div className="product-image">🥤</div>
                <h4>Trà đào</h4>
                <p className="product-description">Trà đào thơm mát với đào tươi và lá bạc hà</p>
                <p className="product-price">25.000₫</p>
                <Link to="/menu" className="view-menu-btn">Xem thực đơn</Link>
              </div>
            </div>
          </div>
          
          <div className="user-action-cards">
            <div className="action-card">
              <div className="action-icon">🛒</div>
              <h3>Đặt hàng ngay</h3>
              <p>Khám phá thực đơn đa dạng và đặt món bạn yêu thích</p>
              <Link to="/menu" className="action-btn">Xem thực đơn</Link>
            </div>
            
            <div className="action-card">
              <div className="action-icon">📦</div>
              <h3>Đơn hàng của tôi</h3>
              <p>Theo dõi trạng thái và lịch sử đơn hàng của bạn</p>
              <Link to="/user/orders" className="action-btn">Xem đơn hàng</Link>
            </div>
            
            <div className="action-card">
              <div className="action-icon">👤</div>
              <h3>Thông tin cá nhân</h3>
              <p>Cập nhật thông tin cá nhân và địa chỉ giao hàng</p>
              <Link to="/user/profile" className="action-btn">Cập nhật</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;