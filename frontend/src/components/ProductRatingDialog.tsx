import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productsAPI } from "@/services/api";

interface ProductRatingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    _id: string;
    productName: string;
    productimage?: Array<{ url: string }>;
  };
  orderId: string;
  onRatingSubmitted: () => void;
}

const ProductRatingDialog = ({ 
  isOpen, 
  onOpenChange, 
  product, 
  orderId, 
  onRatingSubmitted 
}: ProductRatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    if (!product?._id) {
      toast({
        title: "Error",
        description: "Product information is missing",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await productsAPI.addOrderRating(product._id, {
        rating,
        comment: comment.trim(),
        orderId
      });

      if (response.success) {
        toast({
          title: "Success! ⭐",
          description: "Thank you for your review!",
        });
        
        // Reset form
        setRating(0);
        setComment("");
        setHoveredRating(0);
        
        onRatingSubmitted();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit rating",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    const texts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return texts[rating as keyof typeof texts] || "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Product</DialogTitle>
        </DialogHeader>
        
        {!product && (
          <div className="p-4 text-center text-red-600">
            Error: Product information is missing
          </div>
        )}
        
        {product && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="flex items-center space-x-3">
              <img
                src={product.productimage?.[0]?.url || "/placeholder.svg"}
                alt={product.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-medium text-gray-800">{product.productName}</h3>
                <p className="text-sm text-gray-600">How was your experience with this product?</p>
              </div>
            </div>

          {/* Rating Stars */}
          <div className="text-center space-y-2">
            {renderStars()}
            {(hoveredRating || rating) > 0 && (
              <p className="text-sm font-medium text-gray-700">
                {getRatingText(hoveredRating || rating)}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Review (Optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={submitting || rating === 0}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductRatingDialog;
