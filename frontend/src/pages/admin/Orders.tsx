
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import OrdersTable from "@/components/admin/OrdersTable";
import StatsCard from "@/components/admin/StatsCard";
import { Search, Filter, Download, ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";

const AdminOrders = () => {
  const orders = [
    { id: "1001", customer: "Juan Dela Cruz", product: "Organic Tomato Seeds", amount: "₱150.00", status: "pending" as const, date: "2024-01-15" },
    { id: "1002", customer: "Maria Santos", product: "Lettuce Starter Kit", amount: "₱240.00", status: "processing" as const, date: "2024-01-15" },
    { id: "1003", customer: "Pedro Garcia", product: "Herb Garden Bundle", amount: "₱468.00", status: "shipped" as const, date: "2024-01-14" },
    { id: "1004", customer: "Ana Rodriguez", product: "Composting Kit", amount: "₱1,052.40", status: "delivered" as const, date: "2024-01-14" },
    { id: "1005", customer: "Carlos Martinez", product: "Garden Tool Set", amount: "₱205.00", status: "cancelled" as const, date: "2024-01-13" },
    { id: "1006", customer: "Sofia Reyes", product: "Fertilizer Pack", amount: "₱320.00", status: "processing" as const, date: "2024-01-13" },
    { id: "1007", customer: "Miguel Torres", product: "Watering Can Set", amount: "₱180.00", status: "shipped" as const, date: "2024-01-12" },
    { id: "1008", customer: "Elena Morales", product: "Seed Starter Tray", amount: "₱95.00", status: "delivered" as const, date: "2024-01-12" },
  ];

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
            value="1,248"
            change="+8.2%"
            changeType="positive"
            icon={ShoppingBag}
          />
          <StatsCard
            title="Pending Orders"
            value="45"
            description="Needs attention"
            icon={Clock}
          />
          <StatsCard
            title="Completed Orders"
            value="1,156"
            change="+12.5%"
            changeType="positive"
            icon={CheckCircle}
          />
          <StatsCard
            title="Cancelled Orders"
            value="47"
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
                  <Input placeholder="Search orders..." className="pl-10 w-full sm:w-64" />
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
            <OrdersTable orders={orders} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
