import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../style/Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ các trường');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const data = await authService.login(username, password);
      
      // Lưu dữ liệu người dùng vào context
      login({ username, userId: data.userId,email: data.email, role: data.role, token: data.token });

      // Redirect based on role (dang nhap trang dua vao vai tro)
      if (data.role === 'admin' || data.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard'); // Redirect to home for regular users
      }
      

    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập của bạn"
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
              placeholder="Nhập mật khẩu của bạn"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <p className="redirect-text">
          Chưa có tài khoản? <Link to="/SignUp">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;