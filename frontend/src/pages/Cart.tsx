import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cartAPI, auth } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch cart data from backend
  useEffect(() => {
    const fetchCart = async () => {
      if (!auth.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await cartAPI.getCart();
        if (response.success) {
          setCartItems(response.cart || []);
          // Select all items by default
          setSelectedItems(new Set(response.cart?.map((item: any) => item.product._id) || []));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [toast]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(productId);
      return;
    }

    setUpdating(productId);
    try {
      const response = await cartAPI.updateCartItem(productId, newQuantity);
      if (response.success) {
        setCartItems(cartItems.map(item => 
          item.product._id === productId ? { ...item, quantity: newQuantity } : item
        ));
        toast({
          title: "Success",
          description: "Cart updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    try {
      const response = await cartAPI.removeFromCart(productId);
      if (response.success) {
        setCartItems(cartItems.filter(item => item.product._id !== productId));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleSelectItem = (productId: string, checked: boolean | "indeterminate") => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked === true) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedItems(new Set(cartItems.map(item => item.product._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.product._id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.product.productPrice * item.quantity), 0);
  const shipping = selectedCartItems.length > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  const allSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < cartItems.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!auth.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Please log in to view your cart</h1>
            <p className="text-gray-600 mb-8">You need to be logged in to manage your cart items.</p>
            <Link to="/login">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 mr-4">
                Log In
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="px-8 py-3">
                Browse Products
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some fresh produce to get started!</p>
            <Link to="/shop">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                Browse Products
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Header */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="font-medium text-gray-700">
                      Select All ({selectedItems.size} of {cartItems.length} items)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {cartItems.map((item) => (
                <Card key={item.product._id} className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedItems.has(item.product._id)}
                          onCheckedChange={(checked) => handleSelectItem(item.product._id, checked)}
                          className="mt-1"
                        />
                        <img 
                          src={
                            item.product.productimage && item.product.productimage.length > 0
                              ? item.product.productimage[0].url
                              : "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=300&fit=crop&crop=center"
                          }
                          alt={item.product.productName}
                          className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{item.product.productName}</h3>
                            <p className="text-sm text-gray-600">by {item.product.user?.name || 'Unknown Seller'}</p>
                            <Badge variant="secondary" className="mt-1">
                              {item.product.productCategory}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product._id)}
                            disabled={updating === item.product._id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === item.product._id}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              disabled={updating === item.product._id}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">
                              ₱{(item.product.productPrice * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₱{item.product.productPrice.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-gray-200 sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items ({selectedItems.size})</span>
                      <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">₱{shipping.toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₱{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Link to="/checkout" state={{ selectedItems: selectedCartItems }}>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 mb-4"
                      disabled={selectedItems.size === 0}
                    >
                      Proceed to Checkout ({selectedItems.size} items)
                    </Button>
                  </Link>
                  
                  <Link to="/shop">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
