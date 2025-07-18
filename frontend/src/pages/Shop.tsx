
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductDetailDialog from "@/components/ProductDetailDialog";
import { ShoppingCart, Star, Filter, Search, ChevronDown, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { productsAPI, cartAPI } from "@/services/api";
import { auth } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(new Set(["fruits"]));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const { toast } = useToast();

  // Get current user data
  const currentUser = auth.getUserData();
  const isLoggedIn = auth.isAuthenticated();

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3 h-3">
            <Star className="w-3 h-3 text-gray-300 absolute" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAllProducts();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Categories for filtering
  const categories = ["fruits", "vegetables", "seeds"];

  // Filter products based on search and categories
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(product.productCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

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

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    
    setAddingToCart(productId);
    
    try {
      const response = await cartAPI.addToCart(productId, 1);
      
      if (response.success) {
        toast({
          title: "Success!",
          description: "Product added to cart successfully",
        });
      } else {
        console.error('Failed to add to cart:', response.message);
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Error adding item to cart",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setAddingToCart(null);
      }, 1000);
    }
  };

  const toggleCategory = (category) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-300 lg:hidden">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          {searchQuery && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Search result for "{searchQuery}" ({filteredProducts.length} items)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Simplified Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Categories Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 py-2 mr-2">Categories:</span>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategories.has(category) ? "default" : "outline"}
                size="sm"
                className={selectedCategories.has(category) ? "bg-red-600 text-white" : ""}
                onClick={() => toggleCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
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
                      <span className="text-xs text-gray-500">By: {product.user?.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">
                        Exp: {new Date(product.productExpiryDate).toLocaleDateString()}
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
                      
                      {/* Only show Add to Cart if user is logged in and not the product owner */}
                      {isLoggedIn && currentUser?._id !== product.user?._id && (
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
                      )}
                      
                      {/* Show message when user is not logged in */}
                      {!isLoggedIn && (
                        <Button 
                          className="w-full bg-gray-400 text-white text-xs py-2 cursor-not-allowed"
                          disabled
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Login to Add to Cart
                        </Button>
                      )}
                      
                      {/* Show message when user is the product owner */}
                      {isLoggedIn && currentUser?._id === product.user?._id && (
                        <Button 
                          className="w-full bg-blue-600 text-white text-xs py-2 cursor-default"
                          disabled
                        >
                          Your Product
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state when no search results */}
          {!loading && searchQuery && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found for "{searchQuery}"</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                className="border-gray-300 text-gray-600"
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* Empty state when no products match category */}
          {!loading && !searchQuery && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found in selected categories</p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategories(new Set())}
                className="border-gray-300 text-gray-600"
              >
                Show All Categories
              </Button>
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

export default Shop;
