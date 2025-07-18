
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductsTable from "@/components/admin/ProductsTable";
import StatsCard from "@/components/admin/StatsCard";
import { Search, Filter, Plus, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const AdminProducts = () => {
  const products = [
    { id: "1", name: "Organic Tomato Seeds", category: "Seeds", price: "₱15.00", stock: 150, status: "active" as const, image: "🍅" },
    { id: "2", name: "Lettuce Starter Kit", category: "Kits", price: "₱24.00", stock: 89, status: "active" as const, image: "🥬" },
    { id: "3", name: "Herb Garden Bundle", category: "Bundles", price: "₱46.80", stock: 0, status: "out_of_stock" as const, image: "🌿" },
    { id: "4", name: "Composting Kit", category: "Tools", price: "₱105.24", stock: 25, status: "active" as const, image: "♻️" },
    { id: "5", name: "Garden Tool Set", category: "Tools", price: "₱20.50", stock: 67, status: "active" as const, image: "🛠️" },
    { id: "6", name: "Fertilizer Pack", category: "Fertilizers", price: "₱32.00", stock: 0, status: "out_of_stock" as const, image: "🌱" },
    { id: "7", name: "Watering Can", category: "Tools", price: "₱18.00", stock: 43, status: "inactive" as const, image: "💧" },
    { id: "8", name: "Seed Starter Tray", category: "Tools", price: "₱9.50", stock: 124, status: "active" as const, image: "📦" },
  ];

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
            value="567"
            change="+5.1%"
            changeType="positive"
            icon={Package}
          />
          <StatsCard
            title="Active Products"
            value="512"
            description="Currently selling"
            icon={CheckCircle}
          />
          <StatsCard
            title="Out of Stock"
            value="23"
            description="Need restocking"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Inactive Products"
            value="32"
            description="Not selling"
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
                  <Input placeholder="Search products..." className="pl-10 w-full sm:w-64" />
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
            <ProductsTable products={products} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
