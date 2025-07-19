
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductsTable from "@/components/admin/ProductsTable";
import StatsCard from "@/components/admin/StatsCard";
import { useState, useEffect } from "react";
import { adminApiService } from "../../services/adminApi";
import { Search, Filter, Plus, Package, AlertTriangle, CheckCircle, XCircle, Loader, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    inactiveProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      setLoading(true);
      const stats = await adminApiService.getProductStats();
      setProductStats({
        totalProducts: stats.totalProducts || 0,
        activeProducts: stats.activeProducts || 0,
        outOfStockProducts: stats.outOfStockProducts || 0,
        inactiveProducts: stats.inactiveProducts || 0
      });
      toast({
        title: "Success",
        description: "Product statistics refreshed successfully",
      });
    } catch (error) {
      console.error('Error fetching product stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProductStats();
      // Trigger refresh in ProductsTable component
      window.dispatchEvent(new CustomEvent('refreshProductsTable'));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600">Manage your product catalog and inventory with real-time data</p>
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin mr-2" />
            <span>Loading stats...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Products"
              value={productStats.totalProducts.toString()}
              description="All products in catalog"
              icon={Package}
            />
            <StatsCard
              title="Active Products"
              value={productStats.activeProducts.toString()}
              description="Currently selling"
              icon={CheckCircle}
            />
            <StatsCard
              title="Out of Stock"
              value={productStats.outOfStockProducts.toString()}
              description="Need restocking"
              icon={AlertTriangle}
            />
            <StatsCard
              title="Inactive Products"
              value={productStats.inactiveProducts.toString()}
              description="Not selling"
              icon={XCircle}
            />
          </div>
        )}

        {/* Products Table - Self-contained component with database connectivity */}
        <ProductsTable />
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
