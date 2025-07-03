import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import '../style/Auth.css';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  //lay location de xac dinh loai nguoi dung tu URL
  const location  = useLocation();
  const path = location.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra cơ bản
    if (!username || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    try {
      setLoading(true);
      setError('');
      

      let response;
      
      // Gọi API dựa vào đường dẫn
      if (path.includes('/admin/SignUp')) {
        response = await authService.signUpAdmin(username, email, password);
      } else if (path.includes('/staff/SignUp')) {
        response = await authService.signUpStaff(username, email, password);
      } else {
        response = await authService.signUpUser(username, email, password);
      }
      
      
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate('/login', { state: { message: 'Đăng ký thành công. Vui lòng đăng nhập.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xác định tiêu đề dựa vào đường dẫn
  const getTitle = () => {
    if (path.includes('/admin/SignUp')) {
      return 'Đăng ký Quản trị viên';
    } else if (path.includes('/staff/SignUp')) {
      return 'Đăng ký Nhân viên';
    }
    return 'Đăng ký';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{getTitle()}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Chọn tên đăng nhập"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Chọn mật khẩu"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu của bạn"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        
        <p className="redirect-text">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;