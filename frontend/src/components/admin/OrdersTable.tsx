
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { adminApiService } from "../../services/adminApi";
import { Eye, Edit, Trash2, Search, Filter, Loader, Package, Calendar, DollarSign, User, AlertCircle, CheckCircle } from "lucide-react";

interface Order {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  products: Array<{
    product: {
      _id: string;
      productName: string;
      seller: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: {
    type: string;
    details?: any;
  };
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

const OrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  // Listen for refresh events from parent component
  useEffect(() => {
    const handleRefreshEvent = () => {
      fetchOrders();
    };

    window.addEventListener('refreshOrdersTable', handleRefreshEvent);
    return () => window.removeEventListener('refreshOrdersTable', handleRefreshEvent);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await adminApiService.getAllOrders(params);
      setOrders(Array.isArray(response.orders) ? response.orders : []);
      setTotalPages(Math.ceil((response.totalOrders || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !editingStatus) return;

    try {
      setUpdating(true);
      await adminApiService.updateOrderStatus(selectedOrder._id, editingStatus);
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      setEditingStatus("");
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditingStatus(order.orderStatus);
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "shipped": return "bg-purple-100 text-purple-700 border-purple-200";
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "failed": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products?.some(p => p.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Orders Management
          </CardTitle>
          <CardDescription>
            Manage customer orders, update statuses, and track deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order ID, customer name, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Order ID</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Products</TableHead>
                  <TableHead className="font-semibold">Sellers</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Payment</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Package className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-500">No orders found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        #{order._id?.slice(-8) || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.user?.firstName || "Unknown"} {order.user?.lastName || "User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user?.email || "No email"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.products?.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{item.product?.productName || "Unknown Product"}</span>
                              <span className="text-gray-500"> x{item.quantity || 0}</span>
                            </div>
                          ))}
                          {order.products && order.products.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{order.products.length - 2} more items
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {Array.from(new Set(
                            order.products
                              .filter(p => p.product?.seller?._id) // Filter out products without seller info
                              .map(p => p.product.seller._id)
                          ))
                            .map(sellerId => {
                              const seller = order.products.find(p => p.product?.seller?._id === sellerId)?.product?.seller;
                              return seller ? (
                                <div key={sellerId} className="text-sm">
                                  <div className="font-medium">
                                    {seller.firstName} {seller.lastName}
                                  </div>
                                </div>
                              ) : null;
                            })
                          }
                          {/* Show message if no seller info available */}
                          {!order.products.some(p => p.product?.seller?._id) && (
                            <div className="text-sm text-gray-500">
                              No seller info
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.totalAmount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.orderStatus)} border`}>
                          {order.orderStatus || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={`${getPaymentStatusColor(order.paymentStatus)} border text-xs`}>
                            {order.paymentStatus || "Unknown"}
                          </Badge>
                          <div className="text-xs text-gray-500 capitalize">
                            {order.paymentMethod?.type || "Unknown"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order #{selectedOrder?._id?.slice(-8) || "N/A"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={`${getStatusColor(selectedOrder.orderStatus)} border px-3 py-1`}>
                    {selectedOrder.orderStatus || "Unknown"}
                  </Badge>
                  <Badge className={`${getPaymentStatusColor(selectedOrder.paymentStatus)} border px-3 py-1`}>
                    Payment: {selectedOrder.paymentStatus || "Unknown"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatPrice(selectedOrder.totalAmount || 0)}</div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                </div>
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="font-semibold">{selectedOrder.user?.firstName || "Unknown"} {selectedOrder.user?.lastName || "User"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p>{selectedOrder.user?.email || "No email"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedOrder.shippingAddress?.street || "No street address"}</p>
                  <p>{selectedOrder.shippingAddress?.city || "No city"}, {selectedOrder.shippingAddress?.province || "No province"} {selectedOrder.shippingAddress?.zipCode || ""}</p>
                </CardContent>
              </Card>

              {/* Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Products Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.products?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.product?.productName || "Unknown Product"}</h4>
                          <p className="text-sm text-gray-500">
                            Seller: {item.product?.seller?.firstName || "Unknown"} {item.product?.seller?.lastName || "Seller"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity || 0} × {formatPrice(item.price || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice((item.quantity || 0) * (item.price || 0))}</p>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No products found</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                      <p className="capitalize">{selectedOrder.paymentMethod?.type || "Unknown"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Status</label>
                      <Badge className={`${getPaymentStatusColor(selectedOrder.paymentStatus)} border`}>
                        {selectedOrder.paymentStatus || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Order Created</span>
                      <span className="text-sm font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <span className="text-sm font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{selectedOrder?._id?.slice(-8) || "N/A"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Status</label>
              <p className="text-lg font-semibold capitalize">{selectedOrder?.orderStatus || "Unknown"}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={editingStatus} onValueChange={setEditingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || editingStatus === selectedOrder?.orderStatus}
              >
                {updating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTable;
