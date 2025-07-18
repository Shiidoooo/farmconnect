
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { format, subDays, subWeeks, subMonths, subYears } from "date-fns";

// Sample data generator for different time periods
const generateData = (period: string) => {
  const now = new Date();
  
  switch (period) {
    case "7days":
      return Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i);
        return {
          label: format(date, "EEE"),
          revenue: Math.floor(Math.random() * 2000) + 1000,
          orders: Math.floor(Math.random() * 50) + 20,
        };
      });
    
    case "30days":
      return Array.from({ length: 30 }, (_, i) => {
        const date = subDays(now, 29 - i);
        return {
          label: format(date, "MMM dd"),
          revenue: Math.floor(Math.random() * 3000) + 1500,
          orders: Math.floor(Math.random() * 80) + 30,
        };
      }).filter((_, i) => i % 3 === 0); // Show every 3rd day
    
    case "12weeks":
      return Array.from({ length: 12 }, (_, i) => {
        const date = subWeeks(now, 11 - i);
        return {
          label: `Week ${i + 1}`,
          revenue: Math.floor(Math.random() * 15000) + 8000,
          orders: Math.floor(Math.random() * 300) + 150,
        };
      });
    
    case "12months":
      return Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(now, 11 - i);
        return {
          label: format(date, "MMM yyyy"),
          revenue: Math.floor(Math.random() * 50000) + 25000,
          orders: Math.floor(Math.random() * 1000) + 500,
        };
      });
    
    case "5years":
      return Array.from({ length: 5 }, (_, i) => {
        const date = subYears(now, 4 - i);
        return {
          label: format(date, "yyyy"),
          revenue: Math.floor(Math.random() * 500000) + 300000,
          orders: Math.floor(Math.random() * 10000) + 5000,
        };
      });
    
    default:
      return [];
  }
};

const RevenueChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [chartType, setChartType] = useState("line");
  
  const data = generateData(selectedPeriod);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / data.length;
  const trend = data.length > 1 ? 
    ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue) * 100 : 0;

  const periodOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "12weeks", label: "Last 12 Weeks" },
    { value: "12months", label: "Last 12 Months" },
    { value: "5years", label: "Last 5 Years" },
  ];

  const chartTypeOptions = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "area", label: "Area Chart" },
  ];

  const renderChart = () => {
    const commonProps = {
      data,
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
              <span>Avg: ${Math.round(avgRevenue).toLocaleString()}</span>
              <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-row">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
