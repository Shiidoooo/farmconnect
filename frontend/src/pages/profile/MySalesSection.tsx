import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Clock, CheckCircle, Truck, AlertTriangle, Phone, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { orderAPI, auth } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const MySalesSection = () => {
  const [activeSalesStatus, setActiveSalesStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const { toast } = useToast();

  // Fetch seller orders from backend
  useEffect(() => {
    const fetchSellerOrders = async () => {
      if (!auth.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await orderAPI.getSellerOrders();
        
        if (response.success) {
          const ordersData = response.data || [];
          setOrders(ordersData);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load your sales orders",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        toast({
          title: "Error",
          description: "Failed to load your sales orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [toast]);

  // Filter orders based on status and search query
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (activeSalesStatus !== 'all') {
      const statusMap = {
        'pending': ['pending'],
        'processing': ['processing'],  // Added separate processing status
        'to-ship': ['confirmed', 'to-ship'],  // Changed to include 'to-ship' instead of 'processing'
        'to-deliver': ['shipped', 'out_for_delivery', 'to deliver'],
        'completed': ['delivered'],
        'cancelled': ['cancelled']
      };
      
      filtered = filtered.filter(order => 
        statusMap[activeSalesStatus]?.includes(order.orderStatus)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.products.some(item => 
          item.product?.productName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, activeSalesStatus, searchQuery]);

  // Calculate status counts
  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      'pending': orders.filter(order => ['pending'].includes(order.orderStatus)).length,
      'processing': orders.filter(order => ['processing'].includes(order.orderStatus)).length,  // Added processing count
      'to-ship': orders.filter(order => ['confirmed', 'to-ship'].includes(order.orderStatus)).length,  // Changed to exclude 'processing'
      'to-deliver': orders.filter(order => ['shipped', 'out_for_delivery', 'to deliver'].includes(order.orderStatus)).length,
      'completed': orders.filter(order => ['delivered'].includes(order.orderStatus)).length,
      'cancelled': orders.filter(order => ['cancelled'].includes(order.orderStatus)).length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();
  
  const salesStatuses = [
    { id: 'all', name: 'All Orders', count: statusCounts.all },
    { id: 'pending', name: 'Pending', count: statusCounts.pending },
    { id: 'processing', name: 'Processing', count: statusCounts.processing },  // Added Processing
    { id: 'to-ship', name: 'To Ship', count: statusCounts['to-ship'] },
    { id: 'to-deliver', name: 'To Deliver', count: statusCounts['to-deliver'] },
    { id: 'completed', name: 'Completed', count: statusCounts.completed },
    { id: 'cancelled', name: 'Cancelled', count: statusCounts.cancelled }  // Added cancelled status
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed', icon: CheckCircle },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing', icon: Package },
      shipped: { color: 'bg-orange-100 text-orange-800', label: 'To Deliver', icon: Truck },
      out_for_delivery: { color: 'bg-orange-100 text-orange-800', label: 'Out for Delivery', icon: Truck },
      'to deliver': { color: 'bg-blue-100 text-blue-800', label: 'To Deliver', icon: Truck }, // Changed from 'to_deliver' to 'to deliver'
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: AlertTriangle }
    };
    
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown', icon: AlertTriangle };
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    console.log(`Attempting to update order ${orderId} to status: ${newStatus}`); // Debug log
    
    try {
      const response = await orderAPI.updateOrderStatus(orderId, { status: newStatus });
      
      console.log('API response:', response); // Debug log
    
      if (response.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Replace the existing handleShipOrder function with this more reliable version
  const handleShipOrder = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      // Use the existing API method but hardcode the status value
      const response = await orderAPI.updateOrderStatus(orderId, { status: 'shipped' });
      
      if (response.success) {
        // Explicitly force the status to 'shipped' in the local state
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, orderStatus: 'shipped' } : order
        ));
        
        toast({
          title: "Success",
          description: "Order shipped successfully",
        });
        
        // Force a reload of the orders from the server to ensure everything is in sync
        setTimeout(() => {
          orderAPI.getSellerOrders().then(response => {
            if (response.success) {
              setOrders(response.data || []);
            }
          });
        }, 500);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to ship order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error shipping order:', error);
      toast({
        title: "Error",
        description: "Failed to ship order",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading your sales orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Sales</h2>
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

      {/* Sales Status Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8 overflow-x-auto">
          {salesStatuses.map((status) => (
            <button
              key={status.id}
              onClick={() => setActiveSalesStatus(status.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSalesStatus === status.id
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

      {/* Sales Orders */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {orders.length === 0 ? 'No sales orders yet' : 'No orders found'}
            </h3>
            <p className="text-gray-400">
              {orders.length === 0 ? 
                "You haven't received any orders yet. Customers will start ordering your products soon!" :
                searchQuery ? 
                  'No orders match your search criteria.' : 
                  "You haven't received any orders in this category yet."
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusBadge = getStatusBadge(order.orderStatus);
            const StatusIcon = statusBadge.icon;
            
            return (
              <Card key={order._id} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Order #{order._id.slice(-8)}</span>
                      <Badge className={statusBadge.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-600">{formatDate(order.createdAt || order.orderDate)}</span>
                  </div>
                  
                  {/* Customer Information */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">Customer: {order.user?.name || 'Unknown Customer'}</h4>
                        <p className="text-sm text-gray-600">{order.user?.email}</p>
                        <p className="text-sm text-gray-600">
                          Delivery: {order.shipping?.address?.address}, {order.shipping?.address?.city}
                        </p>
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
                  </div>
                  
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.products.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4">
                        <img 
                          src={getProductImage(item.product)}
                          alt={item.product?.productName || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {item.product?.productName || 'Unknown Product'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ₱{(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₱{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-4">
                        <span>Payment: {getPaymentMethodLabel(order.paymentMethod)}</span>
                        <span>Total: ₱{(order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                      
                      {/* Order Actions */}
                      <div className="flex items-center space-x-2">
                        {order.orderStatus === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleUpdateOrderStatus(order._id, 'processing')}  // Changed from 'confirmed' to 'processing'
                              disabled={updatingOrder === order._id}
                            >
                              {updatingOrder === order._id ? 'Updating...' : 'Accept Order'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                              disabled={updatingOrder === order._id}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {order.orderStatus === 'processing' && (
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleShipOrder(order._id)} // Use the dedicated shipping function
                            disabled={updatingOrder === order._id}
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'To Ship'}
                          </Button>
                        )}
                        
                        {(order.orderStatus === 'shipped' || order.orderStatus === 'out_for_delivery') && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateOrderStatus(order._id, 'to deliver')}
                            disabled={updatingOrder === order._id}
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'To Deliver'}
                          </Button>
                        )}
                        
                        {order.orderStatus === 'delivered' && (
                          <span className="text-sm text-green-600 font-medium">
                            Order completed
                          </span>
                        )}
                        
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MySalesSection;


