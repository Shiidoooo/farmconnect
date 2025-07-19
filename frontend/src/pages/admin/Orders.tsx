
import AdminLayout from "@/components/admin/AdminLayout";
import OrdersTable from "@/components/admin/OrdersTable";
import StatsCard from "@/components/admin/StatsCard";
import { useDashboardStats } from "@/components/admin/hooks/useAdminData";
import { ShoppingBag, Clock, CheckCircle, XCircle, TrendingUp, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminOrders = () => {
  const { stats, loading, refetch } = useDashboardStats();
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      // Trigger refresh in OrdersTable component
      window.dispatchEvent(new CustomEvent('refreshOrdersTable'));
      toast({
        title: "Success",
        description: "Orders data refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh orders data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const orderStats = [
    {
      title: "Total Orders",
      value: loading ? "..." : stats?.totalOrders?.toLocaleString() || "0",
      change: loading ? "" : "+8.2%",
      changeType: "positive" as const,
      icon: ShoppingBag,
      description: "All time orders"
    },
    {
      title: "Today's Orders",
      value: loading ? "..." : stats?.todayOrders?.toString() || "0",
      icon: Clock,
      description: "Today's orders"
    },
    {
      title: "Monthly Revenue",
      value: loading ? "..." : `₱${stats?.monthlyRevenue?.toLocaleString() || "0"}`,
      change: loading ? "" : "+12.5%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "This month"
    },
    {
      title: "Total Users",
      value: loading ? "..." : stats?.totalUsers?.toLocaleString() || "0",
      change: loading ? "" : "+5.1%",
      changeType: "positive" as const,
      icon: Users,
      description: "Registered users"
    }
  ];

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track all customer orders with seller information</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="border-gray-300 dark:border-gray-600 mt-4 sm:mt-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {orderStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              description={stat.description}
            />
          ))}
        </div>

        {/* Orders Table */}
        <OrdersTable />
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
