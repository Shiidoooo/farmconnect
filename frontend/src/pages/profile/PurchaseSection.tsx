import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { orderAPI, auth, productsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ProductRatingDialog from "@/components/ProductRatingDialog";

const PurchaseSection = () => {
  const [activePurchaseStatus, setActivePurchaseStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [ratingDialog, setRatingDialog] = useState({
    isOpen: false,
    product: null,
    orderId: null
  });
  const [orderRatings, setOrderRatings] = useState({}); // Track which products have been rated per order
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await orderAPI.getUserOrders();
        
        if (response.success) {
          const ordersData = response.data || [];
          setOrders(ordersData);
        } else {
          console.error('Failed to fetch orders:', response.message);
          toast({
            title: "Error",
            description: response.message || "Failed to load your orders",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Load ratings for delivered orders when orders change
  useEffect(() => {
    const deliveredOrders = orders.filter(order => order.orderStatus === 'delivered');
    if (deliveredOrders.length > 0) {
      loadOrderRatings(deliveredOrders);
    }
  }, [orders]);

  // Filter orders based on status and search query
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (activePurchaseStatus !== 'all') {
      const statusMap = {
        'pending': ['pending'],
        'processing': ['confirmed', 'processing'],
        'to-ship': ['to-ship'],  // Added to-ship status
        'to-deliver': ['shipped', 'out_for_delivery', 'to deliver'],
        'completed': ['delivered'],
        'cancelled': ['cancelled']
      };
      
      filtered = filtered.filter(order => 
        statusMap[activePurchaseStatus]?.includes(order.orderStatus)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.products.some(item => 
          item.product?.productName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, activePurchaseStatus, searchQuery]);

  // Calculate status counts
  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      'pending': orders.filter(order => ['pending'].includes(order.orderStatus)).length,
      'processing': orders.filter(order => ['confirmed', 'processing'].includes(order.orderStatus)).length,
      'to-ship': orders.filter(order => ['to-ship'].includes(order.orderStatus)).length,  // Added to-ship count
      'to-deliver': orders.filter(order => ['shipped', 'out_for_delivery', 'to deliver'].includes(order.orderStatus)).length,
      'completed': orders.filter(order => ['delivered'].includes(order.orderStatus)).length,
      'cancelled': orders.filter(order => ['cancelled'].includes(order.orderStatus)).length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const purchaseStatuses = [
    { id: 'all', name: 'All', count: statusCounts.all },
    { id: 'pending', name: 'Pending', count: statusCounts.pending },
    { id: 'processing', name: 'Processing', count: statusCounts.processing },
    { id: 'to-ship', name: 'To Ship', count: statusCounts['to-ship'] },  // Added To Ship
    { id: 'to-deliver', name: 'To Deliver', count: statusCounts['to-deliver'] },
    { id: 'completed', name: 'Completed', count: statusCounts.completed },
    { id: 'cancelled', name: 'Cancelled', count: statusCounts.cancelled }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'To Pay' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      'to-ship': { color: 'bg-blue-100 text-blue-800', label: 'To Ship' },
      shipped: { color: 'bg-orange-100 text-orange-800', label: 'To Deliver' },
      out_for_delivery: { color: 'bg-orange-100 text-orange-800', label: 'Out for Delivery' },
      'to deliver': { color: 'bg-orange-100 text-orange-800', label: 'To Deliver' }, // Added to fix Unknown status
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  };

  const handleViewDetails = (orderId) => {
    navigate(`/order-tracking/${orderId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductImage = (product) => {
    if (product?.productimage && product.productimage.length > 0) {
      return product.productimage[0].url;
    }
    return "/placeholder.svg";
  };

  const getPaymentMethodLabel = (paymentMethod) => {
    if (typeof paymentMethod === 'string') {
      return paymentMethod.toUpperCase();
    }
    if (paymentMethod?.type) {
      if (paymentMethod.type === 'cod') {
        return 'COD';
      } else if (paymentMethod.type === 'ewallet' && paymentMethod.ewalletDetails) {
        return paymentMethod.ewalletDetails.ewalletType?.toUpperCase() || 'E-WALLET';
      }
      return paymentMethod.type.toUpperCase();
    }
    return 'COD';
  };

  // Add function to mark order as completed (received)
  const handleConfirmReceived = async (orderId) => {
    setConfirmingOrder(orderId);
    try {
      const response = await orderAPI.confirmOrderReceived(orderId);
      
      if (response.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: 'delivered' } : order
        ));
        
        toast({
          title: "Success! 🎉",
          description: "Order confirmed as received! Payment has been distributed to sellers.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to confirm order receipt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error confirming order received:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as received",
        variant: "destructive",
      });
    } finally {
      setConfirmingOrder(null);
    }
  };

  // Load rating status for delivered orders
  const loadOrderRatings = async (deliveredOrders) => {
    const ratingsMap = {};
    
    for (const order of deliveredOrders) {
      try {
        const response = await productsAPI.checkOrderRatings(order._id);
        if (response.success) {
          ratingsMap[order._id] = response.data.products;
        }
      } catch (error) {
        console.error(`Error loading ratings for order ${order._id}:`, error);
      }
    }
    
    setOrderRatings(ratingsMap);
  };

  // Handle rating a product
  const handleRateProduct = (product, orderId) => {
    setRatingDialog({
      isOpen: true,
      product: product,
      orderId: orderId
    });
  };

  // Handle rating submission
  const handleRatingSubmitted = () => {
    // Reload order ratings to reflect the new rating
    const deliveredOrders = orders.filter(order => order.orderStatus === 'delivered');
    loadOrderRatings(deliveredOrders);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Purchase</h2>
        <div className="relative">
          <Input
            placeholder="Search orders..."
            className="w-64 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Purchase Status Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8 overflow-x-auto">
          {purchaseStatuses.map((status) => (
            <button
              key={status.id}
              onClick={() => setActivePurchaseStatus(status.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activePurchaseStatus === status.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {status.name}
              {status.count > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                  {status.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusBadge = getStatusBadge(order.orderStatus);
          const firstProduct = order.products?.[0]; // Show first product in the order
          const totalProducts = order.products?.length || 0;
          
          if (!firstProduct) {
            return null; // Skip orders without products
          }
          
          return (
            <Card key={order._id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Order #{order._id.slice(-8)}</span>
                    <Badge className={statusBadge.color}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600">{formatDate(order.createdAt || order.orderDate)}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <img 
                    src={getProductImage(firstProduct.product)}
                    alt={firstProduct.product?.productName || 'Product'}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {firstProduct.product?.productName || 'Unknown Product'}
                      {firstProduct.selectedSize && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Size: {firstProduct.selectedSize.toUpperCase()})
                        </span>
                      )}
                      {totalProducts > 1 && (
                        <span className="text-sm text-gray-500 ml-2">
                          +{totalProducts - 1} more item{totalProducts > 2 ? 's' : ''}
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total items: {order.products?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment: {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">₱{(order.totalAmount || 0).toFixed(2)}</p>
                    <div className="flex space-x-2 mt-2">
                      {(order.orderStatus === 'to deliver' || order.orderStatus === 'shipped' || order.orderStatus === 'out_for_delivery') && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => handleConfirmReceived(order._id)}
                          disabled={confirmingOrder === order._id}
                        >
                          {confirmingOrder === order._id ? 'Confirming...' : 'Confirm Received'}
                        </Button>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <div className="flex flex-col space-y-1">
                          {order.products?.map((productItem, index) => {
                            const orderRatingData = orderRatings[order._id];
                            const productRating = orderRatingData?.find(
                              p => p.productId === productItem.product._id
                            );
                            const hasRated = productRating?.hasRated || false;
                            
                            return (
                              <Button 
                                key={`${productItem.product._id}-${index}`}
                                size="sm" 
                                variant={hasRated ? "secondary" : "outline"} 
                                className="text-xs"
                                onClick={() => handleRateProduct(productItem.product, order._id)}
                                disabled={hasRated}
                              >
                                {hasRated ? '✓ Rated' : 'Rate'} {productItem.product.productName.length > 15 
                                  ? productItem.product.productName.substring(0, 15) + '...' 
                                  : productItem.product.productName}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => handleViewDetails(order._id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>Subtotal: ₱{(order.subtotal || 0).toFixed(2)}</span>
                      {order.shipping && (
                        <span>Shipping: ₱{(order.shipping.fee || 0).toFixed(2)}</span>
                      )}
                    </div>
                    {order.shipping?.courier && (
                      <span>via {order.shipping.courier.name}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No orders found'}
          </h3>
          <p className="text-gray-400">
            {orders.length === 0 ? 
              "You haven't made any orders yet. Start shopping to see your orders here!" :
              searchQuery ? 
                'No orders match your search criteria.' : 
                "You haven't made any orders in this category yet."
            }
          </p>
          {orders.length === 0 && (
            <Button 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => navigate('/shop')}
            >
              Start Shopping
            </Button>
          )}
        </div>
      )}

      {/* Product Rating Dialog */}
      <ProductRatingDialog
        isOpen={ratingDialog.isOpen}
        onOpenChange={(open) => setRatingDialog({ ...ratingDialog, isOpen: open })}
        product={ratingDialog.product}
        orderId={ratingDialog.orderId}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};

export default PurchaseSection;
