import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<{ [key: string]: string }>({});
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
          // Select all items by default using unique keys
          setSelectedItems(new Set(response.cart?.map((item: any) => getCartItemKey(item)) || []));
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

  // Create unique identifier for cart items (productId + selectedSize)
  const getCartItemKey = (item: any) => {
    return item.selectedSize ? `${item.product._id}-${item.selectedSize}` : item.product._id;
  };

  // Check if all selected items are from the same seller
  const validateSingleSeller = (selectedCartItems: any[]) => {
    if (selectedCartItems.length === 0) return { isValid: true, sellers: [] };
    
    // Get seller IDs using the correct path
    const sellerIds = selectedCartItems.map(item => item.product?.user?._id || item.product?.user);
    const uniqueSellerIds = [...new Set(sellerIds.filter(id => id))];
    
    return {
      isValid: uniqueSellerIds.length <= 1,
      sellers: uniqueSellerIds,
      sellerNames: selectedCartItems.reduce((acc, item) => {
        const sellerId = item.product?.user?._id || item.product?.user;
        if (sellerId && !acc.some(s => s.id === sellerId)) {
          acc.push({
            id: sellerId,
            name: item.product?.user?.name || 'Unknown Seller'
          });
        }
        return acc;
      }, [] as Array<{id: string, name: string}>)
    };
  };

  const updateQuantity = async (item: any, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(item);
      return;
    }

    const itemKey = getCartItemKey(item);
    setUpdating(itemKey);
    try {
      // For now, we'll update by productId only since backend needs more changes
      const response = await cartAPI.updateCartItem(item.product._id, newQuantity);
      if (response.success) {
        setCartItems(cartItems.map(cartItem => 
          getCartItemKey(cartItem) === itemKey ? { ...cartItem, quantity: newQuantity } : cartItem
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

  const removeItem = async (item: any) => {
    const itemKey = getCartItemKey(item);
    setUpdating(itemKey);
    try {
      // For now, we'll remove by productId only since backend needs more changes
      const response = await cartAPI.removeFromCart(item.product._id);
      if (response.success) {
        setCartItems(cartItems.filter(cartItem => getCartItemKey(cartItem) !== itemKey));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
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

  const handleSelectItem = (itemKey: string, checked: boolean | "indeterminate") => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked === true) {
        newSet.add(itemKey);
      } else {
        newSet.delete(itemKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedItems(new Set(cartItems.map(item => getCartItemKey(item))));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Helper function to select items by seller
  const selectItemsBySeller = (sellerId: string) => {
    const sellerItems = cartItems.filter(item => 
      (item.product?.user?._id || item.product?.user) === sellerId
    );
    const sellerItemKeys = sellerItems.map(item => getCartItemKey(item));
    setSelectedItems(new Set(sellerItemKeys));
  };

  // Helper functions for quantity input editing
  const handleQuantityInputChange = (itemKey: string, value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setTempQuantity(prev => ({
        ...prev,
        [itemKey]: value
      }));
    }
  };

  const handleQuantityInputFocus = (item: any) => {
    const itemKey = getCartItemKey(item);
    setEditingQuantity(itemKey);
    setTempQuantity(prev => ({
      ...prev,
      [itemKey]: item.quantity.toString()
    }));
  };

  const handleQuantityInputBlur = async (item: any) => {
    const itemKey = getCartItemKey(item);
    const newQuantityStr = tempQuantity[itemKey];
    
    if (newQuantityStr && newQuantityStr !== '' && newQuantityStr !== '0') {
      const newQuantity = parseInt(newQuantityStr);
      if (newQuantity !== item.quantity && newQuantity > 0) {
        await updateQuantity(item, newQuantity);
      }
    }
    
    setEditingQuantity(null);
    setTempQuantity(prev => {
      const newTemp = { ...prev };
      delete newTemp[itemKey];
      return newTemp;
    });
  };

  const handleQuantityInputKeyPress = (e: React.KeyboardEvent, item: any) => {
    if (e.key === 'Enter') {
      handleQuantityInputBlur(item);
    } else if (e.key === 'Escape') {
      const itemKey = getCartItemKey(item);
      setEditingQuantity(null);
      setTempQuantity(prev => {
        const newTemp = { ...prev };
        delete newTemp[itemKey];
        return newTemp;
      });
    }
  };

  // Get grouped sellers for display, sorted by most recent addition
  const getGroupedSellers = () => {
    const sellersMap = new Map();
    cartItems.forEach(item => {
      // Get seller ID - can be either user._id or user directly if it's just an ID
      const sellerId = item.product?.user?._id || item.product?.user || 'unknown';
      // Get seller name from populated user data
      const sellerName = item.product?.user?.name || 'Unknown Seller';
      
      if (!sellersMap.has(sellerId)) {
        sellersMap.set(sellerId, {
          id: sellerId,
          name: sellerName,
          items: [],
          mostRecentAddedAt: new Date(item.addedAt || 0)
        });
      }
      
      const seller = sellersMap.get(sellerId);
      seller.items.push(item);
      
      // Update most recent addedAt if this item is more recent
      const itemAddedAt = new Date(item.addedAt || 0);
      if (itemAddedAt > seller.mostRecentAddedAt) {
        seller.mostRecentAddedAt = itemAddedAt;
      }
    });
    
    // Convert to array and sort by most recent addition (newest first)
    return Array.from(sellersMap.values()).sort((a, b) => 
      b.mostRecentAddedAt.getTime() - a.mostRecentAddedAt.getTime()
    );
  };

  // Helper function to get the price of a cart item (considering size variants and wholesale)
  const getItemPrice = (item: any) => {
    if (item.product?.hasMultipleSizes && item.product?.sizeVariants?.length > 0 && item.selectedSize) {
      const variant = item.product.sizeVariants.find((v: any) => v.size === item.selectedSize);
      if (variant) {
        // Check if wholesale pricing applies
        if (variant.wholesalePrice && variant.wholesaleMinQuantity && item.quantity >= variant.wholesaleMinQuantity) {
          return variant.wholesalePrice;
        }
        return variant.price;
      }
      return item.product.productPrice || 0;
    }
    
    // For single-size products, check if they have wholesale pricing
    if (item.product?.sizeVariants?.[0]?.wholesalePrice && 
        item.product?.sizeVariants?.[0]?.wholesaleMinQuantity && 
        item.quantity >= item.product.sizeVariants[0].wholesaleMinQuantity) {
      return item.product.sizeVariants[0].wholesalePrice;
    }
    
    return item.product?.productPrice || 0;
  };

  // Helper function to get original price (without wholesale discount)
  const getItemOriginalPrice = (item: any) => {
    if (item.product?.hasMultipleSizes && item.product?.sizeVariants?.length > 0 && item.selectedSize) {
      const variant = item.product.sizeVariants.find((v: any) => v.size === item.selectedSize);
      return variant ? variant.price : item.product.productPrice || 0;
    }
    return item.product?.productPrice || 0;
  };

  // Helper function to check if wholesale pricing is applied
  const isWholesalePriceApplied = (item: any) => {
    if (item.product?.hasMultipleSizes && item.product?.sizeVariants?.length > 0 && item.selectedSize) {
      const variant = item.product.sizeVariants.find((v: any) => v.size === item.selectedSize);
      return variant?.wholesalePrice && variant?.wholesaleMinQuantity && item.quantity >= variant.wholesaleMinQuantity;
    }
    
    // For single-size products
    return item.product?.sizeVariants?.[0]?.wholesalePrice && 
           item.product?.sizeVariants?.[0]?.wholesaleMinQuantity && 
           item.quantity >= item.product.sizeVariants[0].wholesaleMinQuantity;
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.has(getCartItemKey(item)));
  const sellerValidation = validateSingleSeller(selectedCartItems);
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  const originalTotal = selectedCartItems.reduce((sum, item) => sum + (getItemOriginalPrice(item) * item.quantity), 0);
  const wholesaleSavings = originalTotal - subtotal;
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

              {/* Quick Select by Seller */}
              {getGroupedSellers().length > 1 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-medium text-orange-800 mb-2">
                        💡 Quick Select by Seller
                      </h3>
                      <p className="text-sm text-orange-600 mb-3">
                        You can only checkout items from one seller at a time. Select items from one seller below:
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getGroupedSellers().map((seller) => (
                        <Button
                          key={seller.id}
                          variant="outline"
                          size="sm"
                          onClick={() => selectItemsBySeller(seller.id)}
                          className="text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          {seller.name} ({seller.items.length} items)
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Display items grouped by seller */}
              {getGroupedSellers().map((seller) => (
                <div key={seller.id} className="space-y-4">
                  {/* Seller Header */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {seller.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-800">{seller.name}</h3>
                            <p className="text-sm text-blue-600">
                              {seller.items.length} item{seller.items.length > 1 ? 's' : ''} • 
                              Last added: {seller.mostRecentAddedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectItemsBySeller(seller.id)}
                          className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          Select All from {seller.name}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Seller's Items */}
                  {seller.items.map((item) => {
                    if (!item.product) {
                      return null; // Skip items with missing product data
                    }
                    
                    const itemKey = getCartItemKey(item);
                    
                    return (
                    <Card key={itemKey} className="border-gray-200 ml-4">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={selectedItems.has(itemKey)}
                              onCheckedChange={(checked) => handleSelectItem(itemKey, checked)}
                              className="mt-1"
                            />
                            <img 
                              src={
                                item.product.productimage && item.product.productimage.length > 0
                                  ? item.product.productimage[0].url
                                  : "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=300&fit=crop&crop=center"
                              }
                              alt={item.product.productName || 'Product'}
                              className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
                            />
                          </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{item.product.productName || 'Unknown Product'}</h3>
                            <p className="text-sm text-gray-600">by {item.product.user?.name || 'Unknown Seller'}</p>
                            {item.product.productCategory && (
                              <Badge variant="secondary" className="mt-1">
                                {item.product.productCategory}
                              </Badge>
                            )}
                            {/* Display selected size if applicable */}
                            {item.selectedSize && item.product.hasMultipleSizes && (
                              <div className="text-sm text-gray-600 mt-1">
                                Size: <span className="font-medium">{item.selectedSize.toUpperCase()}</span>
                                {/* Show weight if available */}
                                {item.product.sizeVariants && (() => {
                                  const variant = item.product.sizeVariants.find((v: any) => v.size === item.selectedSize);
                                  return variant?.averageWeightPerPiece && item.product.unit === 'per_piece' ? (
                                    <span className="ml-2">• {variant.averageWeightPerPiece}g each</span>
                                  ) : null;
                                })()}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item)}
                            disabled={updating === itemKey}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === itemKey}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            {editingQuantity === itemKey ? (
                              <Input
                                type="text"
                                value={tempQuantity[itemKey] || ''}
                                onChange={(e) => handleQuantityInputChange(itemKey, e.target.value)}
                                onBlur={() => handleQuantityInputBlur(item)}
                                onKeyDown={(e) => handleQuantityInputKeyPress(e, item)}
                                className="w-16 h-8 text-center text-sm px-1"
                                autoFocus
                                disabled={updating === itemKey}
                              />
                            ) : (
                              <button
                                onClick={() => handleQuantityInputFocus(item)}
                                className="font-medium w-16 h-8 text-center border border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={updating === itemKey}
                              >
                                {item.quantity}
                              </button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              disabled={updating === itemKey}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              {/* Show wholesale savings if applicable */}
                              {isWholesalePriceApplied(item) && (
                                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mb-1">
                                  🎉 Wholesale discount applied!
                                </div>
                              )}
                              
                              {/* Total price */}
                              <p className="text-lg font-bold text-gray-800">
                                ₱{(getItemPrice(item) * item.quantity).toFixed(2)}
                              </p>
                              
                              {/* Per unit price with wholesale indication */}
                              <div className="text-sm">
                                {isWholesalePriceApplied(item) ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 line-through">
                                      ₱{getItemOriginalPrice(item).toFixed(2)}
                                    </span>
                                    <span className="text-green-600 font-semibold">
                                      ₱{getItemPrice(item).toFixed(2)} each
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-600">
                                    ₱{getItemPrice(item).toFixed(2)} each
                                  </span>
                                )}
                                
                                {/* Show wholesale threshold info if close to qualifying */}
                                {!isWholesalePriceApplied(item) && (() => {
                                  let wholesaleInfo = null;
                                  
                                  if (item.product?.hasMultipleSizes && item.selectedSize) {
                                    const variant = item.product.sizeVariants.find((v: any) => v.size === item.selectedSize);
                                    if (variant?.wholesalePrice && variant?.wholesaleMinQuantity) {
                                      wholesaleInfo = { price: variant.wholesalePrice, minQty: variant.wholesaleMinQuantity };
                                    }
                                  } else if (item.product?.sizeVariants?.[0]?.wholesalePrice) {
                                    wholesaleInfo = { 
                                      price: item.product.sizeVariants[0].wholesalePrice, 
                                      minQty: item.product.sizeVariants[0].wholesaleMinQuantity 
                                    };
                                  }
                                  
                                  if (wholesaleInfo && item.quantity < wholesaleInfo.minQty) {
                                    const needed = wholesaleInfo.minQty - item.quantity;
                                    const savings = (getItemOriginalPrice(item) - wholesaleInfo.price) * wholesaleInfo.minQty;
                                    return (
                                      <div className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded">
                                        Add {needed} more for ₱{wholesaleInfo.price}/each (Save ₱{savings.toFixed(2)})
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
              </div>
            ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-gray-200 sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {/* Show wholesale savings if any */}
                    {wholesaleSavings > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex justify-between text-green-700">
                          <span className="text-sm font-medium">🎉 Wholesale Savings:</span>
                          <span className="font-bold">-₱{wholesaleSavings.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          You're saving money with bulk purchases!
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Items ({selectedItems.size})</span>
                      <div className="text-right">
                        {wholesaleSavings > 0 && (
                          <div className="text-sm text-gray-500 line-through">
                            ₱{originalTotal.toFixed(2)}
                          </div>
                        )}
                        <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₱{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Multi-seller warning */}
                  {!sellerValidation.isValid && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        ⚠️ Multiple sellers detected
                      </p>
                      <p className="text-xs text-red-600 mb-2">
                        You can only checkout items from one seller at a time.
                      </p>
                      <div className="text-xs text-red-600">
                        <p className="font-medium">Sellers in your selection:</p>
                        {sellerValidation.sellerNames.map((seller, index) => (
                          <p key={seller.id}>• {seller.name}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {sellerValidation.isValid ? (
                    <Link to="/checkout" state={{ selectedItems: selectedCartItems }}>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 mb-4"
                        disabled={selectedItems.size === 0}
                      >
                        Proceed to Checkout ({selectedItems.size} items)
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full bg-gray-400 text-white py-3 mb-4 cursor-not-allowed"
                      disabled={true}
                    >
                      Select items from one seller only
                    </Button>
                  )}
                  
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
