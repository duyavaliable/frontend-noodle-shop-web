import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import '../style/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Lấy danh sách tất cả đơn hàng khi component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Lấy tất cả đơn hàng
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết đơn hàng
  const viewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await orderService.getOrderById(orderId);
      setSelectedOrder(orderDetails);
    } catch (err) {
      setError('Không thể tải thông tin chi tiết đơn hàng');
      console.error(err);
    }
  };

  // Đóng modal chi tiết đơn hàng
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      await orderService.updateOrderStatus(orderId, status);
      
      // Cập nhật trạng thái trong danh sách đơn hàng
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      );
      setOrders(updatedOrders);
      
      // Cập nhật chi tiết đơn hàng nếu đang mở
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      
      setError('');
    } catch (err) {
      setError('Không thể cập nhật trạng thái đơn hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa đơn hàng
  const deleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      try {
        setLoading(true);
        await orderService.deleteOrder(orderId);
        setOrders(orders.filter(order => order.id !== orderId));
        
        // Đóng modal chi tiết nếu đơn hàng bị xóa là đơn hàng đang xem
        if (selectedOrder && selectedOrder.id === orderId) {
          closeOrderDetails();
        }
        
        setError('');
      } catch (err) {
        setError('Không thể xóa đơn hàng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
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

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="admin-orders-container">
      <h1 className="page-title">Quản lý đơn hàng</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filter-container">
        <label htmlFor="status-filter">Lọc theo trạng thái:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          disabled={loading}
        >
          <option value="all">Tất cả</option>
          <option value="đang xử lý">Đang xử lý</option>
          <option value="đã xác nhận">Đã xác nhận</option>
          <option value="đang giao hàng">Đang giao hàng</option>
          <option value="đã giao hàng">Đã giao hàng</option>
          <option value="đã hủy">Đã hủy</option>
        </select>
      </div>
      
      {loading && !selectedOrder ? (
        <div className="loading-indicator">Đang tải dữ liệu...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <p>Không có đơn hàng nào{filterStatus !== 'all' ? ` với trạng thái "${filterStatus}"` : ''}.</p>
        </div>
      ) : (
        <div className="orders-list">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{formatDate(order.order_date)}</td>
                  <td>{formatPrice(order.total_amount)}</td>
                  <td>
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => viewOrderDetails(order.id)}
                      className="view-btn"
                      disabled={loading}
                    >
                      Xem
                    </button>
                    <button 
                      onClick={() => deleteOrder(order.id)}
                      className="delete-btn"
                      disabled={loading}
                    >
                      Xóa
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
              <div className="order-info-row">
                <div className="order-info-group">
                  <p><strong>Ngày đặt hàng:</strong> {formatDate(selectedOrder.order_date)}</p>
                  <p><strong>Người nhận:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.customer_phone}</p>
                </div>
                
                <div className="order-status-group">
                  <p><strong>Trạng thái hiện tại:</strong></p>
                  <span className={`order-status ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  
                  <div className="update-status">
                    <label htmlFor="new-status">Cập nhật trạng thái:</label>
                    <select
                      id="new-status"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          updateOrderStatus(selectedOrder.id, e.target.value);
                        }
                      }}
                      disabled={loading}
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đang giao hàng">Đang giao hàng</option>
                      <option value="Đã giao hàng">Đã giao hàng</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </div>
                </div>
              </div>
              
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
            
            <div className="modal-actions">
              <button 
                className="delete-btn"
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
                    deleteOrder(selectedOrder.id);
                  }
                }}
                disabled={loading}
              >
                Xóa đơn hàng
              </button>
              <button 
                className="close-btn"
                onClick={closeOrderDetails}
                disabled={loading}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;