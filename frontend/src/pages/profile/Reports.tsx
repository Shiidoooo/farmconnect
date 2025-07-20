import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react";
import { reportsApi, ReportsData } from '@/services/reportsApi';
import { generateClientPDF } from '@/utils/pdfGenerator';
import { useAuth } from '@/contexts/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [reportData, setReportData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Fetch real data from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reportsApi.getUserReports(timeRange);
        setReportData(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [timeRange]);

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!reportData || !user) return;
    
    try {
      setExportingPDF(true);
      
      // Try server-side PDF generation first
      try {
        await reportsApi.downloadPDFReport(timeRange);
      } catch (serverError) {
        console.warn('Server-side PDF generation failed, falling back to client-side:', serverError);
        
        // Fallback to client-side PDF generation
        await generateClientPDF(
          reportData, 
          timeRange, 
          user.name || 'User', 
          user.email || 'No email'
        );
      }
      
    } catch (error) {
      console.error('PDF export failed:', error);
      setError('Failed to export PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, isPercentage = false, isCurrency = false }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {isCurrency && typeof value === 'number' && value > 1000 
                ? `₱${value.toLocaleString()}` 
                : isPercentage 
                ? `${value}%`
                : value}
            </p>
            {trend !== undefined && (
              <p className={`text-xs flex items-center mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            color === 'text-red-600' ? 'bg-red-100' : 
            color === 'text-green-600' ? 'bg-green-100' : 
            color === 'text-blue-600' ? 'bg-blue-100' : 
            color === 'text-purple-600' ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressBar = ({ percentage, color = 'bg-blue-500' }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-300`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-farm-red-600" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales & Purchase Reports</h2>
          <p className="text-gray-600">Track your business performance and analytics</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-red-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exportingPDF}>
            {exportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={reportData.summary.totalSales}
          icon={Package}
          trend={reportData.growth.salesGrowth}
          color="text-red-600"
        />
        <StatCard
          title="Total Revenue"
          value={reportData.summary.totalRevenue}
          icon={DollarSign}
          trend={reportData.growth.revenueGrowth}
          color="text-red-600"
          isCurrency={true}
        />
        <StatCard
          title="Total Purchases"
          value={reportData.summary.totalPurchases}
          icon={Package}
          trend={reportData.growth.purchaseGrowth}
          color="text-blue-600"
        />
        <StatCard
          title="Total Expenses"
          value={reportData.summary.totalExpenses}
          icon={DollarSign}
          trend={reportData.growth.expenseGrowth}
          color="text-blue-600"
          isCurrency={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800">{product.name}</span>
                      <span className="text-sm text-gray-600">₱{product.revenue.toLocaleString()}</span>
                    </div>
                    <ProgressBar 
                      percentage={reportData.topProducts.length > 0 ? (product.sales / Math.max(...reportData.topProducts.map(p => p.sales))) * 100 : 0} 
                      color="bg-red-500" 
                    />
                    <span className="text-xs text-gray-500">{product.sales} units sold</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar 
                    percentage={category.percentage} 
                    color={
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-red-400' :
                      index === 2 ? 'bg-red-300' : 'bg-red-200'
                    }
                  />
                  <span className="text-xs text-gray-500">₱{category.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-red-600" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.recentSales.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{sale.product}</p>
                    <p className="text-sm text-gray-600">{sale.customer}</p>
                    <p className="text-xs text-gray-500">{sale.date}</p>
                  </div>
                  <p className="font-bold text-red-600">₱{sale.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{purchase.item}</p>
                    <p className="text-sm text-gray-600">{purchase.supplier}</p>
                    <p className="text-xs text-gray-500">{purchase.date}</p>
                  </div>
                  <p className="font-bold text-blue-600">₱{purchase.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-red-800">Profit This Month</h4>
                <p className="text-2xl font-bold text-red-600">₱{reportData.summary.profit.toLocaleString()}</p>
                <p className="text-sm text-red-500">Margin: {reportData.summary.profitMargin.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800">Best Customer</h4>
                <p className="text-lg font-bold text-blue-600">
                  {reportData.summary.bestCustomer?.name || 'No customers yet'}
                </p>
                <p className="text-sm text-blue-500">
                  {reportData.summary.bestCustomer ? `₱${reportData.summary.bestCustomer.amount.toLocaleString()} spent` : 'Start selling to see your best customer'}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-purple-800">Average Order</h4>
                <p className="text-2xl font-bold text-purple-600">₱{reportData.summary.averageOrderValue.toLocaleString()}</p>
                <p className="text-sm text-purple-500">Per order value</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
