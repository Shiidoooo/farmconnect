// Simple admin API service without path aliases for now
import { NetworkConfig } from '../../../lib/network-config';

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
  customerSatisfactionRate?: string;
  productsByCategory?: { _id: string; count: number }[];
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
