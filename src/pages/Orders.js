import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services/api';
import '../style/Orders.css';

const MyOrders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Gọi API để lấy đơn hàng của người dùng hiện tại
        const response = await orderService.getMyOrders(currentUser.userId);
        setOrders(response);
        setError('');
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [currentUser]);

  // Hiển thị chi tiết đơn hàng
  const viewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await orderService.getOrderById(orderId);
      setSelectedOrder(orderDetails);
    } catch (err) {
      setError('Không thể tải thông tin chi tiết đơn hàng.');
      console.error(err);
    }
  };

  // Đóng modal chi tiết đơn hàng
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Hiển thị trạng thái đơn hàng
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'đang xử lý': return 'status-processing';
      case 'đã xác nhận': return 'status-confirmed';
      case 'đang giao hàng': return 'status-shipping';
      case 'đã giao hàng': return 'status-delivered';
      case 'đã hủy': return 'status-canceled';
      default: return '';
    }
  };

  return (
    <div className="my-orders-container">
      <h1 className="page-title">Đơn hàng của tôi</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-indicator">Đang tải dữ liệu...</div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/menu" className="shop-now-btn">Đặt hàng ngay</Link>
        </div>
      ) : (
        <div className="orders-list">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{formatDate(order.order_date)}</td>
                  <td>{formatPrice(order.total_amount)}</td>
                  <td>
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => viewOrderDetails(order.id)}
                      className="view-details-btn"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <span className="close-modal" onClick={closeOrderDetails}>&times;</span>
            <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
            
            <div className="order-info">
              <p><strong>Ngày đặt hàng:</strong> {formatDate(selectedOrder.order_date)}</p>
              <p><strong>Trạng thái:</strong> 
                <span className={`order-status ${getStatusClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </p>
              <p><strong>Người nhận:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Số điện thoại:</strong> {selectedOrder.customer_phone}</p>
              <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.shipping_address}</p>
            </div>
            
            <h3>Sản phẩm đã đặt</h3>
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.order_items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.price)}</td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Tổng cộng:</strong></td>
                  <td>{formatPrice(selectedOrder.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;