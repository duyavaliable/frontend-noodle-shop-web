import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  return config;
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


// Category services
export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  // Get category by ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  // Create new category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};


  //tim kiem san pham
  export const searchProducts = async (searchParams) => {
  try {
    // Xây dựng query string từ các params
    const queryParams = new URLSearchParams();
    
    if (searchParams.keyword) queryParams.append('keyword', searchParams.keyword);
    if (searchParams.category_id) queryParams.append('category_id', searchParams.category_id);
    if (searchParams.min_price) queryParams.append('min_price', searchParams.min_price);
    if (searchParams.max_price) queryParams.append('max_price', searchParams.max_price);
    if (searchParams.sort) queryParams.append('sort', searchParams.sort);
    
    const response = await api.get(`${API_URL}/products/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    throw error;
  }
};

// Product services
export const productService = {
  //Get all products
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  //search 
  searchProducts: searchProducts,

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
}
export default api;

// Order services
export const orderService = {
  // Get all orders
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Get orders of current user
  getMyOrders: async () => {
    const userId = JSON.parse(localStorage.getItem('user'))?.userId;
    if (!userId) {
      throw new Error('Cần cung cấp ID người dùng');
    }
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Update order
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Delete order
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },


};


