import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { productsAPI } from "@/services/api";
import { Plus, Edit, Trash2, Package, Calendar, DollarSign, Image, Upload, AlertTriangle } from "lucide-react";

const MyProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    productCategory: "",
    productStock: "",
    harvestDate: "",
    storageLocation: "room_temp",
    sellingType: "retail",
    unit: "per_piece",
    averageWeightPerPiece: "",
    size: "none",
    productStatus: "available",
    wholesaleMinQuantity: "",
    wholesalePrice: "",
    availableDate: "",
    hasMultipleSizes: false,
    sizeVariants: [],
    productimage: []
  });

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await productsAPI.getMyProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      productimage: files
    }));
  };

  const handleMultipleSizesToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      hasMultipleSizes: checked,
      sizeVariants: checked ? [{ 
        size: 's', 
        price: '', 
        stock: '', 
        wholesalePrice: '', 
        wholesaleMinQuantity: '',
        averageWeightPerPiece: ''
      }] : [],
      size: checked ? 'none' : prev.size
    }));
  };

  const addSizeVariant = () => {
    setFormData(prev => ({
      ...prev,
      sizeVariants: [...prev.sizeVariants, { 
        size: 's', 
        price: '', 
        stock: '', 
        wholesalePrice: '', 
        wholesaleMinQuantity: '',
        averageWeightPerPiece: ''
      }]
    }));
  };

  const removeSizeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      sizeVariants: prev.sizeVariants.filter((_, i) => i !== index)
    }));
  };

  const updateSizeVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizeVariants: prev.sizeVariants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('productName', formData.productName);
      formDataToSend.append('productDescription', formData.productDescription);
      
      // Only append price and stock if not using multiple sizes
      if (!formData.hasMultipleSizes) {
        formDataToSend.append('productPrice', formData.productPrice);
        formDataToSend.append('productStock', formData.productStock);
      } else {
        // Set default values for multiple sizes
        formDataToSend.append('productPrice', '0');
        formDataToSend.append('productStock', '0');
      }
      
      formDataToSend.append('productCategory', formData.productCategory);
      formDataToSend.append('harvestDate', formData.harvestDate);
      formDataToSend.append('storageLocation', formData.storageLocation);
      formDataToSend.append('sellingType', formData.sellingType);
      formDataToSend.append('unit', formData.unit);
      
      // Only send averageWeightPerPiece if unit is per_piece and NOT using multiple sizes
      if (formData.averageWeightPerPiece && formData.unit === 'per_piece' && !formData.hasMultipleSizes) {
        formDataToSend.append('averageWeightPerPiece', formData.averageWeightPerPiece);
      }
      
      // Handle size variants
      formDataToSend.append('hasMultipleSizes', formData.hasMultipleSizes.toString());
      if (formData.hasMultipleSizes && formData.sizeVariants.length > 0) {
        formDataToSend.append('sizeVariants', JSON.stringify(formData.sizeVariants));
      } else if (formData.size && formData.size !== 'none') {
        formDataToSend.append('size', formData.size);
      }
      
      formDataToSend.append('productStatus', formData.productStatus);
      if (formData.wholesaleMinQuantity) formDataToSend.append('wholesaleMinQuantity', formData.wholesaleMinQuantity);
      if (formData.wholesalePrice) formDataToSend.append('wholesalePrice', formData.wholesalePrice);
      if (formData.availableDate) formDataToSend.append('availableDate', formData.availableDate);
      
      // Append images
      formData.productimage.forEach((file) => {
        formDataToSend.append('productimage', file);
      });

      let response;
      if (editingProduct) {
        response = await productsAPI.updateProduct(editingProduct._id, formDataToSend);
      } else {
        response = await productsAPI.createProduct(formDataToSend);
      }

      if (response.success) {
        // Show success toast
        toast({
          title: "Success",
          description: response.message || (editingProduct ? "Product updated successfully" : "Product created successfully"),
        });

        // Show warning if product was flagged or hidden
        if (response.warning) {
          setTimeout(() => {
            toast({
              title: "Important Notice",
              description: response.warning,
              variant: "destructive",
              duration: 8000, // Show for longer
            });
          }, 2000);
        }

        // Show validation details if product was hidden
        if (response.validation?.isHidden) {
          setTimeout(() => {
            const reason = response.validation.reason;
            let detailMessage = "Your product has been created but is currently hidden. ";
            
            if (!response.validation.nameValidation?.isValid) {
              detailMessage += "The product name doesn't appear to be related to fruits, vegetables, or seeds. ";
            }
            if (!response.validation.nameModeration?.isAppropriate) {
              detailMessage += "The product name contains inappropriate content. ";
            }
            if (!response.validation.descriptionModeration?.isAppropriate) {
              detailMessage += "The product description contains inappropriate content. ";
            }
            detailMessage += "Please edit your product to make it visible to customers.";
            
            toast({
              title: "Product Hidden",
              description: detailMessage,
              variant: "destructive",
              duration: 10000,
            });
          }, 4000);
        }

        setIsDialogOpen(false);
        resetForm();
        fetchMyProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      productDescription: product.productDescription,
      productPrice: product.productPrice.toString(),
      productCategory: product.productCategory,
      productStock: product.productStock.toString(),
      harvestDate: product.harvestDate ? product.harvestDate.split('T')[0] : "",
      storageLocation: product.storageLocation || "room_temp",
      sellingType: product.sellingType || "retail",
      unit: product.unit || "per_piece",
      averageWeightPerPiece: product.averageWeightPerPiece ? product.averageWeightPerPiece.toString() : "",
      size: product.size || "none",
      productStatus: product.productStatus || "available",
      wholesaleMinQuantity: product.wholesaleMinQuantity ? product.wholesaleMinQuantity.toString() : "",
      wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toString() : "",
      availableDate: product.availableDate ? product.availableDate.split('T')[0] : "",
      hasMultipleSizes: product.hasMultipleSizes || false,
      sizeVariants: product.sizeVariants ? product.sizeVariants.map(variant => ({
        size: variant.size,
        price: variant.price.toString(),
        stock: variant.stock.toString(),
        wholesalePrice: variant.wholesalePrice ? variant.wholesalePrice.toString() : '',
        wholesaleMinQuantity: variant.wholesaleMinQuantity ? variant.wholesaleMinQuantity.toString() : '',
        averageWeightPerPiece: variant.averageWeightPerPiece ? variant.averageWeightPerPiece.toString() : ''
      })) : [],
      productimage: []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await productsAPI.deleteProduct(productId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        fetchMyProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      productDescription: "",
      productPrice: "",
      productCategory: "",
      productStock: "",
      harvestDate: "",
      storageLocation: "room_temp",
      sellingType: "retail",
      unit: "per_piece",
      averageWeightPerPiece: "",
      size: "none",
      productStatus: "available",
      wholesaleMinQuantity: "",
      wholesalePrice: "",
      availableDate: "",
      hasMultipleSizes: false,
      sizeVariants: [],
      productimage: []
    });
    setEditingProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isProductExpired = (product) => {
    return new Date(product.productExpiryDate) < new Date();
  };

  const getProductStatus = (product) => {
    if (product.isDeleted) {
      switch (product.deletionReason) {
        case 'expired':
          return { status: 'Expired', color: 'bg-red-100 text-red-800', reason: 'Product expired automatically' };
        case 'user_deleted':
          return { status: 'Deleted', color: 'bg-gray-100 text-gray-800', reason: 'Deleted by user' };
        case 'admin_deleted':
          return { status: 'Removed', color: 'bg-orange-100 text-orange-800', reason: 'Removed by administrator' };
        case 'inappropriate_content':
          // Check validation results to give more specific reason
          if (product.validationResults?.nameValidation?.isValid === false) {
            return { status: 'Hidden', color: 'bg-yellow-100 text-yellow-800', reason: 'Hidden - not related to fruits/vegetables/seeds' };
          } else {
            return { status: 'Hidden', color: 'bg-yellow-100 text-yellow-800', reason: 'Hidden - inappropriate content detected' };
          }
        default:
          return { status: 'Deleted', color: 'bg-gray-100 text-gray-800', reason: 'Product deleted' };
      }
    }
    
    if (isProductExpired(product)) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800', reason: 'Product has expired' };
    }
    
    return { status: 'Active', color: 'bg-green-100 text-green-800', reason: null };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
          <p className="text-gray-600">Manage your vegetables and fruits</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingProduct ? 'Update your product information below.' : 'Fill in the details to add a new product to your store.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a name related to fruits, vegetables, or seeds (e.g., "Fresh Tomatoes", "Organic Mangoes", "Corn Seeds")
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="productCategory">Category</Label>
                  <Select value={formData.productCategory} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, productCategory: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="productDescription">Description</Label>
                <Textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productPrice">
                    Price (₱) {formData.hasMultipleSizes && <span className="text-gray-500 text-sm">(Optional - set in size variants)</span>}
                  </Label>
                  <Input
                    id="productPrice"
                    name="productPrice"
                    type="number"
                    step="0.01"
                    value={formData.productPrice}
                    onChange={handleInputChange}
                    required={!formData.hasMultipleSizes}
                    disabled={formData.hasMultipleSizes}
                    placeholder={formData.hasMultipleSizes ? "Set in size variants" : "Enter price"}
                  />
                </div>
                
                <div>
                  <Label htmlFor="productStock">
                    Stock Quantity {formData.hasMultipleSizes && <span className="text-gray-500 text-sm">(Optional - set in size variants)</span>}
                  </Label>
                  <Input
                    id="productStock"
                    name="productStock"
                    type="number"
                    value={formData.productStock}
                    onChange={handleInputChange}
                    required={!formData.hasMultipleSizes}
                    disabled={formData.hasMultipleSizes}
                    placeholder={formData.hasMultipleSizes ? "Set in size variants" : "Enter stock"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    name="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="storageLocation">Storage Location</Label>
                  <Select value={formData.storageLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, storageLocation: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fridge">Fridge/Refrigerator</SelectItem>
                      <SelectItem value="pantry">Pantry</SelectItem>
                      <SelectItem value="shelf">Shelf</SelectItem>
                      <SelectItem value="room_temp">Room Temperature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* New selling options section */}
              <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-800">Selling Options</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sellingType">Selling Type</Label>
                    <Select value={formData.sellingType} onValueChange={(value) => setFormData(prev => ({ ...prev, sellingType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select selling type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail Only</SelectItem>
                        <SelectItem value="wholesale">Wholesale Only</SelectItem>
                        <SelectItem value="both">Both Retail & Wholesale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="unit">Unit of Sale</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_piece">Per Piece</SelectItem>
                        <SelectItem value="per_kilo">Per Kilo</SelectItem>
                        <SelectItem value="per_gram">Per Gram</SelectItem>
                        <SelectItem value="per_pound">Per Pound</SelectItem>
                        <SelectItem value="per_bundle">Per Bundle</SelectItem>
                        <SelectItem value="per_pack">Per Pack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.unit === 'per_piece' && (
                    <div>
                      <Label htmlFor="averageWeightPerPiece">
                        Average Weight per Piece (grams)
                        {formData.hasMultipleSizes && (
                          <span className="text-sm text-gray-500 ml-1">(Set in size variants)</span>
                        )}
                      </Label>
                      <Input
                        id="averageWeightPerPiece"
                        name="averageWeightPerPiece"
                        type="number"
                        step="0.1"
                        value={formData.averageWeightPerPiece}
                        onChange={handleInputChange}
                        placeholder="e.g., 150"
                        disabled={formData.hasMultipleSizes}
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="hasMultipleSizes"
                        checked={formData.hasMultipleSizes}
                        onChange={(e) => handleMultipleSizesToggle(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="hasMultipleSizes" className="font-medium">
                        This product has multiple sizes with different prices
                      </Label>
                    </div>
                    
                    {!formData.hasMultipleSizes ? (
                      <div>
                        <Label htmlFor="size">Size (Optional)</Label>
                        <Select value={formData.size || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value === "none" ? "" : value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No specific size</SelectItem>
                            <SelectItem value="xs">Extra Small (XS)</SelectItem>
                            <SelectItem value="s">Small (S)</SelectItem>
                            <SelectItem value="m">Medium (M)</SelectItem>
                            <SelectItem value="l">Large (L)</SelectItem>
                            <SelectItem value="xl">Extra Large (XL)</SelectItem>
                            <SelectItem value="xxl">XXL</SelectItem>
                            <SelectItem value="mixed">Mixed Sizes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">Size Variants</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSizeVariant}
                            className="flex items-center space-x-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Size</span>
                          </Button>
                        </div>
                        
                        {formData.sizeVariants.map((variant, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">Size Variant {index + 1}</h5>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSizeVariant(index)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                disabled={formData.sizeVariants.length === 1}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className={`grid gap-3 ${formData.unit === 'per_piece' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                              <div>
                                <Label className="text-xs">Size</Label>
                                <Select
                                  value={variant.size}
                                  onValueChange={(value) => updateSizeVariant(index, 'size', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="xs">XS</SelectItem>
                                    <SelectItem value="s">S</SelectItem>
                                    <SelectItem value="m">M</SelectItem>
                                    <SelectItem value="l">L</SelectItem>
                                    <SelectItem value="xl">XL</SelectItem>
                                    <SelectItem value="xxl">XXL</SelectItem>
                                    <SelectItem value="mixed">Mixed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Retail Price (₱)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(e) => updateSizeVariant(index, 'price', e.target.value)}
                                  placeholder="0.00"
                                  className="h-8"
                                  required
                                />
                              </div>
                              
                              <div>
                                <Label className="text-xs">Stock</Label>
                                <Input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => updateSizeVariant(index, 'stock', e.target.value)}
                                  placeholder="0"
                                  className="h-8"
                                  required
                                />
                              </div>
                              
                              {formData.unit === 'per_piece' && (
                                <div>
                                  <Label className="text-xs">Weight per piece (g)</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={variant.averageWeightPerPiece}
                                    onChange={(e) => updateSizeVariant(index, 'averageWeightPerPiece', e.target.value)}
                                    placeholder="e.g., 50"
                                    className="h-8"
                                  />
                                </div>
                              )}
                            </div>
                            
                            {(formData.sellingType === 'wholesale' || formData.sellingType === 'both') && (
                              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                                <div>
                                  <Label className="text-xs">Wholesale Price (₱)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={variant.wholesalePrice}
                                    onChange={(e) => updateSizeVariant(index, 'wholesalePrice', e.target.value)}
                                    placeholder="0.00"
                                    className="h-8"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Wholesale Min Qty</Label>
                                  <Input
                                    type="number"
                                    value={variant.wholesaleMinQuantity}
                                    onChange={(e) => updateSizeVariant(index, 'wholesaleMinQuantity', e.target.value)}
                                    placeholder="e.g., 20"
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {formData.sizeVariants.length === 0 && (
                          <p className="text-sm text-gray-500 italic">
                            Click "Add Size" to create size variants with different prices
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(formData.sellingType === 'wholesale' || formData.sellingType === 'both') && (
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <Label htmlFor="wholesaleMinQuantity">
                        Wholesale Min Quantity
                        {formData.hasMultipleSizes && (
                          <span className="text-sm text-gray-500 ml-1">(Set in size variants)</span>
                        )}
                      </Label>
                      <Input
                        id="wholesaleMinQuantity"
                        name="wholesaleMinQuantity"
                        type="number"
                        value={formData.wholesaleMinQuantity}
                        onChange={handleInputChange}
                        placeholder="e.g., 50"
                        disabled={formData.hasMultipleSizes}
                        required={(formData.sellingType === 'wholesale' || formData.sellingType === 'both') && !formData.hasMultipleSizes}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="wholesalePrice">
                        Wholesale Price (₱)
                        {formData.hasMultipleSizes && (
                          <span className="text-sm text-gray-500 ml-1">(Set in size variants)</span>
                        )}
                      </Label>
                      <Input
                        id="wholesalePrice"
                        name="wholesalePrice"
                        type="number"
                        step="0.01"
                        value={formData.wholesalePrice}
                        onChange={handleInputChange}
                        placeholder="e.g., 45.00"
                        disabled={formData.hasMultipleSizes}
                        required={(formData.sellingType === 'wholesale' || formData.sellingType === 'both') && !formData.hasMultipleSizes}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Product status section */}
              <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-800">Product Status</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productStatus">Availability Status</Label>
                    <Select value={formData.productStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, productStatus: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available Now</SelectItem>
                        <SelectItem value="pre_order">Pre-order</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="coming_soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.productStatus === 'pre_order' && (
                    <div>
                      <Label htmlFor="availableDate">Available Date</Label>
                      <Input
                        id="availableDate"
                        name="availableDate"
                        type="date"
                        value={formData.availableDate}
                        onChange={handleInputChange}
                        required={formData.productStatus === 'pre_order'}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-800">Automatic Expiry Calculation</h4>
                    <p className="text-sm text-blue-600">
                      The expiry date will be automatically calculated based on your product name, harvest date, and storage location using our intelligent prediction system.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="productimage">Product Images</Label>
                <Input
                  id="productimage"
                  name="productimage"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload multiple images (JPEG, PNG, WebP)
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first product.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => {
            const productStatus = getProductStatus(product);
            const isInactive = product.isDeleted || isProductExpired(product);
            
            return (
              <Card 
                key={product._id} 
                className={`overflow-hidden transition-all ${
                  isInactive 
                    ? 'border-red-200 bg-red-50/30' 
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                  {/* Product Images */}
                  <div className="flex-shrink-0 relative">
                    {product.productimage && product.productimage.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 w-40">
                        {product.productimage.slice(0, 4).map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image.url}
                              alt={`${product.productName} ${index + 1}`}
                              className={`w-full h-16 object-cover rounded-lg ${
                                isInactive ? 'grayscale opacity-60' : ''
                              }`}
                            />
                          </div>
                        ))}
                        {product.productimage.length > 4 && (
                          <div className={`w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 ${
                            isInactive ? 'grayscale opacity-60' : ''
                          }`}>
                            +{product.productimage.length - 4} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-40 h-32 bg-gray-100 rounded-lg flex items-center justify-center ${
                        isInactive ? 'grayscale opacity-60' : ''
                      }`}>
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {product.productName}
                          </h3>
                          <Badge 
                            className={`${getProductStatus(product).color} text-xs font-medium`}
                          >
                            {getProductStatus(product).status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {product.productCategory}
                          </Badge>
                          {getProductStatus(product).reason && (
                            <span className="text-xs text-red-600 italic">
                              {getProductStatus(product).reason}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          disabled={product.isDeleted || isProductExpired(product)}
                          className={product.isDeleted || isProductExpired(product) ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          disabled={product.isDeleted}
                          className={`text-red-600 hover:text-red-700 ${product.isDeleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {product.productDescription}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">
                            {product.hasMultipleSizes ? 'Price Range' : 'Price'}
                          </p>
                          {product.hasMultipleSizes && product.sizeVariants?.length > 0 ? (
                            <div>
                              <p className="font-semibold text-green-600">
                                {formatPrice(Math.min(...product.sizeVariants.map(v => v.price)))} - {formatPrice(Math.max(...product.sizeVariants.map(v => v.price)))}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.sizeVariants.length} size{product.sizeVariants.length > 1 ? 's' : ''} available
                              </p>
                            </div>
                          ) : (
                            <p className="font-semibold text-green-600">
                              {formatPrice(product.productPrice)}
                              {product.sellingType && (
                                <span className="text-xs block text-gray-500 capitalize">
                                  {product.sellingType === 'both' ? 'Retail & Wholesale' : product.sellingType}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Stock</p>
                          {product.hasMultipleSizes && product.sizeVariants?.length > 0 ? (
                            <div>
                              <p className="font-semibold">
                                {product.sizeVariants.reduce((total, variant) => total + (variant.stock || 0), 0)} total
                              </p>
                              <p className="text-xs text-gray-500">
                                Across {product.sizeVariants.length} size{product.sizeVariants.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          ) : (
                            <p className="font-semibold">
                              {product.productStock}
                              {product.unit && (
                                <span className="text-xs block text-gray-500">
                                  {product.unit.replace('_', ' ')}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Size information - enhanced for multiple sizes */}
                      {product.hasMultipleSizes && product.sizeVariants?.length > 0 ? (
                        <div className="flex items-start space-x-2">
                          <Package className="w-4 h-4 text-teal-600 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Available Sizes</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.sizeVariants.map((variant, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`text-xs px-2 py-1 ${
                                    (variant.stock || 0) > 0 
                                      ? 'border-green-500 text-green-700 bg-green-50' 
                                      : 'border-red-500 text-red-700 bg-red-50'
                                  }`}
                                >
                                  {variant.size.toUpperCase()}
                                  <span className="ml-1 text-xs">
                                    (₱{variant.price}, {variant.stock || 0} left)
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : product.size && product.size !== 'none' ? (
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-teal-600" />
                          <div>
                            <p className="text-sm text-gray-500">Size</p>
                            <p className="font-semibold uppercase">
                              {product.size === 'mixed' ? 'Mixed' : product.size}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {product.productStatus && product.productStatus !== 'available' && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-semibold capitalize">
                              {product.productStatus.replace('_', ' ')}
                              {product.availableDate && product.productStatus === 'pre_order' && (
                                <span className="text-xs block text-gray-500">
                                  Available: {formatDate(product.availableDate)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Harvested</p>
                          <p className="font-semibold">
                            {product.harvestDate ? formatDate(product.harvestDate) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-500">Storage</p>
                          <p className="font-semibold capitalize">
                            {product.storageLocation?.replace('_', ' ') || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className={`w-4 h-4 ${
                          isProductExpired(product) ? 'text-red-600' : 'text-orange-600'
                        }`} />
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-sm text-gray-500">Expires</p>
                            {isProductExpired(product) && (
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                            )}
                          </div>
                          <p className={`font-semibold ${
                            isProductExpired(product) ? 'text-red-600' : ''
                          }`}>
                            {formatDate(product.productExpiryDate)}
                            {isProductExpired(product) && (
                              <span className="text-xs ml-1">(Expired)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {(product.sellingType === 'wholesale' || product.sellingType === 'both') && product.wholesalePrice && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="text-sm text-gray-500">Wholesale</p>
                            <p className="font-semibold text-emerald-600">
                              {formatPrice(product.wholesalePrice)}
                              {product.wholesaleMinQuantity && (
                                <span className="text-xs block text-gray-500">
                                  Min: {product.wholesaleMinQuantity}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-semibold">
                          {formatDate(product.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Size Variants Display */}
                    {product.hasMultipleSizes && product.sizeVariants?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          Size Variants ({product.sizeVariants.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {product.sizeVariants.map((variant, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded uppercase">
                                    {variant.size}
                                  </span>
                                  <p className="font-semibold text-green-600 mt-1">
                                    {formatPrice(variant.price)}
                                  </p>
                                  {variant.wholesalePrice && (
                                    <p className="text-xs text-emerald-600">
                                      Wholesale: {formatPrice(variant.wholesalePrice)}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-600">
                                    {variant.stock} {product.unit?.replace('per_', '') || 'units'}
                                  </p>
                                  <p className="text-xs text-gray-500">in stock</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProductsSection;
