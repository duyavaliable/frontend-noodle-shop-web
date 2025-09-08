import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { productService } from '../services/api';
import '../style/Dashboard.css';

const UserDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const DEFAULT_IMAGE = "/defaultimage.png";

  // Xử lý đăng xuất
  const handleLogout = () => {
    if (currentUser) {
      logout();
    }
    navigate('/login');
  }
  
  //dong/mo dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  //Format gia tien 
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  //Xu ly khi nguoi dung chua dang nhap
  const handleOrderClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      alert("Vui lòng đăng nhập để đặt hàng.");
      navigate('/login');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      setSearchResults(null);
      return;
    }
    
    setLoading(true);
    try {
      const results = await productService.searchProducts({
        keyword: searchKeyword,
      });
      
      if (Array.isArray(results)) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  const clearSearch = () => {
      setSearchKeyword('');
      setSearchResults(null);
  };
  // Lấy danh sách sản phẩm khi component được mount 
  //lay 4 san pham bat ki trong co so du lieu
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getAllProducts();
        setFeaturedProducts(data.slice(0, 4));
      } catch (err) {
        console.error("Không thể tải danh sách sản phẩm nổi bật:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);

  // useEffect riêng cho việc xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.header-user-infor')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);


  return (
    <div className="dashboard-container">
      <header className="main-header">
        <div className="brand-section">
          <img src="/logoramen.jpg" alt="Logo" className="header-logo" />
          <h2>MewRamen</h2>

          <div className="location-wrapper">
            <img src="/locationlogo.png" alt="Vị trí" className="location-logo" />
            <span className="location-text">ĐỊA CHỈ: Hà Nội</span>
          </div>
        </div> 

        <div className="header-right">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              className="search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <button type="button" className="clear-search-icon" onClick={clearSearch}>
                &times;
              </button>
            )}
            </div>
            <button type="submit" className="search-btn">
              <img src="/searchlogo.png" alt="Tìm kiếm"/>
            </button> 
          </form>

          {currentUser ? (
            // Hiển thị thông tin người dùng nếu đã đăng nhập
            <div className="header-user-infor">
              <div className="avatar header-avatar"
                   onClick={toggleDropdown}
                   style={{ cursor: 'pointer'}}
                   >
                {currentUser?.username?.charAt(0).toUpperCase()}
              </div>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-divider"></div>
                  <Link to="/user/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <span className="dropdown-icon">👤</span>
                    <span className="dropdown-text">Thông tin cá nhân</span>
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-button">
                    <span className="dropdown-icon">🚪</span>
                    <span className="dropdown-text">Đăng xuất</span>
                  </button>
                </div>
                )}
            </div>
           ) : (
            // Hiển thị nút đăng ký và đăng nhập nếu chưa đăng nhập 
            <div className="header-auth-buttons">
              <Link to="/signup" className="header-auth-btn register-btn">Đăng ký</Link>
              <Link to="/login" className="header-auth-btn login-btn">Đăng nhập</Link>
            </div>
            )}
        </div>
      </header>

      <nav className="sidebar-menu">
        <ul>
          <li>
            <Link to="/dashboard">
              Trang chủ
            </Link>
          </li>
          
          <li>
            <Link to="/menu">
              Thực đơn
            </Link>
          </li>
          
          <li>
            <Link to="/cart" onClick={handleOrderClick}>
              Giỏ hàng {!currentUser && <span className="lock-icon">🔒</span>}
            </Link>
          </li>
          
          {currentUser && (
            <>
              <li>
                <Link to="/user/orders">
                  Đơn hàng của tôi
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      
    <div className="content-wrapper">
      <div className="main-content">
        <div className="dashboard-content">
          {searchResults !== null ? (
            <div className="search-results">
              <div className="search-results-header">
                <h3>
                  {searchResults.length > 0 
                    ? `Tìm thấy ${searchResults.length} kết quả cho "${searchKeyword}"` 
                    : `Không tìm thấy kết quả nào cho "${searchKeyword}"`}
                </h3>
              </div>
              
              <div className="product-grid">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
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
                      <Link to="/menu" className="view-menu-btn">
                        Xem thực đơn
                      </Link>
                    </div>
                  ))
                ) : (
                  <p>Không có sản phẩm nào phù hợp với từ khóa tìm kiếm.</p>
                )}
              </div>
            </div>
          ) : (
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
                      <Link to={currentUser ? "/menu" : "/login"} className="view-menu-btn">
                        {currentUser ? "Xem thực đơn" : "Đăng nhập để xem"}
                      </Link>
                    </div>
                  ))
                ) : (
                  <p>Không có món ăn nào.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  );
}

export default UserDashboard;