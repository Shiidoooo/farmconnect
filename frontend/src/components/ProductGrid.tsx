
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { productsAPI } from "@/services/api";
import ProductDetailDialog from "./ProductDetailDialog";

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAllProducts();
      if (response.success) {
        // Limit to 8 products for the home page display
        setProducts(response.data.slice(0, 8));
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
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
            {loading ? "Loading Fresh Produce..." : "Fresh Local Produce"}
          </h2>
          <p className="text-base lg:text-lg text-stone-600 max-w-2xl mx-auto px-4">
            {loading 
              ? "Getting the freshest products from our local farmers..." 
              : "Browse our selection of fresh, organic produce grown by local farmers."
            }
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProducts} className="bg-red-600 hover:bg-red-700 text-white">
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
            <Card 
              key={product._id || product.id} 
              className="group border-stone-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={product.productimage?.[0]?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop&crop=center'}
                  alt={product.productName || 'Product'}
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.totalSold > 10 && (
                  <Badge 
                    className="absolute top-2 sm:top-3 left-2 sm:left-3 text-xs sm:text-sm bg-red-600 text-white"
                  >
                    Best Seller
                  </Badge>
                )}
                {product.productStock < 5 && product.productStock > 0 && (
                  <Badge 
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 text-xs sm:text-sm bg-orange-500 text-white"
                  >
                    Low Stock
                  </Badge>
                )}
              </div>
              
                            <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-stone-800 flex-1 pr-2">{product.productName}</h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm text-stone-600">{product.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-stone-600 mb-3">by {product.user?.name || 'Local Farmer'}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl font-bold text-stone-800">₱{product.productPrice}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-stone-500">({product.totalRatings} reviews)</span>
                </div>
                
                <Button 
                  className={`w-full bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 transform ${
                    addingToCart === (product._id || product.id) ? 'scale-95 bg-green-600 animate-pulse' : 'hover:scale-105'
                  }`}
                  onClick={(e) => handleAddToCart(e, product._id || product.id)}
                  disabled={addingToCart === (product._id || product.id)}
                >
                  <ShoppingCart className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${addingToCart === (product._id || product.id) ? 'animate-bounce' : ''}`} />
                  {addingToCart === (product._id || product.id) ? 'Adding...' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {!loading && !error && (
          <div className="text-center mt-8 lg:mt-12">
            <Link to="/shop">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                View All Products
              </Button>
            </Link>
          </div>
        )}
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
