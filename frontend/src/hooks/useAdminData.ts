import { useState, useEffect } from 'react';
import { DashboardStats, SalesAnalytics, ProductAnalytics, CustomerAnalytics, OrderAnalytics } from '../services/adminApi';
import api from '../services/api';

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

// Hook for sales analytics
export const useSalesAnalytics = (params?: {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
}) => {
  const [data, setData] = useState<SalesAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const url = `/admin/analytics/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      
      // Backend returns { data: [...], growth: "...", totalRevenue: ..., totalOrders: ... }
      // Extract the data array from the response
      const salesArray = response.data?.data || response.data || [];
      setData(Array.isArray(salesArray) ? salesArray : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales analytics');
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params?.period, params?.startDate, params?.endDate]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for product analytics
export const useProductAnalytics = () => {
  const [data, setData] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/analytics/products');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Hook for customer analytics
export const useCustomerAnalytics = () => {
  const [data, setData] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/analytics/customers');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Hook for order analytics
export const useOrderAnalytics = () => {
  const [data, setData] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/analytics/orders');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Hook for managing orders
export const useOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Build query parameters  
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.search) queryParams.append('search', params.search);

      const url = `/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      const result = response.data;
      setOrders(result.orders);
      setTotalOrders(result.totalOrders);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      // Refresh orders after updating status
      await fetchOrders();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [params?.page, params?.limit, params?.status, params?.startDate, params?.endDate, params?.search]);

  return { 
    orders, 
    totalOrders, 
    pagination,
    loading, 
    error, 
    refetch: fetchOrders,
    updateOrderStatus
  };
};

// Hook for managing products
export const useProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Build query parameters  
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      const result = response.data;
      setProducts(result.products);
      setTotalProducts(result.totalProducts);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params?.page, params?.limit, params?.category, params?.search, params?.sortBy, params?.sortOrder]);

  return { 
    products, 
    totalProducts, 
    pagination,
    loading, 
    error, 
    refetch: fetchProducts
  };
};

// Hook for managing users
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Build query parameters  
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      const result = response.data;
      setUsers(result.users);
      setTotalUsers(result.totalUsers);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [params?.page, params?.limit, params?.search, params?.sortBy, params?.sortOrder]);

  return { 
    users, 
    totalUsers, 
    pagination,
    loading, 
    error, 
    refetch: fetchUsers
  };
};
