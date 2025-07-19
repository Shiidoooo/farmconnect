import axios from 'axios';
import NetworkConfig from '@/lib/network-config';

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: NetworkConfig.getApiBaseUrl(),
  // Don't set default Content-Type, let axios handle it per request
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error('Network error - check if backend server is running and accessible');
      console.error(`Expected backend URL: ${NetworkConfig.getApiBaseUrl()}`);
      NetworkConfig.logNetworkInfo();
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData: any) => {
    try {
      console.log('Sending registration data:', userData instanceof FormData ? 'FormData object' : userData);
      console.log('userData constructor:', userData.constructor.name);
      
      // For FormData, don't set any headers - let axios handle it
      const config = userData instanceof FormData 
        ? { 
            headers: {
              // Don't set Content-Type, axios will set it with boundary
            }
          }
        : { 
            headers: { 
              'Content-Type': 'application/json' 
            } 
          };
      
      console.log('Request config:', config);
      
      const response = await api.post('/users/register', userData, config);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API register error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email, password: '***' });
      const response = await api.post('/users/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  updateProfilePicture: async (formData) => {
    const response = await api.put('/users/profile-picture', formData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },
};

// Wallet API calls
export const walletAPI = {
  getWallet: async () => {
    const response = await api.get('/users/wallet');
    return response.data;
  },

  cashIn: async (amount, ewalletId) => {
    const response = await api.post('/users/wallet/cash-in', { amount, ewalletId });
    return response.data;
  },

  cashOut: async (amount, ewalletId) => {
    const response = await api.post('/users/wallet/cash-out', { amount, ewalletId });
    return response.data;
  },

  connectEwallet: async (accountData) => {
    const response = await api.post('/users/wallet/connect', accountData);
    return response.data;
  },

  disconnectEwallet: async (ewalletId) => {
    const response = await api.delete(`/users/wallet/disconnect/${ewalletId}`);
    return response.data;
  },

  createEwalletAccount: async (accountData) => {
    const response = await api.post('/users/wallet/create-account', accountData);
    return response.data;
  },

  getAvailableEwallets: async () => {
    const response = await api.get('/users/wallet/available-ewallets');
    return response.data;
  },

  getEwalletsByType: async (type) => {
    const response = await api.get(`/users/wallet/ewallets/${type}`);
    return response.data;
  },
};

// Products API calls
export const productsAPI = {
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getMyProducts: async () => {
    const response = await api.get('/products/user/my-products');
    return response.data;
  },

  getProductById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  getSellerStats: async (sellerId) => {
    const response = await api.get(`/products/seller/${sellerId}/stats`);
    return response.data;
  },

  addRating: async (productId, ratingData) => {
    const response = await api.post(`/products/${productId}/rating`, ratingData);
    return response.data;
  },
};

// Cart API calls
export const cartAPI = {
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/users/cart/add', { productId, quantity });
    return response.data;
  },

  getCart: async () => {
    const response = await api.get('/users/cart');
    return response.data;
  },

  updateCartItem: async (productId, quantity) => {
    const response = await api.put('/users/cart/update', { productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId) => {
    const response = await api.delete(`/users/cart/remove/${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/users/cart/clear');
    return response.data;
  },
};

// Order API calls
export const orderAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getUserOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  getSellerOrders: async () => {
    const response = await api.get('/orders/seller');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, statusData: { status: string }) => {
    const response = await api.put(`/orders/${orderId}/status`, statusData);
    return response.data;
  },

  confirmOrderReceived: async (orderId: string) => {
    const response = await api.put(`/orders/${orderId}/confirm-received`);
    return response.data;
  },
};

// Forum API calls
export const forumAPI = {
  getAllPosts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/forum?${queryString}`);
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await api.get(`/forum/${postId}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/forum', postData);
    return response.data;
  },

  updatePost: async (postId, postData) => {
    const response = await api.put(`/forum/${postId}`, postData);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/forum/${postId}`);
    return response.data;
  },

  voteOnPost: async (postId, voteType) => {
    const response = await api.post(`/forum/${postId}/vote`, { type: voteType });
    return response.data;
  },

  addComment: async (postId, content) => {
    const response = await api.post(`/forum/${postId}/comment`, { content });
    return response.data;
  },

  getRecommendedPosts: async (limit = 5) => {
    const response = await api.get(`/forum/recommended?limit=${limit}`);
    return response.data;
  },

  getTrendingPosts: async (limit = 5) => {
    const response = await api.get(`/forum/trending?limit=${limit}`);
    return response.data;
  },

  getCommunityStats: async () => {
    const response = await api.get('/forum/stats');
    return response.data;
  },
};

// Weather API calls
export const weatherAPI = {
  getForecast: async (lat?: number, lon?: number, city?: string) => {
    const params = new URLSearchParams();
    if (lat && lon) {
      params.append('lat', lat.toString());
      params.append('lon', lon.toString());
    } else if (city) {
      params.append('city', city);
    }
    
    const response = await api.get(`/weather/forecast?${params.toString()}`);
    return response.data;
  },

  getAlerts: async (lat?: number, lon?: number, city?: string) => {
    const params = new URLSearchParams();
    if (lat && lon) {
      params.append('lat', lat.toString());
      params.append('lon', lon.toString());
    } else if (city) {
      params.append('city', city);
    }
    
    const response = await api.get(`/weather/alerts?${params.toString()}`);
    return response.data;
  },
};

// Admin API calls
export const adminAPI = {
  getDashboardData: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  getProductById: async (productId) => {
    const response = await api.get(`/admin/products/${productId}`);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  updateOrder: async (orderId, orderData) => {
    const response = await api.put(`/admin/orders/${orderId}`, orderData);
    return response.data;
  },

  deleteOrder: async (orderId) => {
    const response = await api.delete(`/admin/orders/${orderId}`);
    return response.data;
  },
};

// Auth helper functions
export const auth = {
  // Save user data and token to localStorage
  saveUserData: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  },

  // Get user data from localStorage
  getUserData: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  },
};

// Network connectivity test
export const testConnection = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      baseUrl: NetworkConfig.getApiBaseUrl()
    };
  }
};

export default api;
