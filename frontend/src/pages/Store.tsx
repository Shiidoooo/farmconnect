import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductDetailDialog from "@/components/ProductDetailDialog";
import { ShoppingCart, Star, Search, Heart, User, Store as StoreIcon, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { productsAPI, authAPI } from "@/services/api";

const Store = () => {
  const { sellerId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerStats, setSellerStats] = useState({
    totalProducts: 0,
    averageRating: 0,
    totalRatings: 0,
    totalSold: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300 absolute" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!sellerId) return;

      try {
        setLoading(true);
        
        // Fetch all products to get seller's products and info
        const allProductsResponse = await productsAPI.getAllProducts();
        if (allProductsResponse.success) {
          const sellerProducts = allProductsResponse.data.filter(
            product => product.user._id === sellerId
          );
          setProducts(sellerProducts);
          
          // Get seller info from first product
          if (sellerProducts.length > 0) {
            setSellerInfo(sellerProducts[0].user);
          }
        }

        // Fetch seller statistics
        const statsResponse = await productsAPI.getSellerStats(sellerId);
        if (statsResponse.success) {
          setSellerStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [sellerId]);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleImageClick = (e, productId, totalImages) => {
    e.stopPropagation();
    if (totalImages > 1) {
      const currentIndex = currentImageIndex[productId] || 0;
      const nextIndex = (currentIndex + 1) % totalImages;
      setCurrentImageIndex(prev => ({
        ...prev,
        [productId]: nextIndex
      }));
    }
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    setAddingToCart(productId);
    
    setTimeout(() => {
      setAddingToCart(null);
      console.log(`Added product ${productId} to cart`);
    }, 1000);
  };

  const toggleFavorite = (e, productId) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-20">
          <p className="text-gray-500">Loading store...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-20">
          <p className="text-gray-500">Store not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Store Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start space-x-6">
            {/* Store Avatar */}
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <StoreIcon className="w-12 h-12 text-red-600" />
            </div>
            
            {/* Store Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{sellerInfo.name}</h1>
              <p className="text-gray-600 mb-4">{sellerInfo.email}</p>
              
              {/* Store Stats */}
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <StoreIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{sellerStats.totalProducts}</span>
                  <span className="text-gray-500">Products</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(sellerStats.averageRating)}
                  </div>
                  <span className="font-medium">{sellerStats.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({sellerStats.totalRatings} ratings)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{sellerStats.totalSold}</span>
                  <span className="text-gray-500">Sold</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products in this store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 text-sm"
              />
            </div>
          </div>
          
          {searchQuery && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Search result for "{searchQuery}" ({filteredProducts.length} products)
              </p>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="w-full">
          {filteredProducts.length === 0 && !searchQuery ? (
            <div className="text-center py-12">
              <p className="text-gray-500">This store has no products yet.</p>
            </div>
          ) : filteredProducts.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found for "{searchQuery}"</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                className="border-gray-300 text-gray-600"
              >
                Show All Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card 
                  key={product._id} 
                  className="group border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative">
                    <img 
                      src={
                        product.productimage && product.productimage.length > 0
                          ? product.productimage[currentImageIndex[product._id] || 0]?.url
                          : "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=300&fit=crop&crop=center"
                      }
                      alt={product.productName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={(e) => handleImageClick(e, product._id, product.productimage?.length || 0)}
                    />
                    
                    {/* Image indicator dots for multiple images */}
                    {product.productimage && product.productimage.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {product.productimage.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === (currentImageIndex[product._id] || 0)
                                ? 'bg-white'
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute top-2 right-2 p-1 h-8 w-8 rounded-full ${
                        favorites.has(product._id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
                      }`}
                      onClick={(e) => toggleFavorite(e, product._id)}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(product._id) ? 'fill-current' : ''}`} />
                    </Button>
                    
                    {/* Category badge */}
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-gray-700">{product.productCategory}</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm leading-tight overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {product.productName}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.productDescription}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-red-600">₱{product.productPrice}</span>
                      <span className="text-xs text-gray-500">{product.productStock} in stock</span>
                    </div>
                    
                    {/* Rating display */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(product.averageRating || 0)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.totalRatings || 0})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.totalSold || 0} sold
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        Exp: {new Date(product.productExpiryDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Listed: {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full border-red-600 text-red-600 hover:bg-red-50 text-xs py-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                      >
                        View Product Details
                      </Button>
                      
                      <Button 
                        className={`w-full bg-red-600 hover:bg-red-700 text-white text-xs py-2 transition-all duration-300 transform ${
                          addingToCart === product._id ? 'scale-95 bg-green-600 animate-pulse' : 'hover:scale-105'
                        }`}
                        onClick={(e) => handleAddToCart(e, product._id)}
                        disabled={addingToCart === product._id || product.productStock === 0}
                      >
                        <ShoppingCart className={`w-4 h-4 mr-2 ${addingToCart === product._id ? 'animate-bounce' : ''}`} />
                        {addingToCart === product._id ? 'Adding...' : product.productStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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

export default Store;
