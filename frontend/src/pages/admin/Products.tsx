
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductsTable from "@/components/admin/ProductsTable";
import StatsCard from "@/components/admin/StatsCard";
import { Search, Filter, Plus, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { adminAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    inactive: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products with params:', { page: currentPage, limit: 20, search: searchTerm });
      
      const response = await adminAPI.getProducts({
        page: currentPage,
        limit: 20,
        search: searchTerm
      });
      
      console.log('Products API response:', response);
      
      // Check for both response structures - admin API returns 'products', regular API returns 'data'
      const products = response.products || response.data || [];
      
      if (products && products.length >= 0) {
        setProducts(products);
        console.log('Products set:', products);
        
        // Calculate stats
        const active = products.filter(p => p.productStatus === 'available').length;
        const outOfStock = products.filter(p => p.productStatus === 'out_of_stock').length;
        const inactive = products.filter(p => ['pre_order', 'coming_soon'].includes(p.productStatus)).length;
        
        setStats({
          total: response.totalProducts || products.length,
          active,
          outOfStock,
          inactive
        });
      } else {
        console.log('No products found in response');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Products"
            value={stats.total.toString()}
            change="+5.1%"
            changeType="positive"
            icon={Package}
          />
          <StatsCard
            title="Active Products"
            value={stats.active.toString()}
            description="Currently selling"
            icon={CheckCircle}
          />
          <StatsCard
            title="Out of Stock"
            value={stats.outOfStock.toString()}
            description="Sold out"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Inactive Products"
            value={stats.inactive.toString()}
            description="Pre-order/Coming soon"
            icon={XCircle}
          />
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Products</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-red-600 hover:bg-red-700" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-lg">Loading products...</div>
              </div>
            ) : (
              <ProductsTable products={products} />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
