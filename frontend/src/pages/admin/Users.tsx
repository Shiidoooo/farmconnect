 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import UsersTable from "@/components/admin/UsersTable";
import AddUserDialog from "@/components/admin/AddUserDialog";
import { useState, useEffect } from "react";
import { adminApiService } from "../../services/adminApi";
import { 
  UserPlus, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  ShoppingBag, 
  Loader,
  Store,
  RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  customerCount: number;
  sellerCount: number;
}

const AdminUsers = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newUsersThisMonth: 0,
    customerCount: 0,
    sellerCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getUserStats();
      
      if (response.success) {
        setUserStats(response.data);
        toast({
          title: "Success",
          description: "User statistics refreshed successfully",
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserStats();
      // Trigger refresh in UsersTable component
      window.dispatchEvent(new CustomEvent('refreshUsersTable'));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserAdded = () => {
    // Refresh stats and trigger table refresh when new user is added
    fetchUserStats();
    window.dispatchEvent(new CustomEvent('refreshUsersTable'));
  };

  const StatCard = ({ title, value, description, icon: Icon, color }: any) => (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
          </div>
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage customers and sellers with real-time database connectivity
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="border-gray-300 dark:border-gray-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <AddUserDialog onUserAdded={handleUserAdded} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="Total Users"
            value={userStats.totalUsers.toString()}
            description="All registered users"
            icon={Users}
            color="bg-blue-500"
          />
          
          <StatCard
            title="Active Users"
            value={userStats.activeUsers.toString()}
            description="Currently active"
            icon={UserCheck}
            color="bg-green-500"
          />
          
          <StatCard
            title="Suspended"
            value={userStats.suspendedUsers.toString()}
            description="Suspended accounts"
            icon={UserX}
            color="bg-red-500"
          />
          
          <StatCard
            title="New This Month"
            value={userStats.newUsersThisMonth.toString()}
            description="Recent signups"
            icon={Calendar}
            color="bg-purple-500"
          />
          
          <StatCard
            title="Customers"
            value={userStats.customerCount.toString()}
            description="Buyers only"
            icon={ShoppingBag}
            color="bg-indigo-500"
          />
          
          <StatCard
            title="Sellers"
            value={userStats.sellerCount.toString()}
            description="Product sellers"
            icon={Store}
            color="bg-orange-500"
          />
        </div>

        {/* Users Table - Database Connected Component */}
        <UsersTable />
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
