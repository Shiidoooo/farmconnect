
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState } from "react";

const chartData = {
  day: [
    { period: "6AM", revenue: 1200, netIncome: 400 },
    { period: "9AM", revenue: 1800, netIncome: 600 },
    { period: "12PM", revenue: 2400, netIncome: 800 },
    { period: "3PM", revenue: 3200, netIncome: 1100 },
    { period: "6PM", revenue: 2800, netIncome: 950 },
    { period: "9PM", revenue: 1600, netIncome: 540 },
  ],
  week: [
    { period: "Mon", revenue: 12500, netIncome: 4200 },
    { period: "Tue", revenue: 15200, netIncome: 5100 },
    { period: "Wed", revenue: 18900, netIncome: 6350 },
    { period: "Thu", revenue: 22100, netIncome: 7400 },
    { period: "Fri", revenue: 19800, netIncome: 6650 },
    { period: "Sat", revenue: 25600, netIncome: 8600 },
    { period: "Sun", revenue: 16800, netIncome: 5650 },
  ],
  month: [
    { period: "Jan", revenue: 125000, netIncome: 42000 },
    { period: "Feb", revenue: 152000, netIncome: 51000 },
    { period: "Mar", revenue: 189000, netIncome: 63500 },
    { period: "Apr", revenue: 221000, netIncome: 74000 },
    { period: "May", revenue: 198000, netIncome: 66500 },
    { period: "Jun", revenue: 256000, netIncome: 86000 },
  ],
  year: [
    { period: "2019", revenue: 1200000, netIncome: 400000 },
    { period: "2020", revenue: 1520000, netIncome: 510000 },
    { period: "2021", revenue: 1890000, netIncome: 635000 },
    { period: "2022", revenue: 2210000, netIncome: 740000 },
    { period: "2023", revenue: 1980000, netIncome: 665000 },
    { period: "2024", revenue: 2560000, netIncome: 860000 },
  ],
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  netIncome: {
    label: "Net Income",
    color: "hsl(var(--chart-2))",
  },
};

const SummaryChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year">("month");

  const currentData = chartData[selectedPeriod];
  const totalRevenue = currentData.reduce((sum, item) => sum + item.revenue, 0);
  const lastPeriodRevenue = totalRevenue * 0.8; // Mock previous period data
  const growthPercent = ((totalRevenue - lastPeriodRevenue) / lastPeriodRevenue * 100).toFixed(1);

  return (
    <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl dark:text-white">Revenue Overview</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                ${totalRevenue.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                ↗ {growthPercent}% from last {selectedPeriod}
              </span>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart 
              data={currentData} 
              width={800} 
              height={250}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="period" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="revenue" 
                fill="hsl(24, 95%, 66%)"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey="netIncome" 
                fill="hsl(262, 83%, 58%)"
                radius={[4, 4, 0, 0]}
                opacity={0.9}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Net Income</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryChart;
