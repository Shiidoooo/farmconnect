
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", newCustomers: 85, returningCustomers: 120 },
  { month: "Feb", newCustomers: 92, returningCustomers: 135 },
  { month: "Mar", newCustomers: 108, returningCustomers: 156 },
  { month: "Apr", newCustomers: 125, returningCustomers: 178 },
  { month: "May", newCustomers: 118, returningCustomers: 189 },
  { month: "Jun", newCustomers: 142, returningCustomers: 205 },
];

const chartConfig = {
  newCustomers: {
    label: "New Customers",
    color: "hsl(var(--chart-3))",
  },
  returningCustomers: {
    label: "Returning Customers",
    color: "hsl(var(--chart-4))",
  },
};

const CustomerChart = () => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Customer Acquisition</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <AreaChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="newCustomers"
              stackId="1"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="returningCustomers"
              stackId="1"
              stroke="hsl(var(--chart-4))"
              fill="hsl(var(--chart-4))"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CustomerChart;
