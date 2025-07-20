import api from './api';

export interface ReportsData {
  summary: {
    totalSales: number;
    totalPurchases: number;
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    profitMargin: number;
    averageOrderValue: number;
    bestCustomer: {
      name: string;
      amount: number;
    } | null;
  };
  growth: {
    salesGrowth: number;
    revenueGrowth: number;
    purchaseGrowth: number;
    expenseGrowth: number;
  };
  topProducts: {
    name: string;
    sales: number;
    revenue: number;
  }[];
  categories: {
    name: string;
    sales: number;
    revenue: number;
    percentage: number;
  }[];
  recentSales: {
    id: string;
    product: string;
    amount: number;
    date: string;
    customer: string;
  }[];
  recentPurchases: {
    id: string;
    item: string;
    amount: number;
    date: string;
    supplier: string;
  }[];
}

export const reportsApi = {
  // Get user reports and analytics
  getUserReports: async (timeRange: string = '30d'): Promise<ReportsData> => {
    const response = await api.get(`/reports/user?timeRange=${timeRange}`);
    return response.data.data;
  },

  // Generate and download PDF report
  downloadPDFReport: async (timeRange: string = '30d'): Promise<void> => {
    const response = await api.get(`/reports/pdf?timeRange=${timeRange}`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `sales-report-${timeRange}-${date}.pdf`);
    
    // Append to html link element page
    document.body.appendChild(link);
    
    // Start download
    link.click();
    
    // Clean up and remove link
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default reportsApi;
