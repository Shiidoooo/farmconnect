import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, CheckCircle, XCircle } from "lucide-react";

const StockStatusChart = ({ stockData }: { stockData?: any }) => {
  // Sample stock data - in real implementation, this would come from props
  const defaultStockData = {
    totalProducts: stockData?.totalProducts || 127,
    inStock: stockData?.inStock || 89,
    lowStock: stockData?.lowStock || 23,
    outOfStock: stockData?.outOfStock || 15,
    stockCategories: stockData?.stockCategories || [
      { name: "Vegetables", inStock: 45, lowStock: 8, outOfStock: 3 },
      { name: "Fruits", inStock: 32, lowStock: 7, outOfStock: 5 },
      { name: "Tools", inStock: 12, lowStock: 8, outOfStock: 7 }
    ]
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'inStock': return 'text-green-600';
      case 'lowStock': return 'text-yellow-600';
      case 'outOfStock': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'inStock': return CheckCircle;
      case 'lowStock': return AlertTriangle;
      case 'outOfStock': return XCircle;
      default: return Package;
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center gap-2">
          <Package className="h-5 w-5" />
          Stock Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stock Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {defaultStockData.inStock}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Stock</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {defaultStockData.lowStock}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Low Stock</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {defaultStockData.outOfStock}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {defaultStockData.totalProducts}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Stock by Category</h4>
            {defaultStockData.stockCategories.map((category, index) => {
              const total = category.inStock + category.lowStock + category.outOfStock;
              const inStockPercent = (category.inStock / total) * 100;
              const lowStockPercent = (category.lowStock / total) * 100;
              const outOfStockPercent = (category.outOfStock / total) * 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark:text-white">{category.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{total} items</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${inStockPercent}%` }}
                        title={`In Stock: ${category.inStock}`}
                      ></div>
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${lowStockPercent}%` }}
                        title={`Low Stock: ${category.lowStock}`}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${outOfStockPercent}%` }}
                        title={`Out of Stock: ${category.outOfStock}`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 text-xs">
                    <Badge className="bg-green-100 text-green-700">
                      {category.inStock} In Stock
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      {category.lowStock} Low
                    </Badge>
                    <Badge className="bg-red-100 text-red-700">
                      {category.outOfStock} Out
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stock Alerts */}
          {defaultStockData.lowStock > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Stock Alert</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {defaultStockData.lowStock} products are running low on stock. Consider restocking soon.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockStatusChart;
