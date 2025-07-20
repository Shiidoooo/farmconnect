
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  Phone,
  MessageCircle,
  Star
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { orderAPI, auth, productsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import ProductRatingDialog from "@/components/ProductRatingDialog";

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingDialog, setRatingDialog] = useState({
    isOpen: false,
    product: null,
    orderId: null
  });
  const [orderRatings, setOrderRatings] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!auth.isAuthenticated()) {
        navigate('/login');
        return;
      }

      if (!orderId) {
        toast({
          title: "No order specified",
          description: "Please select an order to track",
          variant: "destructive",
        });
        navigate('/profile');
        return;
      }

      try {
        setLoading(true);
        const response = await orderAPI.getOrderById(orderId);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          toast({
            title: "Order not found",
            description: "The order you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  // Load rating status for delivered orders
  useEffect(() => {
    const loadOrderRatings = async () => {
      if (order && order.status === 'delivered' && orderId) {
        try {
          const response = await productsAPI.checkOrderRatings(orderId);
          if (response.success) {
            setOrderRatings(response.data.products);
          }
        } catch (error) {
          console.error('Error loading ratings:', error);
        }
      }
    };

    loadOrderRatings();
  }, [order, orderId]);

  // Handle rating a product
  const handleRateProduct = (product) => {
    setRatingDialog({
      isOpen: true,
      product: product,
      orderId: orderId
    });
  };

  // Handle rating submission
  const handleRatingSubmitted = async () => {
    // Reload order ratings to reflect the new rating
    if (orderId) {
      try {
        const response = await productsAPI.checkOrderRatings(orderId);
        if (response.success) {
          setOrderRatings(response.data.products);
        }
      } catch (error) {
        console.error('Error reloading ratings:', error);
      }
    }
  };

  const getOrderStatusSteps = (status) => {
    const baseSteps = [
      { id: "pending", label: "Order Confirmed", completed: false, time: "" },
      { id: "processing", label: "Packed", completed: false, time: "" },
      { id: "shipped", label: "Shipped", completed: false, time: "" },
      { id: "out_for_delivery", label: "Out for Delivery", completed: false, time: "", active: false },
      { id: "delivered", label: "Delivered", completed: false, time: "" }
    ];

    const statusOrder = ["pending", "processing", "shipped", "out_for_delivery", "delivered"];
    const currentIndex = statusOrder.indexOf(status);

    return baseSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex && status !== "delivered",
      time: index <= currentIndex ? "Completed" : ""
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Confirmed" },
      processing: { color: "bg-blue-100 text-blue-800", label: "Processing" },
      shipped: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
      out_for_delivery: { color: "bg-orange-100 text-orange-800", label: "Out for Delivery" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" }
    };
    
    return statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: "Unknown" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Order not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const orderStatus = getOrderStatusSteps(order.status);
  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Order Tracking</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Map Section */}
        <Card>
          <CardContent className="p-0">
            <div className="relative h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-t-lg overflow-hidden">
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Truck className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{statusBadge.label}</p>
                  <p className="text-xs text-gray-500">
                    {order.status === 'delivered' ? 'Your order has been delivered!' : 
                     order.status === 'out_for_delivery' ? 'Your order is on the way!' :
                     'Your order is being processed'}
                  </p>
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-sm">
                <span className="text-sm font-medium">Order #{order._id.slice(-8)}</span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-600">
                  {order.status === 'delivered' ? 'Delivered' : 
                   order.status === 'out_for_delivery' ? 'Estimated delivery: Today' :
                   'Processing your order'}
                </h3>
                <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Order placed: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              {order.shipping && order.shipping.courier && (
                <p className="text-sm text-gray-600">
                  Courier: {order.shipping.courier.name} - {order.shipping.courier.estimatedDelivery}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Progress */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Order Progress</h3>
            <div className="space-y-4">
              {orderStatus.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? step.active 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? (
                      step.active ? <Truck className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${step.active ? 'text-red-600' : step.completed ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-sm text-gray-500">{step.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courier Information */}
        {order.shipping && order.shipping.courier && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Courier Information</h3>
                <Badge className="bg-blue-100 text-blue-800">{order.shipping.courier.name}</Badge>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {order.shipping.courier.name.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{order.shipping.courier.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Fee: ₱{order.shipping.fee}</span>
                    <span className="text-sm text-gray-400">• {order.shipping.courier.estimatedDelivery}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Address */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.shipping.address.fullName}</p>
              <p className="text-sm text-gray-600">{order.shipping.address.phoneNumber}</p>
              <p className="text-sm text-gray-600">
                {order.shipping.address.address}, {order.shipping.address.city}, {order.shipping.address.postalCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3 mb-4">
              {order.products.map((item) => {
                const productRating = orderRatings.find(
                  p => p.productId === item.product._id
                );
                const hasRated = productRating?.hasRated || false;
                
                return (
                  <div key={item._id} className="flex items-center space-x-3 border rounded-lg p-3">
                    <img 
                      src={item.product.productimage && item.product.productimage.length > 0 ? 
                           item.product.productimage[0].url : "/placeholder.svg"}
                      alt={item.product.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.productName}</p>
                      <div className="text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        {item.selectedSize && (
                          <span className="ml-2">• Size: {item.selectedSize.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="font-medium text-red-600">₱{(item.price * item.quantity).toFixed(2)}</span>
                        {order.status === 'delivered' && (
                          <Button
                            size="sm"
                            variant={hasRated ? "secondary" : "outline"}
                            className="text-xs"
                            onClick={() => handleRateProduct(item.product)}
                            disabled={hasRated}
                          >
                            {hasRated ? (
                              <>
                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                Rated
                              </>
                            ) : (
                              <>
                                <Star className="w-3 h-3 mr-1" />
                                Rate & Review
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₱{order.subtotal.toFixed(2)}</span>
              </div>
              {order.shipping && (
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₱{order.shipping.fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-red-600">
                <span>Total</span>
                <span>₱{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Actions */}
        {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">Order Protection</p>
                  <p className="text-sm text-green-600">Your order is protected. Contact us if you have any issues.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Product Rating Dialog */}
      <ProductRatingDialog
        isOpen={ratingDialog.isOpen}
        onOpenChange={(open) => setRatingDialog({ ...ratingDialog, isOpen: open })}
        product={ratingDialog.product}
        orderId={ratingDialog.orderId}
        onRatingSubmitted={handleRatingSubmitted}
      />

      <Footer />
    </div>
  );
};

export default OrderTracking;
