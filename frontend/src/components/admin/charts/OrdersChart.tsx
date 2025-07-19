
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { useOrderAnalytics } from "../../../hooks/useAdminData";
import { Loader } from "lucide-react";

const OrdersChart = () => {
  const { data: orderData, loading, error } = useOrderAnalytics();

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Orders Analytics</CardTitle>
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
          <CardTitle>Orders Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            Error loading orders data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform the order data for the chart
  // Backend returns: { data: orderTrends, orderStatusDistribution, ... }
  const chartData = orderData?.data || [];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Orders Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 min-w-0"> {/* Prevent overflow */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Format date strings for display
                  try {
                    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric' 
                    });
                  } catch {
                    return value;
                  }
                }}
                formatter={(value, name) => [value, name === 'orders' ? 'Orders' : name]}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Orders"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
