
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ShoppingCart, Star, Filter, Eye, TrendingUp } from "lucide-react";
import { useState } from "react";

const Products = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = [
    { name: "All", active: true },
    { name: "Vegetables", active: false },
    { name: "Fruits", active: false },
    { name: "Herbs", active: false },
    { name: "Flowers", active: false, badge: "New" }
  ];

  const topSellingProducts = [
    {
      id: 1,
      name: "Organic Tomatoes",
      price: "₱8.99",
      originalPrice: "₱12.99",
      rating: 4.9,
      reviews: 124,
      sold: 1200,
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center"
    },
    {
      id: 2,
      name: "Fresh Herbs Bundle",
      price: "₱15.99",
      rating: 4.8,
      reviews: 89,
      sold: 890,
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop&crop=center"
    },
    {
      id: 3,
      name: "Mixed Vegetables",
      price: "₱22.50",
      originalPrice: "₱28.00",
      rating: 4.7,
      reviews: 156,
      sold: 650,
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop&crop=center"
    }
  ];

  const allProducts = [
    ...topSellingProducts,
    {
      id: 4,
      name: "Leafy Greens Pack",
      price: "₱12.99",
      rating: 4.9,
      reviews: 203,
      sold: 450,
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=300&fit=crop&crop=center"
    },
    {
      id: 5,
      name: "Seasonal Fruit Box",
      price: "₱34.99",
      originalPrice: "₱42.99",
      rating: 4.8,
      reviews: 98,
      sold: 320,
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=300&fit=crop&crop=center"
    },
    {
      id: 6,
      name: "Root Vegetables",
      price: "₱18.75",
      rating: 4.6,
      reviews: 67,
      sold: 280,
      image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=300&h=300&fit=crop&crop=center"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-farm-green-600 to-farm-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Fresh From Your Neighbor's Garden
            </h1>
            <p className="text-base sm:text-lg text-farm-green-100 max-w-2xl mx-auto">
              Discover fresh, organic produce grown right in your community's backyard gardens
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Top Selling Section */}
        <section className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Top Selling</h2>
            </div>
            <Badge className="bg-orange-100 text-orange-800 text-xs sm:text-sm">
              Bestsellers This Week
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {topSellingProducts.map((product, index) => (
              <Card key={product.id} className="border-orange-200 hover:shadow-lg transition-shadow relative">
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-orange-500 text-white text-xs">
                    #{index + 1} Top Seller
                  </Badge>
                </div>
                <CardContent className="p-3 lg:p-4">
                  <div className="relative mb-3 lg:mb-4">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-36 lg:h-48 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-gray-600">{product.sold} sold</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">{product.name}</h3>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs lg:text-sm text-gray-600">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3 lg:mb-4">
                    <span className="text-lg lg:text-xl font-bold text-orange-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs lg:text-sm text-gray-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs lg:text-sm py-2">
                    <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Filter Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2 lg:gap-4">
            {categories.map((category, index) => (
              <div key={index} className="relative">
                <Button
                  variant={category.active ? "default" : "outline"}
                  size="sm"
                  className={`text-xs lg:text-sm ${
                    category.active 
                      ? "bg-farm-green-600 text-white" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </Button>
                {category.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-400 text-white text-xs">
                    {category.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 text-xs lg:text-sm">
              <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300 text-gray-600 text-xs lg:text-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* All Products Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">All Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {allProducts.map((product) => (
              <Card key={product.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 lg:p-4">
                  <div className="relative mb-3 lg:mb-4">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-36 lg:h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{product.rating}</span>
                    </div>
                    {product.sold && (
                      <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-full">
                        <span className="text-xs text-gray-600">{product.sold} sold</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">{product.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">Fresh from backyard garden</p>
                  
                  <div className="flex items-center space-x-2 mb-3 lg:mb-4">
                    <span className="text-lg lg:text-xl font-bold text-farm-green-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs lg:text-sm text-gray-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  
                  <Button className="w-full bg-farm-green-600 hover:bg-farm-green-700 text-white text-xs lg:text-sm py-2">
                    <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
