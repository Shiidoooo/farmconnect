
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface OrderProduct {
  product: {
    _id: string;
    productName: string;
    productCategory: string;
  };
  quantity: number;
  price: number;
  selectedSize?: string;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  products: OrderProduct[];
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  shipping: {
    address: {
      fullName: string;
      phoneNumber: string;
      address: string;
    };
  };
}

interface OrdersTableProps {
  orders: Order[];
  showActions?: boolean;
}

const OrdersTable = ({ orders, showActions = true }: OrdersTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "confirmed": return "bg-blue-100 text-blue-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-purple-100 text-purple-700";
      case "out_for_delivery": return "bg-indigo-100 text-indigo-700";
      case "to deliver": return "bg-indigo-100 text-indigo-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatPrice = (price: number) => {
    return `₱${price.toFixed(2)}`;
  };

  const getCustomerName = (order: Order) => {
    return order.shipping.address.fullName || order.user.name || order.user.email;
  };

  const getMainProduct = (order: Order) => {
    if (order.products.length === 1) {
      return order.products[0].product.productName;
    }
    return `${order.products[0].product.productName} +${order.products.length - 1} more`;
  };

  const ProductsDialog = ({ order }: { order: Order }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShoppingBag className="w-4 h-4 mr-2" />
          View Products ({order.products.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order #{order._id.slice(-6)} - Products</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {order.products.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Product</label>
                  <p className="text-lg font-semibold">{item.product.productName}</p>
                  <p className="text-sm text-gray-500">{item.product.productCategory}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Quantity</label>
                  <p className="text-lg font-semibold">{item.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Unit Price</label>
                  <p className="text-lg font-semibold">{formatPrice(item.price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total</label>
                  <p className="text-lg font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
                {item.selectedSize && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Selected Size</label>
                    <p className="text-lg font-semibold">{item.selectedSize}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Order Amount:</span>
              <span className="text-xl font-bold">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Details</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 8 : 7} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">#{order._id.slice(-6)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{getCustomerName(order)}</p>
                    <p className="text-sm text-gray-500">{order.user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{getMainProduct(order)}</p>
                    <p className="text-sm text-gray-500">
                      {order.products.length} item{order.products.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{formatPrice(order.totalAmount)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.orderStatus)}>
                    {order.orderStatus.replace("_", " ").charAt(0).toUpperCase() + order.orderStatus.replace("_", " ").slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {order.products.length > 1 ? (
                    <ProductsDialog order={order} />
                  ) : (
                    <span className="text-sm text-gray-500">Single product</span>
                  )}
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
