import React, {useState, useEffect, useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, {orderService} from '../services/api';
import '../style/Cart.css';

const Cart = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingInfo, setShippingInfo] = useState({
        customer_name: currentUser?.username || '',
        customer_phone: '',
        shipping_address: '',
    });
    
// Giả lập lấy giỏ hàng
useEffect(() => {
        const fetchCart = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    const response = await api.get(`/cart/user/${currentUser.userId}`);
                    // Backend trả về { cart, items }, chúng ta cần `items`
                    setCartItems(response.data.items || []);
                } catch (err) {
                    console.error("Lỗi khi tải giỏ hàng:", err);
                    setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCart();
    }, [currentUser]);

  // Tính tổng tiền đơn hàng
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Xử lý khi số lượng thay đổi
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/items/${cartItemId}`, { quantity: newQuantity });
      // Cập nhật giỏ hàng trong state
      const updatedCart = cartItems.map(item =>
        item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);
    } catch (err) {
      console.error("Lỗi khi cập nhật giỏ hàng:", err);
      setError("Không thể cập nhật giỏ hàng. Vui lòng thử lại.");
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/items/${cartItemId}`);
      const updatedCart = cartItems.filter(item => item.cart_item_id !== cartItemId);
      setCartItems(updatedCart);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", err);
      setError("Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.");
    }
  };

  // Xử lý thay đổi thông tin giao hàng
  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value
    });
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      setError('Giỏ hàng của bạn đang trống');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        total_amount: calculateTotal(),
        status: 'Đang xử lý',
        customer_name: shippingInfo.customer_name,
        customer_phone: shippingInfo.customer_phone,
        shipping_address: shippingInfo.shipping_address,
        user_id: currentUser.userId, 
        order_items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Gọi API để tạo đơn hàng
      const response = await orderService.createOrder(orderData);
      
      // Xóa giỏ hàng sau khi đặt hàng thành công
      await api.delete(`/cart/user/${currentUser.userId}`);
      setCartItems([]);
      
      // Chuyển hướng đến trang cảm ơn hoặc trang chi tiết đơn hàng
      navigate('/order-success', { state: { orderId: response.order.id } });
      
    } catch (err) {
      setError('Không thể hoàn tất đơn hàng. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="cart-container">
      <header className="menu-header">
        <h1 className="menu-title">Giỏ hàng</h1>
        <div className="menu-nav">
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') ? (
            <>
              <Link to="/admin/dashboard" className="menu-nav-link">Trang chủ</Link>
              <Link to="/menu" className="menu-nav-link">Thực đơn</Link>
              <Link to="/admin/orders" className="menu-nav-link">Quản lý đơn hàng</Link>
            </>
          ) : (
            <>
              <Link to={currentUser ? "/dashboard" : "/"} className="menu-nav-link">Trang chủ</Link>
              <Link to="/menu" className="menu-nav-link">Thực đơn</Link>
              {currentUser && <Link to="/user/orders" className="menu-nav-link">Đơn hàng của tôi</Link>}
            </>
          )}
        </div>
      </header>
  
      
      {error && <div className="error-message">{error}</div>}
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to="/menu" className="continue-shopping-btn">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Tổng</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.cart_item_id}>
                    <td>
                      <div className="cart-item-info">
                        <img 
                          src={item.image_url || "/defaultimage.png"} 
                          alt={item.name} 
                          className="cart-item-image" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/defaultimage.png";
                          }}
                        />
                        <span className="cart-item-name">{item.name}</span>
                      </div>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <div className="quantity-control">
                        <button 
                          onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}>
                          +
                        </button>
                      </div>
                    </td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                    <td>
                      <button 
                        className="remove-item-btn" 
                        onClick={() => handleRemoveItem(item.cart_item_id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="order-summary">
            <h2>Thông tin đơn hàng</h2>
            <div className="summary-row">
              <span>Tổng sản phẩm:</span>
              <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="summary-row">
              <span>Tổng tiền:</span>
              <span className="total-price">{formatPrice(calculateTotal())}</span>
            </div>
            
            <form onSubmit={handlePlaceOrder} className="shipping-form">
              <h3>Thông tin giao hàng</h3>
              <div className="form-group">
                <label htmlFor="customer_name">Họ tên</label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={shippingInfo.customer_name}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customer_phone">Số điện thoại</label>
                <input
                  type="text"
                  id="customer_phone"
                  name="customer_phone"
                  value={shippingInfo.customer_phone}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="shipping_address">Địa chỉ giao hàng</label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={shippingInfo.shipping_address}
                  onChange={handleShippingInfoChange}
                  required
                  rows={3}
                />
              </div>
              
              <button 
                type="submit" 
                className="checkout-btn"
                disabled={loading || cartItems.length === 0}
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;