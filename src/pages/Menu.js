import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { productService, categoryService } from '../services/api';
import '../style/Menu.css';

const Menu = () => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const DEFAULT_IMAGE = "/defaultimage.png";
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartCount = useCallback(async () => {
    if (currentUser) {
      try {
        const response = await api.get(`/cart/user/${currentUser.userId}`);
        const cartData = response.data;
        
        // Tính tổng số lượng từ items trả về từ API
        const count = cartData.items?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartCount(count);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  }, [currentUser]);

  // Lấy danh sách sản phẩm và danh mục khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        setError('');
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    updateCartCount();
  }, [updateCartCount]);

  // Tim kiem
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
        category_id: selectedCategory !== 'all' ? selectedCategory : ''
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      setError('Không thể tìm kiếm sản phẩm.');
    } finally {
      setLoading(false);
    }
  };  


  // Sửa lại phần lọc sản phẩm
  const getDisplayProducts = () => {
    if (searchResults) {
      return searchResults;
    }

    return products.filter(product => {
      if (selectedCategory === 'all') {
        return true;
      }
      return product.category_id.toString() === selectedCategory;
    });
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setSearchResults(null);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product) => {
    try {
      if (currentUser) {
      
        // Gọi API để thêm vào giỏ hàng
        await api.post(`/cart/user/${currentUser.userId}/items`, {
          productId: product.id,
          quantity: 1
        });
        // Cập nhật số lượng sản phẩm trong giỏ hàng
        updateCartCount();
        
        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
      } else {
        alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <h1 className="menu-title">Thực đơn</h1>
        <div className="menu-nav">
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') ? (
            <>
              <Link to="/admin/dashboard" className="menu-nav-link"> Trang chủ</Link>
              <Link to="/admin/orders" className="menu-nav-link">Quản lý đơn hàng</Link>
              <Link to="/products" className="menu-nav-link">Quản lý sản phẩm</Link>
              <Link to="/categories" className="menu-nav-link">Quản lý danh mục</Link>
            </>
          ) : (
            <>
              <Link to={currentUser ? "/dashboard" : "/"} className="menu-nav-link">Trang chủ</Link>
              {currentUser && <Link to="/user/orders" className="menu-nav-link">Đơn hàng của tôi</Link>}
            </>
          )}

          <Link to="/cart" className="menu-nav-link">
            Giỏ hàng ({cartCount})
          </Link>
        </div>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="category-filter">
        <button 
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Tất cả
        </button>
        {categories.map(category => (
          <button 
            key={category.id}
            className={`category-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id.toString())}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Tìm kiếm món ăn..." 
            value={searchKeyword} 
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button type="submit">Tìm kiếm</button>
          {searchResults && (
            <button type="button" onClick={clearSearch}>Xóa tìm kiếm</button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="loading-indicator">Đang tải dữ liệu...</div>
      ) : (
        <div className="products-grid">
          {getDisplayProducts().length === 0 ? (
            <p className="no-products">Không có sản phẩm nào trong danh mục này.</p>
          ) : (
            getDisplayProducts().map(product => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  <img 
                    src={product.image_url || DEFAULT_IMAGE} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">
                  {product.description || 'Không có mô tả'}
                </p>
                <div className="product-footer">
                  <span className="product-price">{formatPrice(product.price)}</span>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <div className="cart-preview">
        <Link to="/cart" className="view-cart-btn">
          🛒 Xem giỏ hàng {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
        </Link>
      </div>
    </div>
  );
};
export default Menu;