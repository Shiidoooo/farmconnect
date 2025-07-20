
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import OrdersChart from "@/components/admin/charts/OrdersChart";
import CategoryChart from "@/components/admin/charts/CategoryChart";
import OrderStatusChart from "@/components/admin/charts/OrderStatusChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Package, TrendingUp, Activity, Clock, Plus, Eye, UserPlus, Settings, Loader } from "lucide-react";
import { useDashboardStats } from "../../hooks/useAdminData";

const Dashboard = () => {
  const { stats, loading, error, refetch } = useDashboardStats();

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

  const quickActions = [
    {
      title: "Add New Product",
      description: "Create a new product listing",
      icon: Plus,
      color: "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      title: "View Pending Orders",
      description: "Check orders awaiting processing",
      icon: Eye,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      title: "Manage Users",
      description: "User management and permissions",
      icon: UserPlus,
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400"
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      color: "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400"
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="Total Sales"
            value={`₱${stats?.totalSales?.toLocaleString() || '0'}`}
            description={`₱${stats?.todaySales?.toLocaleString() || '0'} today`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Platform Revenue"
            value={`₱${stats?.totalRevenue?.toLocaleString() || '0'}`}
            description={`₱${stats?.todayRevenue?.toLocaleString() || '0'} today (2%)`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || '0'}
            description="Active customers"
            icon={Users}
          />
          <StatsCard
            title="Orders"
            value={stats?.totalOrders?.toLocaleString() || '0'}
            description={`${stats?.deliveredOrders || 0} delivered`}
            icon={ShoppingCart}
          />
          <StatsCard
            title="Products"
            value={stats?.totalProducts?.toLocaleString() || '0'}
            description={`${stats?.lowStockProducts?.length || 0} low stock`}
            icon={Package}
          />
        </div>

        {/* Revenue Chart - Full width with proper spacing */}
        <div className="w-full">
          <RevenueChart />
        </div>

        {/* Additional Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <OrdersChart />
          <CategoryChart />
          <OrderStatusChart />
        </div>

        {/* Bottom Section - Responsive grid that stacks properly */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity - Takes 2/3 width on xl screens, full width below */}
          <Card className="xl:col-span-2 dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
                    <Activity className="w-5 h-5 text-red-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Latest activities on your platform
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="self-start sm:self-auto">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${getActivityColor(activity.status)}`}></div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getActivityIcon(activity.type)}
                        <p className="text-sm font-medium dark:text-white truncate">
                          {activity.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(activity.status)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    {activity.detail && (
                      <p className="text-xs text-muted-foreground pl-6">
                        {activity.type === 'order' ? `Amount: ${activity.detail}` : 
                         activity.type === 'product' ? `Product: ${activity.detail}` : 
                         `Details: ${activity.detail}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Quick Actions - Takes 1/3 width on xl screens, full width below */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg dark:text-white">Quick Actions</CardTitle>
              <CardDescription className="text-sm">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start p-3 h-auto text-left transition-all duration-200 ${action.color}`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <action.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs opacity-80 break-words">{action.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
