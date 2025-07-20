
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import CategoryChart from "@/components/admin/charts/CategoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
import { adminAPI } from "@/services/api";

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAnalytics();
        if (response.success) {
          setAnalyticsData(response.data);
        } else {
          setError(response.message || 'Failed to fetch analytics data');
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  // Prepare stats cards data from backend
  const statsCardsData = [
    { 
      title: "Total Sales", 
      value: `₱${analyticsData?.overview?.totalSales?.toLocaleString() || 0}`, 
      description: `From ${analyticsData?.overview?.deliveredOrders || 0} delivered orders`, 
      color: "text-blue-600", 
      icon: TrendingUp 
    },
    { 
      title: "Platform Revenue (2%)", 
      value: `₱${analyticsData?.overview?.totalRevenue?.toLocaleString() || 0}`, 
      description: `${analyticsData?.overview?.revenueGrowth || 0}% vs last month`, 
      color: "text-green-600", 
      icon: DollarSign 
    },
    { 
      title: "Total Customers", 
      value: analyticsData?.customerData?.totalCustomers?.toLocaleString() || "0", 
      description: `${analyticsData?.overview?.customerGrowth || 0}% new customers`, 
      color: "text-purple-600", 
      icon: Users 
    },
    { 
      title: "Avg Order Value", 
      value: `₱${analyticsData?.overview?.averageOrderValue?.toFixed(2) || 0}`, 
      description: "from delivered orders", 
      color: "text-orange-600", 
      icon: ShoppingCart 
    },
  ];

  // Recent sales trends from recent orders
  const salesTrends = analyticsData?.recentOrders?.slice(0, 6).map((order, index) => ({
    month: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    sales: order.totalAmount || 0,
    orders: 1
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Analytics
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Track your business performance and insights
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsCardsData.map((item, index) => (
            <StatsCard
              key={index}
              title={item.title}
              value={item.value}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RevenueChart />
          <CategoryChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Orders */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.recentOrders?.slice(0, 5).map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium dark:text-white">
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600 dark:text-red-400">
                        ₱{order.totalAmount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {order.orderStatus}
                      </div>
                    </div>
                  </div>
                )) || <div className="text-gray-500">No recent orders</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories Performance */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsData?.categories?.slice(0, 3).map((category, index) => {
                const icons = ['🌱', '🛠️', '🌿'];
                const colors = ['green', 'blue', 'orange'];
                return (
                  <div key={index} className={`flex items-center justify-between p-3 bg-${colors[index]}-50 dark:bg-${colors[index]}-900/20 rounded-lg`}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{icons[index]}</span>
                      <div>
                        <div className="font-medium dark:text-white">{category._id}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{category.totalQuantity} sold</div>
                      </div>
                    </div>
                    <Badge className={`bg-${colors[index]}-100 text-${colors[index]}-700`}>
                      ₱{category.revenue?.toLocaleString()}
                    </Badge>
                  </div>
                );
              }) || <div className="text-gray-500">No category data available</div>}
            </div>
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Customer Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                  {analyticsData?.customerData?.totalCustomers?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Customers</div>
                <Badge className="mt-2 bg-green-100 text-green-700">
                  {analyticsData?.customerData?.newCustomers || 0} new this month
                </Badge>
              </div>
              
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                  ₱{analyticsData?.customerData?.averageSpentPerCustomer?.toFixed(2) || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Customer Value</div>
                <Badge className="mt-2 bg-green-100 text-green-700">
                  {analyticsData?.customerData?.averageOrdersPerCustomer?.toFixed(1) || 0} avg orders
                </Badge>
              </div>
              
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                  {analyticsData?.customerData?.returningCustomers || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Returning Customers</div>
                <Badge className="mt-2 bg-green-100 text-green-700">
                  {analyticsData?.customerData?.totalCustomers > 0 ? 
                    ((analyticsData?.customerData?.returningCustomers / analyticsData?.customerData?.totalCustomers) * 100).toFixed(1) : 0}% retention
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
