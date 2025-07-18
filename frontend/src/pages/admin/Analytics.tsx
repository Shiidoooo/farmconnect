
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import CategoryChart from "@/components/admin/charts/CategoryChart";
import CustomerChart from "@/components/admin/charts/CustomerChart";
import ConversionChart from "@/components/admin/charts/ConversionChart";
import PaymentScheduleChart from "@/components/admin/charts/PaymentScheduleChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";

const AdminAnalytics = () => {
  const analyticsData = [
    { title: "Revenue Growth", value: "+23.5%", description: "vs last month", color: "text-green-600", icon: DollarSign },
    { title: "Customer Acquisition", value: "+18.2%", description: "new customers", color: "text-blue-600", icon: Users },
    { title: "Conversion Rate", value: "3.24%", description: "avg conversion", color: "text-purple-600", icon: TrendingUp },
    { title: "Cart Abandonment", value: "68.5%", description: "abandoned carts", color: "text-red-600", icon: ShoppingCart },
  ];

  const salesTrends = [
    { month: "Jan", sales: 12500, orders: 245 },
    { month: "Feb", sales: 15200, orders: 289 },
    { month: "Mar", sales: 18900, orders: 356 },
    { month: "Apr", sales: 22100, orders: 412 },
    { month: "May", sales: 19800, orders: 378 },
    { month: "Jun", sales: 25600, orders: 487 },
  ];

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
          {analyticsData.map((item, index) => (
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
          <CustomerChart />
          <ConversionChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PaymentScheduleChart />
          
          {/* Sales Trends */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Sales Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesTrends.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium dark:text-white">{item.month}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600 dark:text-red-400">₱{item.sales.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
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
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🌱</span>
                  <div>
                    <div className="font-medium dark:text-white">Seeds & Seedlings</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">1,234 sold</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">+15.2%</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🛠️</span>
                  <div>
                    <div className="font-medium dark:text-white">Garden Tools</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">892 sold</div>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">+8.7%</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🌿</span>
                  <div>
                    <div className="font-medium dark:text-white">Fertilizers</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">567 sold</div>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700">+12.4%</Badge>
              </div>
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
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">2,456</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Customers</div>
                <Badge className="mt-2 bg-green-100 text-green-700">+5.2% this month</Badge>
              </div>
              
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">₱185.50</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</div>
                <Badge className="mt-2 bg-green-100 text-green-700">+2.8% this month</Badge>
              </div>
              
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">78.5%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
                <Badge className="mt-2 bg-green-100 text-green-700">+1.2% this month</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
