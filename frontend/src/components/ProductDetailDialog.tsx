import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Clock, User, Heart, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "@/services/api";

interface Product {
  _id: string;
  productName: string;
  productDescription: string;
  productPrice: number;
  productimage: Array<{
    public_id: string;
    url: string;
  }>;
  productCategory: string;
  productStock: number;
  productExpiryDate: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  ratings?: Array<{
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  averageRating?: number;
  totalRatings?: number;
  totalSold?: number;
}

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailDialog = ({ product, isOpen, onClose }: ProductDetailDialogProps) => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sellerStats, setSellerStats] = useState({
    totalProducts: 0,
    averageRating: 0,
    totalRatings: 0,
    totalSold: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch seller statistics when product changes
  useEffect(() => {
    if (product?.user?._id) {
      fetchSellerStats(product.user._id);
    }
  }, [product?.user?._id]);

  const fetchSellerStats = async (sellerId: string) => {
    try {
      setLoadingStats(true);
      const response = await productsAPI.getSellerStats(sellerId);
      if (response.success) {
        setSellerStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching seller stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!product) return null;

  const handleAddToCart = () => {
    console.log(`Added ${quantity} of ${product.productName} to cart`);
    onClose();
  };

  // Helper function to render stars
  const renderStars = (rating: number) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">{product.productName}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={product.productimage && product.productimage.length > 0 
                  ? product.productimage[selectedImageIndex]?.url 
                  : "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=400&fit=crop&crop=center"
                }
                alt={product.productName}
                className="w-full h-80 object-cover rounded-lg"
              />
              <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                {product.productCategory}
              </Badge>
              <div className="absolute top-3 right-3 flex space-x-2">
                <Button variant="outline" size="sm" className="bg-white/80">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white/80">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Image Thumbnails */}
            {product.productimage && product.productimage.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.productimage.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${product.productName} ${index + 1}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                      selectedImageIndex === index ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {renderStars(product.averageRating || 0)}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.totalRatings || 0} reviews)
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.totalSold || 0} sold
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-red-600">₱{product.productPrice}</span>
                <span className="text-sm text-gray-600">{product.productStock} in stock</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-b py-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Farmer: {product.user?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Expires: {new Date(product.productExpiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Listed: {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.productDescription}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.productStock, quantity + 1))}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={product.productStock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.productStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>

            {/* Store/Seller Information */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-800 mb-3">Store Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{product.user?.name || 'Unknown Store'}</h5>
                    <p className="text-xs text-gray-500 mb-2">{product.user?.email || 'No contact info'}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Products:</span>
                        <span>{loadingStats ? 'Loading...' : sellerStats.totalProducts}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Rating:</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(sellerStats.averageRating)}
                          <span>({sellerStats.averageRating.toFixed(1)})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Sold:</span>
                        <span>{sellerStats.totalSold}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        onClose(); // Close the dialog first
                        navigate(`/store/${product.user._id}`); // Navigate to store page
                      }}
                    >
                      Visit Store
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {product.ratings && product.ratings.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-800 mb-3">Customer Reviews</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {product.ratings.slice(0, 3).map((review, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
