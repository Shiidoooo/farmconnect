import { NetworkConfig } from '../lib/network-config';

// Admin API service class
class AdminApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Sales Analytics
  async getSalesAnalytics(params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const url = `${NetworkConfig.getBackendUrl()}/api/admin/analytics/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  }

  // Product Analytics
  async getProductAnalytics() {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/analytics/products`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  }

  // Customer Analytics
  async getCustomerAnalytics() {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/analytics/customers`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }
  }

  // Order Analytics
  async getOrderAnalytics() {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/analytics/orders`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw error;
    }
  }

  // Order Management
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.search) queryParams.append('search', params.search);

      const url = `${NetworkConfig.getBackendUrl()}/api/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Product Management
  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${NetworkConfig.getBackendUrl()}/api/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(productId: string) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/products/${productId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async updateProductStatus(productId: string, status: string) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: any) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getProductStats() {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/products/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }

  // User Management
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${NetworkConfig.getBackendUrl()}/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/users/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: any) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    userType?: 'user' | 'admin';
    accountStatus?: 'active' | 'suspended';
    address: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'prefer not to say';
  }) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService();

// Export types for better TypeScript support
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  todayRevenue: number;
  todayOrders: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  recentOrders: any[];
  lowStockProducts: any[];
  expiredProducts: any[];
}

export interface SalesAnalytics {
  _id: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface ProductAnalytics {
  categories: {
    _id: string;
    revenue: number;
    orders: number;
    totalQuantity: number;
  }[];
  topProducts: {
    _id: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }[];
  stockStats: {
    totalProducts: number;
    averageStock: number;
    lowStock: number;
    outOfStock: number;
  };
  expiryStats: {
    expiredProducts: number;
    expiringSoon: number;
  };
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerOrderStats: {
    averageOrdersPerCustomer: number;
    averageSpentPerCustomer: number;
  };
  geographicData: {
    _id: string;
    orders: number;
    revenue: number;
  }[];
}

export interface OrderAnalytics {
  orderStatusDistribution: {
    _id: string;
    count: number;
  }[];
  paymentMethodDistribution: {
    _id: string;
    count: number;
    revenue: number;
  }[];
  orderTrends: {
    _id: string;
    orders: number;
    revenue: number;
  }[];
  averageDeliveryTime: number;
}
