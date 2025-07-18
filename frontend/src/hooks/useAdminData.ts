import { useState, useEffect } from 'react';
import { adminApiService, DashboardStats, SalesAnalytics, ProductAnalytics, CustomerAnalytics, OrderAnalytics } from '../services/adminApi';

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getDashboardStats();
      setStats(data);
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
      const result = await adminApiService.getSalesAnalytics(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales analytics');
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
      const result = await adminApiService.getProductAnalytics();
      setData(result);
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
      const result = await adminApiService.getCustomerAnalytics();
      setData(result);
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
      const result = await adminApiService.getOrderAnalytics();
      setData(result);
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
      const result = await adminApiService.getAllOrders(params);
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
      await adminApiService.updateOrderStatus(orderId, status);
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
      const result = await adminApiService.getAllProducts(params);
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
      const result = await adminApiService.getAllUsers(params);
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
