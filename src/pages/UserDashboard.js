import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/api';
import '../style/UserDashboard.css';

const UserDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const DEFAULT_IMAGE = "./public/defaultimage.png";

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle menu trên thiết bị di động
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  //Format gia tien 
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  // Lấy danh sách sản phẩm khi component được mount 
  //lay 4 san pham bat ki trong co so du lieu
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        // Lấy tất cả sản phẩm
        const data = await productService.getAllProducts();
        // Lấy 4 sản phẩm đầu tiên để hiển thị
        setFeaturedProducts(data.slice(0, 4));
      } catch (err) {
        console.error("Không thể tải danh sách sản phẩm nổi bật:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);


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
              {loading ? (
              <div className="loading-indicator">Đang tải dữ liệu...</div>
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div className="product-card" key={product.id}>
                    <div className="product-image">
                      <img 
                        src={product.image_url || DEFAULT_IMAGE} 
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                    </div>
                    <h4>{product.name}</h4>
                    <p className="product-description">
                      {product.description || 'Không có mô tả'}
                    </p>
                    <p className="product-price">{formatPrice(product.price)}</p>
                    <Link to="/menu" className="view-menu-btn">Xem thực đơn</Link>
                  </div>
                ))
              ) : (
                <p>Không có món ăn nào.</p>
              )}
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