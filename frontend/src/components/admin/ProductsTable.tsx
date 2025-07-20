
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Package } from "lucide-react";
import { useState } from "react";

interface SizeVariant {
  size: string;
  price: number;
  stock: number;
  wholesalePrice?: number;
  wholesaleMinQuantity?: number;
  averageWeightPerPiece?: number;
}

interface Product {
  _id: string;
  productName: string;
  productCategory: string;
  productPrice?: number;
  productStock?: number;
  productStatus: string;
  hasMultipleSizes: boolean;
  sizeVariants?: SizeVariant[];
  productimage?: Array<{ url: string }>;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface ProductsTableProps {
  products: Product[];
  showActions?: boolean;
}

const ProductsTable = ({ products, showActions = true }: ProductsTableProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available": return "bg-green-100 text-green-700";
      case "pre_order": return "bg-blue-100 text-blue-700";
      case "out_of_stock": return "bg-red-100 text-red-700";
      case "coming_soon": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatPrice = (price: number) => {
    return `₱${price.toFixed(2)}`;
  };

  const getProductImage = (product: Product) => {
    if (product.productimage && product.productimage.length > 0) {
      return product.productimage[0].url;
    }
    return null;
  };

  const getSellerName = (product: Product) => {
    return product.user?.name || 'Unknown Seller';
  };

  const SizeVariantsDialog = ({ product }: { product: Product }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="w-4 h-4 mr-2" />
          View Sizes ({product.sizeVariants?.length || 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.productName} - Size Variants</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {product.sizeVariants?.map((variant, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Size</label>
                  <p className="text-lg font-semibold">{variant.size}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="text-lg font-semibold">{formatPrice(variant.price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock</label>
                  <p className="text-lg font-semibold">{variant.stock}</p>
                </div>
                {variant.wholesalePrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Wholesale Price</label>
                    <p className="text-lg font-semibold">{formatPrice(variant.wholesalePrice)}</p>
                  </div>
                )}
                {variant.wholesaleMinQuantity && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Min Wholesale Qty</label>
                    <p className="text-lg font-semibold">{variant.wholesaleMinQuantity}</p>
                  </div>
                )}
                {variant.averageWeightPerPiece && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Weight per Piece</label>
                    <p className="text-lg font-semibold">{variant.averageWeightPerPiece}g</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price/Stock</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sizes</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Package className="w-8 h-8 text-gray-400" />
                  <p className="text-gray-500">No products found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {getProductImage(product) ? (
                      <img 
                        src={getProductImage(product)!} 
                        alt={product.productName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium">{product.productName}</span>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.productCategory}</TableCell>
                <TableCell>
                  {product.hasMultipleSizes ? (
                    <div>
                      <span className="text-sm text-gray-500">Multiple prices</span>
                      <p className="text-sm">
                        Stock: {product.sizeVariants?.reduce((total, variant) => total + variant.stock, 0) || 0}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold">{formatPrice(product.productPrice || 0)}</span>
                      <p className="text-sm text-gray-500">Stock: {product.productStock || 0}</p>
                    </div>
                  )}
                </TableCell>
                <TableCell>{getSellerName(product)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(product.productStatus)}>
                    {product.productStatus.replace("_", " ").charAt(0).toUpperCase() + product.productStatus.replace("_", " ").slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {product.hasMultipleSizes && product.sizeVariants?.length ? (
                    <SizeVariantsDialog product={product} />
                  ) : (
                    <span className="text-sm text-gray-500">Single size</span>
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

export default ProductsTable;
