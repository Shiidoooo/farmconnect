import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Loader } from "lucide-react";
import { useSalesAnalytics } from "../../../hooks/useAdminData";

const RevenueChart = () => {
  const [period, setPeriod] = useState("monthly");
  const [chartType, setChartType] = useState("line");
  
  // Use real backend data
  const { data: salesData, loading, error, refetch } = useSalesAnalytics({ 
    period: period as 'daily' | 'weekly' | 'monthly' | 'yearly' 
  });

  // Transform backend data for chart display
  const transformDataForChart = (rawData: any[]) => {
    return rawData.map((item) => ({
      label: formatLabel(item._id, period),
      revenue: item.revenue,
      orders: item.orders,
      averageOrderValue: item.averageOrderValue,
    }));
  };

  const formatLabel = (dateString: string, period: string) => {
    try {
      switch (period) {
        case 'daily':
          return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'weekly':
          return `Week ${dateString.split('-W')[1] || dateString}`;
        case 'yearly':
          return dateString;
        default: // monthly
          const date = new Date(dateString + '-01');
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    } catch {
      return dateString;
    }
  };

  const chartData = salesData ? transformDataForChart(salesData) : [];

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1]?.revenue || 0;
    const previous = chartData[chartData.length - 2]?.revenue || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const growth = calculateGrowth();
  const totalRevenue = chartData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  const periodOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const chartTypeOptions = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "area", label: "Area Chart" },
  ];

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="label" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar 
              dataKey="revenue" 
              fill="rgb(220, 38, 38)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(220, 38, 38)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgb(220, 38, 38)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="label" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="rgb(220, 38, 38)"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="label" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="rgb(220, 38, 38)" 
              strokeWidth={3}
              dot={{ fill: 'rgb(220, 38, 38)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'rgb(220, 38, 38)' }}
            />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Revenue Analytics
            <Loader className="w-4 h-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <p>Error loading data: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <CardTitle className="dark:text-white flex items-center gap-2 text-lg sm:text-xl">
              <DollarSign className="w-5 h-5 text-red-600" />
              Revenue Analytics
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span>Total: ₱{totalRevenue.toLocaleString()}</span>
              <span>Avg: ₱{Math.round(avgRevenue).toLocaleString()}</span>
              <div className={`flex items-center gap-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(growth).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-row">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-full sm:w-[130px] h-9">
                <SelectValue placeholder="Chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] sm:h-[350px] lg:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
