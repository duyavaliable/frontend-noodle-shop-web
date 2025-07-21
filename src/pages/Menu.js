import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { productService, categoryService } from '../services/api';
import '../style/Menu.css';

const Menu = () => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);
  const DEFAULT_IMAGE = "/defaultimage.png";

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
  }, []);

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartCount = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };

  // Lọc sản phẩm theo danh mục
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id === parseInt(selectedCategory));

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    try {
      // Lấy giỏ hàng từ localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Nếu đã có, tăng số lượng
        cartItems[existingItemIndex].quantity += 1;
      } else {
        // Nếu chưa có, thêm mới với số lượng là 1
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1
        });
      }
      
      // Lưu giỏ hàng cập nhật vào localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Cập nhật số lượng sản phẩm trong giỏ hàng
      updateCartCount();
      
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
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
          <Link to="/" className="menu-nav-link">Trang chủ</Link>
          {currentUser ? (
            <Link to="/dashboard" className="menu-nav-link">Trang cá nhân</Link>
          ) : (
            <Link to="/login" className="menu-nav-link">Đăng nhập</Link>
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
      
      {loading ? (
        <div className="loading-indicator">Đang tải dữ liệu...</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-products">Không có sản phẩm nào trong danh mục này.</p>
          ) : (
            filteredProducts.map(product => (
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