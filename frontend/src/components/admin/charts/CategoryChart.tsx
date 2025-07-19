
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useProductAnalytics } from "../../../hooks/useAdminData";
import { Loader } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CategoryChart = () => {
  const { data: productData, loading, error } = useProductAnalytics();

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
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
          <CardTitle>Product Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            Error loading category data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform the product data for the chart - using data instead of categories
  const chartData = productData?.data?.map((item, index) => ({
    name: item._id || 'Uncategorized',
    value: item.totalQuantity,
    revenue: item.revenue,
    fill: COLORS[index % COLORS.length]
  })) || [];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Product Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 min-w-0"> {/* Prevent overflow */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `Quantity: ${value}`,
                  `Revenue: ₱${props.payload.revenue?.toLocaleString()}`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto"> {/* Scrollable legend */}
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center min-w-0 flex-1">
                <div 
                  className="w-3 h-3 rounded mr-2 flex-shrink-0" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="dark:text-gray-300 truncate capitalize">{item.name}</span>
              </div>
              <span className="font-medium dark:text-white flex-shrink-0 ml-2">{item.value} units</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
