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
        required: true
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
        required: true,
        default: 0
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