import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Loader, BarChart3 } from 'lucide-react';
import { useSalesAnalytics } from '@/hooks/useAdminData';

const GrowthChart = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>("monthly");
  const [chartType, setChartType] = useState("area");
  const { data: salesData, loading, error, refetch } = useSalesAnalytics({ period });

  const transformDataForChart = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => {
      let label = '';
      const dateString = item._id || item.date || '';
      
      try {
        switch (period) {
          case 'daily':
            const dailyDate = new Date(dateString);
            label = dailyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            break;
          case 'weekly':
            label = `Week ${dateString.split('-W')[1] || dateString}`;
            break;
          case 'yearly':
            label = dateString;
            break;
          default: // monthly
            const monthlyDate = new Date(dateString + '-01');
            label = monthlyDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            break;
        }
      } catch {
        label = dateString;
      }

      // Calculate growth percentage compared to previous period
      let growthRate = 0;
      if (index > 0 && data[index - 1]) {
        const currentRevenue = item.totalRevenue || 0;
        const previousRevenue = data[index - 1].totalRevenue || 0;
        if (previousRevenue > 0) {
          growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        }
      }

      return {
        label,
        growth: Math.round(growthRate * 100) / 100, // Round to 2 decimal places
        revenue: item.totalRevenue || 0,
        orders: item.totalOrders || 0
      };
    });
  };

  const chartData = salesData && !loading ? transformDataForChart(salesData) : [];

  // Show loading state
  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dark:text-white">Growth Analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <div className="text-center space-y-4">
            <Loader className="w-8 h-8 animate-spin mx-auto text-green-600" />
            <p className="text-muted-foreground">Loading growth data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dark:text-white">Growth Analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg">Error loading data</div>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const avgGrowth = chartData.length > 0 ? 
    chartData.reduce((sum, item) => sum + (item.growth || 0), 0) / chartData.length : 0;
  const maxGrowth = Math.max(...chartData.map(item => item.growth || 0));
  const minGrowth = Math.min(...chartData.map(item => item.growth || 0));

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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="label" 
                fontSize={10}
                tick={{ fill: 'currentColor' }}
                axisLine={false}
              />
              <YAxis 
                fontSize={10}
                tick={{ fill: 'currentColor' }}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Growth Rate']}
              />
              <Bar 
                dataKey="growth" 
                fill="rgb(34, 197, 94)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case "area":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="label" 
                fontSize={10}
                tick={{ fill: 'currentColor' }}
                axisLine={false}
              />
              <YAxis 
                fontSize={10}
                tick={{ fill: 'currentColor' }}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Growth Rate']}
              />
              <Area
                type="monotone"
                dataKey="growth"
                stroke="rgb(34, 197, 94)"
                fillOpacity={1}
                fill="url(#colorGrowth)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="label" 
                fontSize={10}
                tick={{ fill: 'currentColor' }}
                axisLine={false}
              />
              <YAxis 
                fontSize={10}
                tick={{ fill: 'currentColor' }}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Growth Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="growth" 
                stroke="rgb(34, 197, 94)" 
                strokeWidth={2}
                dot={{ fill: 'rgb(34, 197, 94)', strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5, fill: 'rgb(34, 197, 94)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="w-full dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <CardTitle className="dark:text-white flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Growth Analytics
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>Avg: {avgGrowth.toFixed(1)}%</span>
              <span>Max: {maxGrowth.toFixed(1)}%</span>
              <div className={`flex items-center gap-1 ${avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgGrowth >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span>Trend</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={period} onValueChange={(value) => setPeriod(value as 'daily' | 'weekly' | 'monthly' | 'yearly')}>
              <SelectTrigger className="w-full sm:w-[120px] lg:w-[140px] h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Period" />
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
              <SelectTrigger className="w-full sm:w-[100px] lg:w-[120px] h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Type" />
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
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
