import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Các dịch vụ xác thực
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // Đăng ký người dùng thông thường
  signUpUser: async (username, email, password) => {
    const response = await api.post('/auth/signup/user', { username, email, password });
    return response.data;
  },

  // Đăng ký nhân viên
  signUpStaff: async (username, email, password) => {
    const response = await api.post('/auth/signup/staff', { username, email, password });
    return response.data;
  },

  // Đăng ký quản trị viên
  signUpAdmin: async (username, email, password) => {
    const response = await api.post('/auth/signup/admin', { username, email, password });
    return response.data;
  }
};

export default api;