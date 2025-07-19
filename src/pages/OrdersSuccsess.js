import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../style/OrdersSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã đặt hàng tại Bán Mì.</p>
        {orderId && (
          <p className="order-id">Mã đơn hàng: <strong>#{orderId}</strong></p>
        )}
        <p>Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>
        
        <div className="success-actions">
          <Link to="/user/orders" className="view-orders-btn">Xem đơn hàng của tôi</Link>
          <Link to="/menu" className="continue-shopping-btn">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;