
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import OrdersTable from "@/components/admin/OrdersTable";
import StatsCard from "@/components/admin/StatsCard";
import { Search, Filter, Download, ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import { adminAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders with params:', { page: currentPage, limit: 20, search: searchTerm });
      
      const response = await adminAPI.getOrders({
        page: currentPage,
        limit: 20,
        search: searchTerm
      });
      
      console.log('Orders API response:', response);
      
      // Check for both response structures - admin API returns 'orders', regular API returns 'data'
      const orders = response.orders || response.data || [];
      
      if (orders && orders.length >= 0) {
        setOrders(orders);
        console.log('Orders set:', orders);
        
        // Calculate stats
        const pending = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length;
        const completed = orders.filter(o => o.orderStatus === 'delivered').length;
        const cancelled = orders.filter(o => o.orderStatus === 'cancelled').length;
        
        setStats({
          total: response.totalOrders || orders.length,
          pending,
          completed,
          cancelled
        });
      } else {
        console.log('No orders found in response');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Orders"
            value={stats.total.toString()}
            change="+8.2%"
            changeType="positive"
            icon={ShoppingBag}
          />
          <StatsCard
            title="Pending Orders"
            value={stats.pending.toString()}
            description="Needs attention"
            icon={Clock}
          />
          <StatsCard
            title="Completed Orders"
            value={stats.completed.toString()}
            change="+12.5%"
            changeType="positive"
            icon={CheckCircle}
          />
          <StatsCard
            title="Cancelled Orders"
            value={stats.cancelled.toString()}
            change="-2.1%"
            changeType="negative"
            icon={XCircle}
          />
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Orders</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-lg">Loading orders...</div>
              </div>
            ) : (
              <OrdersTable orders={orders} />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
