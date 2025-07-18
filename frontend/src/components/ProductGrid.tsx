
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ProductDetailDialog from "./ProductDetailDialog";

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);

  const products = [
    {
      id: 1,
      name: "Organic Tomatoes",
      price: "₱8.99",
      originalPrice: "₱12.99",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center",
      rating: 4.9,
      reviews: 124,
      farmer: "Sarah's Garden",
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Fresh Herbs Bundle",
      price: "₱15.99",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop&crop=center",
      rating: 4.8,
      reviews: 89,
      farmer: "Green Thumb Co.",
      badge: "New"
    },
    {
      id: 3,
      name: "Mixed Vegetables",
      price: "₱22.50",
      originalPrice: "₱28.00",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop&crop=center",
      rating: 4.7,
      reviews: 156,
      farmer: "Urban Harvest",
      badge: "Sale"
    },
    {
      id: 4,
      name: "Leafy Greens Pack",
      price: "₱12.99",
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=300&fit=crop&crop=center",
      rating: 4.9,
      reviews: 203,
      farmer: "Backyard Bounty"
    },
    {
      id: 5,
      name: "Seasonal Fruit Box",
      price: "₱34.99",
      originalPrice: "₱42.99",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=300&fit=crop&crop=center",
      rating: 4.8,
      reviews: 98,
      farmer: "Orchard Dreams",
      badge: "Limited"
    },
    {
      id: 6,
      name: "Root Vegetables",
      price: "₱18.75",
      image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=300&h=300&fit=crop&crop=center",
      rating: 4.6,
      reviews: 67,
      farmer: "Earth & Soil"
    }
  ];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    setAddingToCart(productId);
    
    // Add animation effect
    setTimeout(() => {
      setAddingToCart(null);
      // Show success feedback
      console.log(`Added product ${productId} to cart`);
    }, 1000);
  };

  return (
    <section className="py-12 lg:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 mb-4">
            Fresh From Local Gardens
          </h2>
          <p className="text-base lg:text-lg text-stone-600 max-w-2xl mx-auto px-4">
            Browse our selection of fresh, organic produce grown by your neighbors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="group border-stone-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <Badge 
                    className={`absolute top-2 sm:top-3 left-2 sm:left-3 text-xs sm:text-sm ${
                      product.badge === 'Sale' ? 'bg-red-500' :
                      product.badge === 'New' ? 'bg-red-600' :
                      product.badge === 'Limited' ? 'bg-orange-500' :
                      'bg-red-600'
                    } text-white`}
                  >
                    {product.badge}
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-stone-800 flex-1 pr-2">{product.name}</h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm text-stone-600">{product.rating}</span>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-stone-600 mb-3">by {product.farmer}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl font-bold text-stone-800">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs sm:text-sm text-stone-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-stone-500">({product.reviews} reviews)</span>
                </div>
                
                <Button 
                  className={`w-full bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 transform ${
                    addingToCart === product.id ? 'scale-95 bg-green-600 animate-pulse' : 'hover:scale-105'
                  }`}
                  onClick={(e) => handleAddToCart(e, product.id)}
                  disabled={addingToCart === product.id}
                >
                  <ShoppingCart className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${addingToCart === product.id ? 'animate-bounce' : ''}`} />
                  {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 lg:mt-12">
          <Link to="/shop">
            <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
              View All Products
            </Button>
          </Link>
        </div>
      </div>

      <ProductDetailDialog 
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </section>
  );
};

export default ProductGrid;
