
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartData = [
  { period: "1-7", dayToDayPayments: 329, scheduledPayments: 240 },
  { period: "8-14", dayToDayPayments: 280, scheduledPayments: 180 },
  { period: "15-21", dayToDayPayments: 220, scheduledPayments: 320 },
  { period: "22-28", dayToDayPayments: 180, scheduledPayments: 380 },
  { period: "29-31", dayToDayPayments: 120, scheduledPayments: 280 },
];

const chartConfig = {
  dayToDayPayments: {
    label: "Day to day payments",
    color: "hsl(24, 95%, 66%)",
  },
  scheduledPayments: {
    label: "Scheduled payments",
    color: "hsl(262, 83%, 58%)",
  },
};

const PaymentScheduleChart = () => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="dark:text-white">Scheduled Payments</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">₱0</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Left to pay of ₱81
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            See all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            No upcoming payments.
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₱23</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total spend</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">₱819</div>
        </div>

        <div className="h-[200px] w-full">
          <ChartContainer config={chartConfig} className="h-full">
            <BarChart data={chartData}>
              <XAxis dataKey="period" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="dayToDayPayments" 
                fill="hsl(24, 95%, 66%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="scheduledPayments" 
                fill="hsl(262, 83%, 58%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Day to day payments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Scheduled payments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentScheduleChart;
