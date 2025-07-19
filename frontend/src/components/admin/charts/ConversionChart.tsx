
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const conversionData = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 2.8 },
  { month: "Mar", rate: 3.2 },
  { month: "Apr", rate: 3.8 },
  { month: "May", rate: 3.1 },
  { month: "Jun", rate: 4.2 },
  { month: "Jul", rate: 3.7 },
  { month: "Aug", rate: 4.1 },
];

const chartConfig = {
  rate: {
    label: "Conversion Rate",
    color: "hsl(var(--chart-1))",
  },
};

const ConversionChart = () => {
  return (
    <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl dark:text-white">Conversion Rate</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">3.24%</span>
          <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">↗ +0.4%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart 
              data={conversionData} 
              width={600} 
              height={200}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(142, 71%, 45%)" 
                strokeWidth={3}
                dot={{ fill: "hsl(142, 71%, 45%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(142, 71%, 45%)", strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionChart;
