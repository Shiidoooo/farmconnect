
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  trend?: "up" | "down";
  description?: string;
  icon?: LucideIcon;
}

const StatsCard = ({ title, value, change, changeType, trend, description, icon: Icon }: StatsCardProps) => {
  const getChangeColor = () => {
    if (changeType === "positive" || trend === "up") {
      return "text-green-600 dark:text-green-400";
    } else if (changeType === "negative" || trend === "down") {
      return "text-red-600 dark:text-red-400";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card className="w-full h-full dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <CardContent className="p-4 sm:p-5 lg:p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Header with title and icon */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate leading-tight">
                {title}
              </p>
            </div>
            {Icon && (
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          
          {/* Value */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">
              {value}
            </p>
          </div>
          
          {/* Change/Description */}
          {(change || description) && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className={`text-xs sm:text-sm font-medium ${getChangeColor()} break-words`}>
                {change || description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
