
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
  const [selectedSizes, setSelectedSizes] = useState({}); // Track selected size for each product
  const [sortBy, setSortBy] = useState("relevance"); // New sorting state
  const { toast } = useToast();

  // Get current user data
  const currentUser = auth.getUserData();
  const isLoggedIn = auth.isAuthenticated();

  // Helper function to get product price based on selected size
  const getProductPrice = (product) => {
    if (product.hasMultipleSizes && product.sizeVariants?.length > 0) {
      const selectedSize = selectedSizes[product._id];
      if (selectedSize) {
        const variant = product.sizeVariants.find(v => v.size === selectedSize);
        return variant ? variant.price : product.sizeVariants[0].price;
      }
      return product.sizeVariants[0].price; // Default to first variant
    }
    return product.productPrice;
  };

  // Helper function to get cheapest price (for display purposes)
  const getCheapestPrice = (product) => {
    if (product.hasMultipleSizes && product.sizeVariants?.length > 0) {
      return Math.min(...product.sizeVariants.map(v => v.price));
    }
    return product.productPrice;
  };

  // Helper function to get product stock based on selected size
  const getProductStock = (product) => {
    if (product.hasMultipleSizes && product.sizeVariants?.length > 0) {
      const selectedSize = selectedSizes[product._id];
      if (selectedSize) {
        const variant = product.sizeVariants.find(v => v.size === selectedSize);
        return variant ? variant.stock : product.sizeVariants[0].stock;
      }
      return product.sizeVariants[0].stock; // Default to first variant
    }
    return product.productStock;
  };

  // Helper function to get selected variant
  const getSelectedVariant = (product) => {
    if (product.hasMultipleSizes && product.sizeVariants?.length > 0) {
      const selectedSize = selectedSizes[product._id];
      if (selectedSize) {
        return product.sizeVariants.find(v => v.size === selectedSize);
      }
      return product.sizeVariants[0]; // Default to first variant
    }
    return null;
  };

  // Handle size selection
  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  // Helper function to calculate product relevance score
  const calculateProductScore = (product, searchQuery) => {
    let score = 0;
    const query = searchQuery.toLowerCase().trim();
    const productName = product.productName.toLowerCase();
    const productDescription = product.productDescription.toLowerCase();
    const productCategory = product.productCategory.toLowerCase();

    // 1. RELEVANCE SCORING (40% weight)
    if (query) {
      // Exact name match gets highest score
      if (productName === query) score += 1000;
      // Name starts with query
      else if (productName.startsWith(query)) score += 800;
      // Name contains query
      else if (productName.includes(query)) score += 600;
      // Description contains query
      else if (productDescription.includes(query)) score += 300;
      // Category matches
      else if (productCategory.includes(query)) score += 200;

      // Bonus for multiple word matches
      const queryWords = query.split(' ');
      queryWords.forEach(word => {
        if (word.length > 2) { // Skip very short words
          if (productName.includes(word)) score += 100;
          if (productDescription.includes(word)) score += 50;
        }
      });
    }

    // 2. QUALITY SCORING (25% weight)
    const avgRating = product.averageRating || 0;
    score += avgRating * 50; // Max 250 points for 5-star rating

    // 3. POPULARITY SCORING (20% weight)
    const totalSold = product.totalSold || 0;
    score += Math.min(totalSold * 2, 200); // Max 200 points, capped to prevent dominance

    // 4. AVAILABILITY SCORING (10% weight)
    const stock = product.hasMultipleSizes && product.sizeVariants?.length > 0 
      ? product.sizeVariants.reduce((sum, variant) => sum + variant.stock, 0)
      : product.productStock || 0;
    
    if (stock > 0) {
      score += 100; // Base availability bonus
      score += Math.min(stock, 50); // Additional stock bonus (max 50)
    } else {
      score -= 500; // Heavy penalty for out of stock
    }

    // 5. FRESHNESS SCORING (5% weight)
    const productAge = Date.now() - new Date(product.createdAt).getTime();
    const daysSinceCreated = productAge / (1000 * 60 * 60 * 24);
    
    // Newer products get bonus (max 50 points for products < 7 days old)
    if (daysSinceCreated < 7) {
      score += Math.max(0, 50 - (daysSinceCreated * 7));
    }

    // 6. EXPIRY SCORING - Critical for fresh products
    const expiryDate = new Date(product.productExpiryDate);
    const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry < 0) {
      score -= 1000; // Heavy penalty for expired products
    } else if (daysUntilExpiry < 3) {
      score -= 200; // Penalty for products expiring soon
    } else if (daysUntilExpiry > 7) {
      score += 25; // Bonus for fresh products
    }

    // 7. PRICE COMPETITIVENESS (bonus scoring)
    // Find the minimum price for comparison
    const productPrice = product.hasMultipleSizes && product.sizeVariants?.length > 0
      ? Math.min(...product.sizeVariants.map(v => v.price))
      : product.productPrice;

    // Bonus for reasonable pricing (this is simplified - in reality you'd compare with market averages)
    if (productPrice < 100) score += 10; // Small bonus for affordable items

    // 8. SELLER REPUTATION (bonus scoring)
    const sellerRating = product.user?.averageRating || 0;
    score += sellerRating * 10; // Max 50 points for 5-star seller

    return Math.max(0, score); // Ensure score is never negative
  };

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

  // Filter and sort products based on search and categories with intelligent ranking
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = searchQuery.trim() === '' || 
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productCategory.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategories.size === 0 || 
        selectedCategories.has(product.productCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    })
    .map(product => ({
      ...product,
      relevanceScore: calculateProductScore(product, searchQuery)
    }))
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          const priceA = a.hasMultipleSizes && a.sizeVariants?.length > 0
            ? Math.min(...a.sizeVariants.map(v => v.price))
            : a.productPrice;
          const priceB = b.hasMultipleSizes && b.sizeVariants?.length > 0
            ? Math.min(...b.sizeVariants.map(v => v.price))
            : b.productPrice;
          return priceA - priceB;
        
        case "price-high":
          const priceA2 = a.hasMultipleSizes && a.sizeVariants?.length > 0
            ? Math.min(...a.sizeVariants.map(v => v.price))
            : a.productPrice;
          const priceB2 = b.hasMultipleSizes && b.sizeVariants?.length > 0
            ? Math.min(...b.sizeVariants.map(v => v.price))
            : b.productPrice;
          return priceB2 - priceA2;
        
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case "popular":
          return (b.totalSold || 0) - (a.totalSold || 0);
        
        case "relevance":
        default:
          // Primary sort: Relevance score (descending)
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          
          // Secondary sort: Average rating (descending)
          const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          
          // Tertiary sort: Total sold (descending)
          const soldDiff = (b.totalSold || 0) - (a.totalSold || 0);
          if (soldDiff !== 0) return soldDiff;
          
          // Final sort: Creation date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
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
      const product = products.find(p => p._id === productId);
      let selectedSize = null;
      
      // Include size if product has multiple sizes
      if (product?.hasMultipleSizes && product.sizeVariants?.length > 0) {
        selectedSize = selectedSizes[productId] || product.sizeVariants[0].size;
      }
      
      const response = await cartAPI.addToCart(productId, 1, selectedSize);
      
      if (response.success) {
        toast({
          title: "Success!",
          description: `Product${selectedSize ? ` (Size: ${selectedSize.toUpperCase()})` : ''} added to cart successfully`,
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
        
        {/* Categories Filter & Sort Options */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Categories */}
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

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="relevance">Best Match</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">{filteredProducts.length} results</span> found for 
                <span className="font-medium"> "{searchQuery}"</span>
                {sortBy === "relevance" && filteredProducts.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600">
                    • Sorted by relevance and quality
                  </span>
                )}
              </p>
            </div>
          )}
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

                    {/* Quality & Popularity Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {/* Best Match Badge for searches */}
                      {searchQuery && sortBy === "relevance" && product.relevanceScore > 1200 && (
                        <Badge className="bg-red-600 text-white text-xs px-2 py-1">
                          Best Match
                        </Badge>
                      )}
                      
                      {/* High Rating Badge */}
                      {(product.averageRating || 0) >= 4.5 && (product.totalRatings || 0) >= 5 && (
                        <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                          ⭐ Top Rated
                        </Badge>
                      )}
                      
                      {/* Popular Badge */}
                      {(product.totalSold || 0) >= 50 && (
                        <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                          🔥 Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm leading-tight overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {product.productName}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.productDescription}</p>
                    
                    {/* Size variants for products with multiple sizes */}
                    {product.hasMultipleSizes && product.sizeVariants?.length > 0 ? (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.sizeVariants.map((variant) => (
                            <button
                              key={variant.size}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSizeSelect(product._id, variant.size);
                              }}
                              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                                (selectedSizes[product._id] || product.sizeVariants[0].size) === variant.size
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                              }`}
                            >
                              {variant.size.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-red-600">
                              ₱{selectedSizes[product._id] ? getProductPrice(product) : getCheapestPrice(product)}
                              {!selectedSizes[product._id] && product.sizeVariants.length > 1 && (
                                <span className="text-xs text-gray-500 ml-1">from</span>
                              )}
                            </span>
                            {/* Show wholesale pricing when applicable */}
                            {getSelectedVariant(product)?.wholesalePrice && getSelectedVariant(product)?.wholesaleMinQuantity && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 line-through">
                                  ₱{getProductPrice(product)}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  ₱{getSelectedVariant(product).wholesalePrice} (bulk)
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{getProductStock(product)} in stock</span>
                        </div>
                        {/* Show size-specific info and wholesale pricing */}
                        {getSelectedVariant(product) && (
                          <div className="text-xs text-gray-600 mb-2">
                            Size: {(selectedSizes[product._id] || product.sizeVariants[0].size).toUpperCase()}
                            {getSelectedVariant(product).averageWeightPerPiece && product.unit === 'per_piece' && (
                              <span className="ml-2">• {getSelectedVariant(product).averageWeightPerPiece}g each</span>
                            )}
                            {/* Wholesale pricing indicator */}
                            {getSelectedVariant(product).wholesalePrice && getSelectedVariant(product).wholesaleMinQuantity && (
                              <div className="mt-1 p-1 bg-blue-50 rounded text-blue-700">
                                Wholesale: ₱{getSelectedVariant(product).wholesalePrice} each (Min: {getSelectedVariant(product).wholesaleMinQuantity})
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Regular single-size product display
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-red-600">₱{product.productPrice}</span>
                            {/* Show wholesale pricing for single-size products */}
                            {product.sizeVariants?.[0]?.wholesalePrice && product.sizeVariants?.[0]?.wholesaleMinQuantity && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 line-through">
                                  ₱{product.productPrice}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  ₱{product.sizeVariants[0].wholesalePrice} (bulk)
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{product.productStock} in stock</span>
                        </div>
                        {/* Wholesale pricing info */}
                        {product.sizeVariants?.[0]?.wholesalePrice && product.sizeVariants?.[0]?.wholesaleMinQuantity && (
                          <div className="text-xs text-blue-700 bg-blue-50 p-1 rounded">
                            Wholesale: ₱{product.sizeVariants[0].wholesalePrice} each (Min: {product.sizeVariants[0].wholesaleMinQuantity})
                          </div>
                        )}
                      </div>
                    )}
                    
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
                          disabled={addingToCart === product._id || getProductStock(product) === 0}
                        >
                          <ShoppingCart className={`w-4 h-4 mr-2 ${addingToCart === product._id ? 'animate-bounce' : ''}`} />
                          {addingToCart === product._id ? 'Adding...' : getProductStock(product) === 0 ? 'Out of Stock' : 'Add to Cart'}
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
