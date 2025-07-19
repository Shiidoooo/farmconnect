import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useOrderAnalytics } from "../../../hooks/useAdminData";
import { Loader } from "lucide-react";

const COLORS = {
  'pending': '#FFA500',
  'confirmed': '#00C49F', 
  'processing': '#0088FE',
  'shipped': '#FFBB28',
  'delivered': '#00C851',
  'cancelled': '#FF8042'
};

const OrderStatusChart = () => {
  const { data: orderData, loading, error } = useOrderAnalytics();

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            Error loading order status data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform the order status data for the chart
  const chartData = orderData?.orderStatusDistribution?.map((item) => ({
    name: item._id || 'Unknown',
    value: item.count,
    fill: COLORS[item._id as keyof typeof COLORS] || '#8884d8'
  })) || [];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <PieChart width={400} height={256}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div className="mt-4 space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded mr-2" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="dark:text-gray-300 capitalize">{item.name}</span>
              </div>
              <span className="font-medium dark:text-white">{item.value} orders</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusChart;
