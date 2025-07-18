
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartData = [
  { day: "Mon", orders: 45, completed: 42 },
  { day: "Tue", orders: 52, completed: 48 },
  { day: "Wed", orders: 38, completed: 35 },
  { day: "Thu", orders: 67, completed: 63 },
  { day: "Fri", orders: 78, completed: 72 },
  { day: "Sat", orders: 89, completed: 85 },
  { day: "Sun", orders: 56, completed: 52 },
];

const chartConfig = {
  orders: {
    label: "Total Orders",
    color: "hsl(var(--chart-3))",
  },
  completed: {
    label: "Completed Orders",
    color: "hsl(var(--chart-4))",
  },
};

const OrdersChart = () => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Weekly Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <LineChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
