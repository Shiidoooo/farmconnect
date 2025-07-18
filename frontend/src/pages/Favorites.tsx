
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import ProductDetailDialog from "@/components/ProductDetailDialog";

const Favorites = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [favorites, setFavorites] = useState([
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
      id: 5,
      name: "Seasonal Fruit Box",
      price: "₱34.99",
      originalPrice: "₱42.99",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=300&fit=crop&crop=center",
      rating: 4.8,
      reviews: 98,
      farmer: "Orchard Dreams",
      badge: "Limited"
    }
  ]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    setAddingToCart(productId);
    
    setTimeout(() => {
      setAddingToCart(null);
      console.log(`Added product ${productId} to cart`);
    }, 1000);
  };

  const removeFavorite = (productId) => {
    setFavorites(favorites.filter(item => item.id !== productId));
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No favorites yet</h1>
          <p className="text-gray-600 mb-8">Start adding products you love to see them here!</p>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Browse Products
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Favorites</h1>
              <p className="text-gray-600">{favorites.length} items</p>
            </div>
            <Heart className="w-8 h-8 text-red-500 fill-current" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {favorites.map((product) => (
            <Card 
              key={product.id} 
              className="group border-stone-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/80 hover:bg-white text-red-500 h-6 w-6 sm:h-8 sm:w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(product.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              
              <CardContent className="p-2 sm:p-3 lg:p-4">
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-stone-800 flex-1 pr-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-stone-600">{product.rating}</span>
                  </div>
                </div>
                
                <p className="text-xs text-stone-600 mb-2">{product.farmer}</p>
                
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-sm sm:text-lg lg:text-xl font-bold text-stone-800">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-stone-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  <span className="text-xs text-stone-500">({product.reviews})</span>
                </div>
                
                <Button 
                  className={`w-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 lg:py-3 transition-all duration-300 transform ${
                    addingToCart === product.id ? 'scale-95 bg-green-600 animate-pulse' : 'hover:scale-105'
                  }`}
                  onClick={(e) => handleAddToCart(e, product.id)}
                  disabled={addingToCart === product.id}
                >
                  <ShoppingCart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${addingToCart === product.id ? 'animate-bounce' : ''}`} />
                  {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ProductDetailDialog 
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default Favorites;
