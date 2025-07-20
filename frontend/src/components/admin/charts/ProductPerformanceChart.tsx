import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Star, DollarSign } from "lucide-react";

const ProductPerformanceChart = ({ productData }: { productData?: any }) => {
  // Sample product performance data - in real implementation, this would come from props
  const defaultProductData = productData?.topProducts || [
    { 
      productName: "Organic Tomatoes", 
      totalSold: 145, 
      revenue: 14500,
      rating: 4.8,
      trend: "up",
      category: "Vegetables"
    },
    { 
      productName: "Fresh Lettuce", 
      totalSold: 98, 
      revenue: 4900,
      rating: 4.6,
      trend: "up",
      category: "Vegetables"
    },
    { 
      productName: "Garden Hose", 
      totalSold: 67, 
      revenue: 13400,
      rating: 4.9,
      trend: "down",
      category: "Tools"
    },
    { 
      productName: "Organic Carrots", 
      totalSold: 89, 
      revenue: 6230,
      rating: 4.7,
      trend: "up",
      category: "Vegetables"
    },
    { 
      productName: "Fertilizer Mix", 
      totalSold: 45, 
      revenue: 9000,
      rating: 4.5,
      trend: "stable",
      category: "Fertilizers"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vegetables': return 'bg-green-100 text-green-700';
      case 'fruits': return 'bg-orange-100 text-orange-700';
      case 'tools': return 'bg-blue-100 text-blue-700';
      case 'fertilizers': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center gap-2">
          <Package className="h-5 w-5" />
          Top Performing Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {defaultProductData.slice(0, 5).map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {product.productName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getCategoryColor(product.category)}>
                        {product.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Units Sold:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {product.totalSold} units
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ₱{product.revenue?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 ml-4">
                {getTrendIcon(product.trend)}
                <span className={`text-xs font-medium ${getTrendColor(product.trend)}`}>
                  {product.trend === 'up' ? '+12%' : product.trend === 'down' ? '-5%' : '0%'}
                </span>
              </div>
            </div>
          ))}

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {defaultProductData.reduce((sum, product) => sum + product.totalSold, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Units Sold</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₱{defaultProductData.reduce((sum, product) => sum + product.revenue, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {(defaultProductData.reduce((sum, product) => sum + product.rating, 0) / defaultProductData.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPerformanceChart;
