import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CheckoutRouteMap from "@/components/CheckoutRouteMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  MapPin, 
  Shield 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { orderAPI, walletAPI, auth } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { calculateShipping, formatShippingDetails, type CartItem, type ShippingCalculation } from "@/utils/shippingCalculator";

interface PaymentMethod {
  type: string;
  ewalletDetails?: {
    ewalletId: string;
    accountNumber: string;
    ewalletType: string;
  };
}

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({ type: 'cod' });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [userEwallets, setUserEwallets] = useState<any[]>([]);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phoneNumber: "",
    address: ""
  });
  const [buyerLocation, setBuyerLocation] = useState<any>(null);
  const [sellerLocations, setSellerLocations] = useState<any[]>([]);
  const [shippingCalculations, setShippingCalculations] = useState<ShippingCalculation[]>([]);
  const [totalShippingCost, setTotalShippingCost] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get selected items from location state (passed from cart page)
  useEffect(() => {
    const initializeCheckout = async () => {
      if (!auth.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Get selected items from navigation state
      const selectedItems = location.state?.selectedItems;
      
      if (!selectedItems || selectedItems.length === 0) {
        toast({
          title: "No items selected",
          description: "Please select items from your cart before checkout",
          variant: "destructive",
        });
        navigate('/cart');
        return;
      }

      try {
        setLoading(true);
        
        // Check if all items are from the same seller
        const sellerIds = selectedItems.map(item => item.product?.user?._id || item.product?.user);
        const uniqueSellerIds = [...new Set(sellerIds)];
        
        if (uniqueSellerIds.length > 1) {
          toast({
            title: "Multiple sellers detected",
            description: "You can only checkout items from one seller at a time. Please remove items from other sellers and try again.",
            variant: "destructive",
          });
          navigate('/cart');
          return;
        }

        // Set the selected cart items
        setCartItems(selectedItems);

        // Process buyer and seller locations
        const userData = auth.getUserData();
        if (userData) {
          setShippingAddress({
            fullName: userData.name || "",
            phoneNumber: userData.phone_number || "",
            address: userData.address || ""
          });

          // Set buyer location (assuming user has addresses with coordinates)
          if (userData.addresses && userData.addresses.length > 0) {
            const defaultAddress = userData.addresses.find(addr => addr.isDefault) || userData.addresses[0];
            setBuyerLocation({
              lat: defaultAddress.coordinates?.lat || 14.5995, // Default to Manila if no coordinates
              lng: defaultAddress.coordinates?.lng || 120.9842,
              address: `${defaultAddress.street}, ${defaultAddress.barangay}, ${defaultAddress.city}`,
              name: userData.name
            });
          } else {
            // Fallback: Use Manila coordinates if no address
            setBuyerLocation({
              lat: 14.5995,
              lng: 120.9842,
              address: userData.address || 'Manila, Philippines',
              name: userData.name
            });
          }
        }

        // Group items by seller and create seller locations
        const sellersMap = new Map();
        selectedItems.forEach(item => {
          const sellerId = item.product?.user?._id || item.product?.user;
          const sellerName = item.product?.user?.name || 'Unknown Seller';
          
          // For demo purposes, assign random coordinates around Metro Manila for sellers
          // In a real app, you would get actual seller addresses from the database
          const sellerLat = 14.5995 + (Math.random() - 0.5) * 0.1; // Random within ~5km
          const sellerLng = 120.9842 + (Math.random() - 0.5) * 0.1;

          if (sellersMap.has(sellerId)) {
            sellersMap.get(sellerId).items.push(item);
          } else {
            sellersMap.set(sellerId, {
              lat: sellerLat,
              lng: sellerLng,
              address: `${sellerName}'s Location, Metro Manila`, // Placeholder address
              name: sellerName,
              items: [item]
            });
          }
        });

        setSellerLocations(Array.from(sellersMap.values()));

        // Fetch user's linked ewallets
        try {
          const walletResponse = await walletAPI.getWallet();
          if (walletResponse.success && walletResponse.data.ewallets) {
            setUserEwallets(walletResponse.data.ewallets);
          }
        } catch (error) {
          console.error('Error fetching ewallets:', error);
          // Not critical, user can still use COD
        }

      } catch (error) {
        console.error('Error initializing checkout:', error);
        toast({
          title: "Error",
          description: "Failed to load checkout data",
          variant: "destructive",
        });
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [navigate, location.state, toast]);

  // Handle route calculations and shipping cost updates
  const handleRoutesCalculated = (routes: Array<{
    seller: any;
    distance: number;
    duration: number;
    coordinates: [number, number][];
  }>) => {
    const calculations: ShippingCalculation[] = [];
    let totalCost = 0;

    routes.forEach(route => {
      // Get items for this specific seller
      const sellerItems = route.seller.items as CartItem[];
      const distanceInKm = route.distance / 1000; // Convert meters to kilometers
      
      // Calculate shipping for this seller's items
      const calculation = calculateShipping(sellerItems, distanceInKm);
      calculations.push(calculation);
      totalCost += calculation.totalShippingCost;
    });

    setShippingCalculations(calculations);
    setTotalShippingCost(totalCost);
  };

  // Helper function to get the price of a cart item (considering size variants)
  const getItemPrice = (item: any) => {
    if (item.product?.hasMultipleSizes && item.product?.sizeVariants?.length > 0 && item.selectedSize) {
      const variant = item.product.sizeVariants.find((v: any) => v.size === item.selectedSize);
      return variant ? variant.price : item.product.productPrice || 0;
    }
    return item.product?.productPrice || 0;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  const shipping = totalShippingCost || 0; // Use calculated shipping cost
  const total = subtotal + shipping;

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    if (method === 'cod') {
      setPaymentMethod({ type: 'cod' });
    } else {
      // method is ewallet ID
      const selectedWallet = userEwallets.find(wallet => wallet._id === method);
      if (selectedWallet) {
        setPaymentMethod({
          type: 'ewallet',
          ewalletDetails: {
            ewalletId: selectedWallet._id,
            accountNumber: selectedWallet.AccountNumer,
            ewalletType: selectedWallet.EwalletType
          }
        });
      }
    }
  };

  const validateForm = () => {
    if (!shippingAddress.fullName || !shippingAddress.phoneNumber || 
        !shippingAddress.address) {
      toast({
        title: "Incomplete address",
        description: "Please fill in all shipping address fields",
        variant: "destructive",
      });
      return false;
    }

    if (paymentMethod.type === 'ewallet' && !paymentMethod.ewalletDetails?.ewalletId) {
      toast({
        title: "Payment method required",
        description: "Please select an e-wallet for payment",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setPlacing(true);
    try {
      // Create a custom order with only selected items
      // We need to temporarily update the user's cart to only include selected items
      // Or modify the order creation to accept specific items
      
      const orderData = {
        shippingAddress,
        shippingFee: shipping,
        paymentMethod,
        selectedItems: cartItems // Pass selected items to backend
      };

      const response = await orderAPI.createOrder(orderData);
      
      if (response.success) {
        toast({
          title: "Order placed successfully!",
          description: `Your order #${response.data._id.slice(-8)} has been placed`,
        });
        // Navigate to order tracking with the order ID
        navigate(`/order-tracking/${response.data._id}`);
      } else {
        toast({
          title: "Failed to place order",
          description: response.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">Loading checkout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-red-600" />
                    Delivery Address
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleAddressChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={shippingAddress.phoneNumber}
                        onChange={(e) => handleAddressChange('phoneNumber', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address</Label>
                    <Textarea
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      placeholder="Enter your complete address (street, barangay, city, province)"
                      className="min-h-[80px] resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold flex items-center mb-4">
                  <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                  Payment Method
                </h2>
                <RadioGroup 
                  value={paymentMethod.type === 'cod' ? 'cod' : paymentMethod.ewalletDetails?.ewalletId} 
                  onValueChange={handlePaymentMethodChange}
                >
                  <div className="space-y-3">
                    {/* Cash on Delivery */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Cash on Delivery</span>
                          <Badge className="bg-red-100 text-red-800">Recommended</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Pay when your order arrives</p>
                      </Label>
                    </div>

                    {/* E-wallets */}
                    {userEwallets.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Your Linked E-wallets:</p>
                        {userEwallets.map((wallet) => (
                          <div key={wallet._id} className="flex items-center space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value={wallet._id} id={wallet._id} />
                            <Label htmlFor={wallet._id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {wallet.EwalletType.toUpperCase()} - {wallet.AccountHolderName}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {wallet.EwalletType}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Account: {wallet.AccountNumer} • Balance: ₱{wallet.AccountBalance.toFixed(2)}
                              </p>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {userEwallets.length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">No e-wallets linked. You can use Cash on Delivery.</p>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Delivery Route Map */}
            {buyerLocation && sellerLocations.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold flex items-center mb-4">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Delivery Route
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    View the route from your location to the seller(s). Green marker is your location, red markers are seller locations.
                  </p>
                  <CheckoutRouteMap
                    buyerLocation={buyerLocation}
                    sellerLocations={sellerLocations}
                    onRoutesCalculated={handleRoutesCalculated}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                {/* Selected Items Info */}
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Checking out {cartItems.length} selected item{cartItems.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={`${item.product._id}-${item.selectedSize || 'no-size'}`} className="flex items-center space-x-3">
                      <img 
                        src={item.product.productimage && item.product.productimage.length > 0 ? 
                             item.product.productimage[0].url : "/placeholder.svg"}
                        alt={item.product.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.productName}</p>
                        <div className="text-xs text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          {item.selectedSize && (
                            <span className="ml-2">Size: {item.selectedSize.toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-medium">₱{(getItemPrice(item) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>₱{shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-red-600">₱{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Summary */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Payment Method:</p>
                  <p className="text-sm text-gray-600">
                    {paymentMethod.type === 'cod' ? 
                      'Cash on Delivery' : 
                      `${paymentMethod.ewalletDetails?.ewalletType?.toUpperCase()} - ${paymentMethod.ewalletDetails?.accountNumber}`
                    }
                  </p>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 mb-4"
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </Button>
                
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>Secure checkout guaranteed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
