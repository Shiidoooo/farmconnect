const mongoose = require('mongoose');
const ShelfLifePredictor = require('../utils/shelfLifePredictor');


const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: function() {
            return !this.hasMultipleSizes; // Only required if NOT using multiple sizes
        }
    },
    productimage: [
    {
        public_id: {
        type: String,
        required: false,
        },
        url: {
        type: String,
        required: false,
        }
    }
    ],
    productCategory: {
        type: String,
        required: true
    },
    productStock: {
        type: Number,
        required: function() {
            return !this.hasMultipleSizes; // Only required if NOT using multiple sizes
        },
        default: 0
    },
    // New fields for enhanced product management
    sellingType: {
        type: String,
        required: true,
        enum: ['retail', 'wholesale', 'both'],
        default: 'retail'
    },
    unit: {
        type: String,
        required: true,
        enum: ['per_piece', 'per_kilo', 'per_gram', 'per_pound', 'per_bundle', 'per_pack'],
        default: 'per_piece'
    },
    averageWeightPerPiece: {
        type: Number, // in grams
        required: function() {
            // Only required/relevant if unit is per_piece and NOT using multiple sizes
            return this.unit === 'per_piece' && !this.hasMultipleSizes;
        },
        default: null,
        validate: {
            validator: function(value) {
                // Only validate if unit is per_piece
                if (this.unit !== 'per_piece') {
                    return true; // Skip validation for non-per_piece units
                }
                return value == null || value > 0; // Allow null or positive values
            },
            message: 'Average weight per piece must be positive when unit is per_piece'
        }
    },
    size: {
        type: String,
        enum: ['xs', 's', 'm', 'l', 'xl', 'xxl', 'mixed', 'none', null],
        default: 'none'
    },
    // Multiple size variants with different prices
    sizeVariants: [{
        size: {
            type: String,
            enum: ['xs', 's', 'm', 'l', 'xl', 'xxl', 'mixed'],
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        wholesalePrice: {
            type: Number,
            default: null
        },
        wholesaleMinQuantity: {
            type: Number,
            default: null // Minimum quantity for wholesale for this specific size
        },
        averageWeightPerPiece: {
            type: Number, // Weight in grams for this specific size
            default: null
        }
    }],
    // If true, use sizeVariants instead of single size/price
    hasMultipleSizes: {
        type: Boolean,
        default: false
    },
    productStatus: {
        type: String,
        required: true,
        enum: ['available', 'pre_order', 'out_of_stock', 'coming_soon'],
        default: 'available'
    },
    wholesaleMinQuantity: {
        type: Number,
        default: null // Minimum quantity for wholesale orders
    },
    wholesalePrice: {
        type: Number,
        default: null // Different price for wholesale
    },
    availableDate: {
        type: Date,
        default: null // For pre-order items
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    harvestDate: {
        type: Date,
        required: true
    },
    storageLocation: {
        type: String,
        required: true,
        enum: ['fridge', 'pantry', 'shelf', 'room_temp'],
        default: 'room_temp'
    },
    productExpiryDate: {
        type: Date,
        required: false // Will be automatically calculated
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ratings: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order',
                required: true // Required to track which order this rating is for
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    totalSold: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletionReason: {
        type: String,
        enum: ['expired', 'user_deleted', 'admin_deleted', 'inappropriate_content'],
        default: null
    },
    validationResults: {
        nameValidation: {
            isValid: { type: Boolean, default: true },
            confidence: { type: Number, default: 1 },
            message: { type: String, default: '' }
        },
        nameModeration: {
            isAppropriate: { type: Boolean, default: true },
            flagged: { type: Boolean, default: false },
            categories: [{ type: String }],
            message: { type: String, default: '' }
        },
        descriptionModeration: {
            isAppropriate: { type: Boolean, default: true },
            flagged: { type: Boolean, default: false },
            categories: [{ type: String }],
            message: { type: String, default: '' }
        },
        validatedAt: { type: Date, default: Date.now }
    }
});

// Initialize the shelf life predictor
const predictor = new ShelfLifePredictor();

// Pre-save middleware to automatically calculate expiry date
productSchema.pre('save', function(next) {
    // Only calculate if we have harvest date and storage location
    if (this.harvestDate && this.storageLocation) {
        try {
            const prediction = predictor.predictExpiryDate(
                this.productName,
                this.harvestDate,
                this.storageLocation
            );
            
            this.productExpiryDate = prediction.expiryDate;
            
            console.log(`Expiry prediction for ${this.productName}:`, {
                harvestDate: prediction.harvestDate,
                storageLocation: prediction.storageLocation,
                shelfLifeDays: prediction.shelfLifeDays,
                expiryDate: prediction.expiryDate,
                matchedProduct: prediction.matchedProduct
            });
            
        } catch (error) {
            console.error('Error predicting shelf life:', error);
            // Fallback to default calculation
            const harvestDate = new Date(this.harvestDate);
            const defaultDays = this.storageLocation === 'fridge' ? 7 : 3;
            const expiryDate = new Date(harvestDate);
            expiryDate.setDate(expiryDate.getDate() + defaultDays);
            this.productExpiryDate = expiryDate;
        }
    }
    next();
});

// Instance method to recalculate expiry date
productSchema.methods.recalculateExpiryDate = function() {
    if (this.harvestDate && this.storageLocation) {
        const prediction = predictor.predictExpiryDate(
            this.productName,
            this.harvestDate,
            this.storageLocation
        );
        this.productExpiryDate = prediction.expiryDate;
        return this.save();
    }
    return Promise.resolve(this);
};

// Static method to get shelf life prediction without saving
productSchema.statics.predictShelfLife = function(productName, harvestDate, storageLocation) {
    return predictor.predictExpiryDate(productName, harvestDate, storageLocation);
};

// Static method to search available products in shelf life database
productSchema.statics.searchShelfLifeProducts = function(query) {
    return predictor.searchProducts(query);
};

module.exports = mongoose.model('Product', productSchema);