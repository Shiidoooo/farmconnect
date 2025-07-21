
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductDetailDialog from "./ProductDetailDialog";
import { productsAPI } from "@/services/api";

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAllProducts();
      
      if (response.success && response.data) {
        // Take only the first 8 products for the grid display
        const limitedProducts = response.data.slice(0, 8);
        setProducts(limitedProducts);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2)}`;
  };

  const getProductPrice = (product) => {
    if (product.hasMultipleSizes && product.sizeVariants?.length > 0) {
      // For products with multiple sizes, show the cheapest price
      return Math.min(...product.sizeVariants.map(v => v.price));
    }
    return product.productPrice;
  };

  const getProductStock = (product) => {
    if (product.hasMultipleSizes && product.sizeVariants?.length > 0) {
      // For products with multiple sizes, show total stock
      return product.sizeVariants.reduce((total, variant) => total + variant.stock, 0);
    }
    return product.productStock;
  };

  const getBadgeForProduct = (product) => {
    // Determine badge based on product properties
    if (product.featured) return { text: 'Featured', color: 'bg-red-600' };
    if (product.isNew || (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000) {
      return { text: 'New', color: 'bg-green-600' };
    }
    if (product.discount && product.discount > 0) {
      return { text: 'Sale', color: 'bg-red-500' };
    }
    const stock = getProductStock(product);
    if (stock < 10) {
      return { text: 'Limited', color: 'bg-orange-500' };
    }
    return null;
  };

  const getImageUrl = (product) => {
    if (product.productimage && product.productimage.length > 0) {
      return product.productimage[currentImageIndex[product._id] || 0]?.url;
    }
    // Use the same fallback as Shop page
    return "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=300&fit=crop&crop=center";
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

  const calculateOriginalPrice = (price, discount) => {
    if (discount && discount > 0) {
      return (price / (1 - discount / 100)).toFixed(2);
    }
    return null;
  };

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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="border-stone-200 overflow-hidden animate-pulse">
                <div className="bg-gray-300 h-40 sm:h-48"></div>
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-gray-300 h-4 mb-2 rounded"></div>
                  <div className="bg-gray-300 h-3 mb-3 rounded w-2/3"></div>
                  <div className="bg-gray-300 h-4 mb-4 rounded w-1/2"></div>
                  <div className="bg-gray-300 h-10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProducts} variant="outline">
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 mb-4">No products available at the moment.</p>
            <Link to="/shop">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => {
              const badge = getBadgeForProduct(product);
              const originalPrice = calculateOriginalPrice(getProductPrice(product), product.discount);
              
              return (
                <Card 
                  key={product._id} 
                  className="group border-stone-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={getImageUrl(product)}
                      alt={product.productName}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={(e) => handleImageClick(e, product._id, product.productimage?.length || 0)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=300&fit=crop&crop=center";
                      }}
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
                    
                    {badge && (
                      <Badge 
                        className={`absolute top-2 sm:top-3 left-2 sm:left-3 text-xs sm:text-sm ${badge.color} text-white`}
                      >
                        {badge.text}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-stone-800 flex-1 pr-2">{product.productName}</h3>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm text-stone-600">
                          {product.averageRating ? product.averageRating.toFixed(1) : '4.5'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-stone-600 mb-3">
                      by {product.user?.farmName || product.user?.firstName || 'Local Farmer'}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg sm:text-xl font-bold text-stone-800">
                          {formatPrice(getProductPrice(product))}
                          {product.hasMultipleSizes && product.sizeVariants?.length > 0 && (
                            <span className="text-xs text-stone-500 ml-1">+</span>
                          )}
                        </span>
                        {originalPrice && (
                          <span className="text-xs sm:text-sm text-stone-500 line-through">
                            ₱{originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm text-stone-500">
                        ({product.totalRatings || 0} reviews)
                      </span>
                    </div>
                    
                    <Button 
                      className={`w-full bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 transform ${
                        addingToCart === product._id ? 'scale-95 bg-green-600 animate-pulse' : 'hover:scale-105'
                      }`}
                      onClick={(e) => handleAddToCart(e, product._id)}
                      disabled={addingToCart === product._id || getProductStock(product) === 0}
                    >
                      <ShoppingCart className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${addingToCart === product._id ? 'animate-bounce' : ''}`} />
                      {getProductStock(product) === 0 ? 'Out of Stock' : 
                       addingToCart === product._id ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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
