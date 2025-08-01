import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const UserProfile = () => {
  const { currentUser, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    //cap nhat thong tin nguoi dung hop le
    const usernameRegex = /^[A-Za-zÀ-ỹà-ỹ\s]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Tên đăng nhập chỉ được chứa chữ cái và khoảng trắng, không có số hoặc ký tự đặc biệt.');
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ.');
      setLoading(false);
      return;
    }
    const phoneRegex = /^\d{9,11}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
      setError('Số điện thoại phải là số và có từ 9 đến 11 chữ số.');
      setLoading(false);
      return;
    }

    try {
      await api.put(`/auth/update/${currentUser.userId}`, formData);
      setSuccess('Cập nhật thông tin thành công!');
      // Cập nhật lại context nếu cần
      login({ ...currentUser, ...formData });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-container">
      <h1>Thông tin cá nhân</h1>
      {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
      <p><strong>Vai trò:</strong> {currentUser.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</p>
      )}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="user-profile-form">
        <div className="form-group">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone_number">Số điện thoại</label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;