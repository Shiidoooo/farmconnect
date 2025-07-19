import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import GrowthChart from "@/components/admin/charts/GrowthChart";
import OrdersChart from "@/components/admin/charts/OrdersChart";
import CategoryChart from "@/components/admin/charts/CategoryChart";
import OrderStatusChart from "@/components/admin/charts/OrderStatusChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Package, TrendingUp, Activity, Clock, Plus, Eye, UserPlus, Settings, Loader } from "lucide-react";
import { useDashboardStats, useProductAnalytics } from "../../hooks/useAdminData";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { stats, loading, error, refetch } = useDashboardStats();
  const { data: productAnalytics, loading: productLoading } = useProductAnalytics();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Add New Product",
      description: "Create a new product listing",
      icon: Plus,
      color: "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400",
      path: "/admin/products"
    },
    {
      title: "View Pending Orders",
      description: "Check orders awaiting processing",
      icon: Eye,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
      path: "/admin/orders"
    },
    {
      title: "Manage Users",
      description: "User management and permissions",
      icon: UserPlus,
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400",
      path: "/admin/users"
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      color: "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400",
      path: "/admin/settings"
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader className="w-8 h-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg">Error loading dashboard</div>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Get recent activities from backend data
  const recentActivities = [
    // Recent orders
    ...(stats?.recentOrders?.slice(0, 3).map((order: any, index: number) => ({
      id: `order-${index}`,
      type: "order",
      message: `Order #${order._id.slice(-4)} ${order.orderStatus}`,
      detail: `₱${order.totalAmount?.toLocaleString()}`,
      time: new Date(order.createdAt).toLocaleDateString(),
      status: order.orderStatus === 'delivered' ? 'success' : 
              order.orderStatus === 'pending' ? 'warning' : 'info'
    })) || []),
    // Low stock alerts
    ...(stats?.lowStockProducts?.slice(0, 2).map((product: any, index: number) => ({
      id: `stock-${index}`,
      type: "product",
      message: "Low stock alert",
      detail: product.productName,
      time: "Recently",
      status: "warning"
    })) || [])
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user": return <Users className="w-4 h-4" />;
      case "order": return <ShoppingCart className="w-4 h-4" />;
      case "product": return <Package className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "info": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400">Success</Badge>;
      case "warning": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">Warning</Badge>;
      case "info": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400">Info</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-none">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Welcome to your admin dashboard. Here's an overview of your platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid with proper spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || '0'}
            description="Active customers"
            icon={Users}
          />
          <StatsCard
            title="Orders"
            value={stats?.totalOrders?.toLocaleString() || '0'}
            description={`${stats?.todayOrders || 0} today`}
            icon={ShoppingCart}
          />
          <StatsCard
            title="Products"
            value={stats?.totalProducts?.toLocaleString() || '0'}
            description={`${stats?.lowStockProducts?.length || 0} low stock`}
            icon={Package}
          />
          <StatsCard
            title="Revenue"
            value={`₱${stats?.totalRevenue?.toLocaleString() || '0'}`}
            description={`₱${stats?.todayRevenue?.toLocaleString() || '0'} today`}
            icon={TrendingUp}
          />
        </div>

        {/* Revenue and Growth Charts - Responsive side by side */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="min-w-0"> {/* Prevent chart overflow */}
            <RevenueChart />
          </div>
          <div className="min-w-0"> {/* Prevent chart overflow */}
            <GrowthChart />
          </div>
        </div>

        {/* Additional Analytics Charts - Responsive grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0"> {/* Prevent chart overflow */}
            <OrdersChart />
          </div>
          <div className="min-w-0"> {/* Prevent chart overflow */}
            <CategoryChart />
          </div>
          <div className="min-w-0"> {/* Prevent chart overflow */}
            <OrderStatusChart />
          </div>
        </div>

        {/* Category Performance */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Category Performance</CardTitle>
            <CardDescription>
              Top performing product categories by revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {productAnalytics?.data?.slice(0, 3).map((category, index) => {
                const icons = ['🌱', '🛠️', '🌿', '🍅', '🥕', '🌾'];
                const colors = [
                  { bg: 'bg-green-50 dark:bg-green-900/20', badge: 'bg-green-100 text-green-700' },
                  { bg: 'bg-blue-50 dark:bg-blue-900/20', badge: 'bg-blue-100 text-blue-700' },
                  { bg: 'bg-orange-50 dark:bg-orange-900/20', badge: 'bg-orange-100 text-orange-700' },
                  { bg: 'bg-purple-50 dark:bg-purple-900/20', badge: 'bg-purple-100 text-purple-700' },
                  { bg: 'bg-pink-50 dark:bg-pink-900/20', badge: 'bg-pink-100 text-pink-700' },
                  { bg: 'bg-indigo-50 dark:bg-indigo-900/20', badge: 'bg-indigo-100 text-indigo-700' }
                ];
                
                const colorScheme = colors[index % colors.length];
                const icon = icons[index % icons.length];
                
                return (
                  <div key={category._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 ${colorScheme.bg} rounded-lg gap-3 sm:gap-0`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium dark:text-white text-sm sm:text-base truncate capitalize">
                          {category._id || 'Other'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          ₱{category.revenue?.toLocaleString()} revenue
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {category.totalQuantity} units sold
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between sm:justify-end items-center gap-2">
                      <Badge className={`${colorScheme.badge} text-xs px-2 py-1`}>
                        {category.orders} orders
                      </Badge>
                    </div>
                  </div>
                );
              }) || [1, 2, 3].map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3 sm:gap-0 animate-pulse">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Summary Stats */}
            {productAnalytics?.data && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      {productAnalytics.data.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Categories</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      ₱{productAnalytics.data.reduce((sum, cat) => sum + (cat.revenue || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      {productAnalytics.data.reduce((sum, cat) => sum + (cat.orders || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      {productAnalytics.data.reduce((sum, cat) => sum + (cat.totalQuantity || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Units Sold</div>
                  </div>
                </div>
              </div>
            )}
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
                  {stats?.totalUsers?.toLocaleString() || '2,456'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Customers</div>
                <Badge className="mt-2 bg-green-100 text-green-700">+5.2% this month</Badge>
              </div>
              
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                  ₱{stats?.averageOrderValue?.toFixed(2) || '185.50'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</div>
                <Badge className="mt-2 bg-green-100 text-green-700">+2.8% this month</Badge>
              </div>
              
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                  {stats?.customerSatisfactionRate || '78.5%'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
                <Badge className="mt-2 bg-green-100 text-green-700">+1.2% this month</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section - Responsive grid that stacks properly */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity - Takes 2/3 width on lg screens, full width below */}
          <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-lg min-w-0">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
                    <Activity className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="truncate">Recent Activity</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Latest activities on your platform
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors min-w-0">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${getActivityColor(activity.status)}`}></div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <p className="text-sm font-medium dark:text-white truncate">
                            {activity.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(activity.status)}
                          <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                      {activity.detail && (
                        <p className="text-xs text-muted-foreground pl-6 break-words">
                          {activity.type === 'order' ? `Amount: ${activity.detail}` : 
                           activity.type === 'product' ? `Product: ${activity.detail}` : 
                           `Details: ${activity.detail}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions - Takes 1/3 width on lg screens, full width below */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-lg min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg dark:text-white">Quick Actions</CardTitle>
              <CardDescription className="text-sm">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start p-3 h-auto text-left transition-all duration-200 ${action.color} min-w-0`}
                    onClick={() => navigate(action.path)}
                  >
                    <div className="flex items-start space-x-3 w-full min-w-0">
                      <action.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{action.title}</p>
                        <p className="text-xs opacity-80 break-words line-clamp-2">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
