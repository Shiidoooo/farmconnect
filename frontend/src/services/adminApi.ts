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

      const url = `${NetworkConfig.getBackendUrl()}/api/admin/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
      const response = await fetch(`${NetworkConfig.getBackendUrl()}/api/admin/admin/orders/${orderId}/status`, {
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
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${NetworkConfig.getBackendUrl()}/api/admin/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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

  // User Management
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${NetworkConfig.getBackendUrl()}/api/admin/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
