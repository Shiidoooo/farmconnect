const Product = require('../models/ProductModel');
const cloudinary = require('../config/cloudinary');
const { softDeleteExpiredProducts } = require('../utils/productUtils');
const { validateProductContent } = require('../utils/productValidation');

// Get all products
const getAllProducts = async (req, res) => {
    try {
        // Run soft delete check for expired products before fetching
        await softDeleteExpiredProducts();
        
        // Only fetch products that are not soft deleted (include products where isDeleted doesn't exist or is false)
        const products = await Product.find({ 
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }  // <-- This filters out soft deleted products
            ]
        }).populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        });
    }
};

// Get single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ 
            _id: req.params.id, 
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }
            ]
        }).populate('user', 'name email');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching product'
        });
    }
};

// Get current user's products
const getMyProducts = async (req, res) => {
    try {
        // Run soft delete check for expired products before fetching
        await softDeleteExpiredProducts();
        
        // Get all products (including soft deleted) for the user so they can see expired products
        const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching user products:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your products'
        });
    }
};

// Create new product
const createProduct = async (req, res) => {
    try {
        const {
            productName,
            productDescription,
            productPrice,
            productCategory,
            productStock,
            harvestDate,
            storageLocation,
            sellingType,
            unit,
            averageWeightPerPiece,
            size,
            productStatus,
            wholesaleMinQuantity,
            wholesalePrice,
            availableDate,
            hasMultipleSizes,
            sizeVariants
        } = req.body;

        // Validate required fields (expiry date is now auto-calculated)
        if (!productName || !productDescription || !productCategory || !harvestDate || !storageLocation) {
            return res.status(400).json({
                success: false,
                message: 'Product name, description, category, harvest date, and storage location are required'
            });
        }

        // Check if using multiple sizes
        const usingMultipleSizes = hasMultipleSizes === 'true' || hasMultipleSizes === true;
        
        // If NOT using multiple sizes, validate price and stock
        if (!usingMultipleSizes) {
            if (!productPrice || !productStock) {
                return res.status(400).json({
                    success: false,
                    message: 'Price and stock are required for single-size products'
                });
            }
        }

        // Additional validation for new fields
        if (sellingType && !['retail', 'wholesale', 'both'].includes(sellingType)) {
            return res.status(400).json({
                success: false,
                message: 'Selling type must be retail, wholesale, or both'
            });
        }

        if (unit && !['per_piece', 'per_kilo', 'per_gram', 'per_pound', 'per_bundle', 'per_pack'].includes(unit)) {
            return res.status(400).json({
                success: false,
                message: 'Unit must be per_piece, per_kilo, per_gram, per_pound, per_bundle, or per_pack'
            });
        }

        if (productStatus && !['available', 'pre_order', 'out_of_stock', 'coming_soon'].includes(productStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Product status must be available, pre_order, out_of_stock, or coming_soon'
            });
        }

        // Validate that if selling type includes wholesale, wholesale fields are provided
        // Only check base wholesale fields if NOT using multiple sizes
        if ((sellingType === 'wholesale' || sellingType === 'both') && 
            (hasMultipleSizes !== 'true' && hasMultipleSizes !== true) && 
            (!wholesaleMinQuantity || !wholesalePrice)) {
            return res.status(400).json({
                success: false,
                message: 'Wholesale minimum quantity and price are required for wholesale selling'
            });
        }

        // Validate that if product status is pre_order, available date is provided
        if (productStatus === 'pre_order' && !availableDate) {
            return res.status(400).json({
                success: false,
                message: 'Available date is required for pre-order products'
            });
        }

        // Validate size variants if multiple sizes are enabled
        if (hasMultipleSizes === 'true' || hasMultipleSizes === true) {
            let variants = [];
            try {
                // Parse sizeVariants if it's a JSON string
                variants = typeof sizeVariants === 'string' ? JSON.parse(sizeVariants) : sizeVariants;
            } catch (error) {
                console.error('Error parsing size variants:', error);
            }

            if (!variants || !Array.isArray(variants) || variants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Size variants are required when multiple sizes are enabled'
                });
            }

            // Validate each size variant
            for (const variant of variants) {
                if (!variant.size || !variant.price || variant.stock === undefined || variant.stock === '') {
                    return res.status(400).json({
                        success: false,
                        message: 'Each size variant must have size, price, and stock'
                    });
                }

                if (!['xs', 's', 'm', 'l', 'xl', 'xxl', 'mixed'].includes(variant.size)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid size in variant: ' + variant.size
                    });
                }

                // If selling type includes wholesale, validate wholesale fields in variants
                if ((sellingType === 'wholesale' || sellingType === 'both') && 
                    (!variant.wholesalePrice || !variant.wholesaleMinQuantity)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each size variant must have wholesale price and minimum quantity when selling wholesale'
                    });
                }
            }
        }

        console.log('Creating product with validation for:', productName);

        // Validate product content using your APIs
        const validation = await validateProductContent(productName, productDescription, productCategory);
        
        console.log('Validation result:', validation);

        // Process uploaded images
        let productImages = [];
        if (req.files && req.files.length > 0) {
            productImages = req.files.map(file => ({
                public_id: file.filename,
                url: file.path
            }));
        }

        // Process size variants if applicable
        let processedSizeVariants = [];
        let hasMultipleSizesFlag = false;
        
        if (hasMultipleSizes === 'true' || hasMultipleSizes === true) {
            hasMultipleSizesFlag = true;
            if (sizeVariants) {
                try {
                    // Parse sizeVariants if it's a JSON string
                    const variants = typeof sizeVariants === 'string' ? JSON.parse(sizeVariants) : sizeVariants;
                    if (Array.isArray(variants)) {
                        processedSizeVariants = variants.map(variant => ({
                            size: variant.size,
                            price: parseFloat(variant.price),
                            stock: parseInt(variant.stock),
                            wholesalePrice: variant.wholesalePrice ? parseFloat(variant.wholesalePrice) : null,
                            wholesaleMinQuantity: variant.wholesaleMinQuantity ? parseInt(variant.wholesaleMinQuantity) : null,
                            averageWeightPerPiece: variant.averageWeightPerPiece ? parseFloat(variant.averageWeightPerPiece) : null
                        }));
                    }
                } catch (error) {
                    console.error('Error parsing size variants:', error);
                }
            }
        }

        // Always create the product - but soft delete if inappropriate or invalid
        const product = new Product({
            productName,
            productDescription,
            productPrice: hasMultipleSizesFlag ? null : parseFloat(productPrice),
            productCategory: productCategory.toLowerCase(),
            productStock: hasMultipleSizesFlag ? 0 : parseInt(productStock), // Set to 0 for multiple sizes, will be calculated from variants
            harvestDate: new Date(harvestDate),
            storageLocation,
            sellingType: sellingType || 'retail',
            unit: unit || 'per_piece',
            averageWeightPerPiece: averageWeightPerPiece ? parseFloat(averageWeightPerPiece) : null,
            size: hasMultipleSizesFlag ? null : (size || null),
            hasMultipleSizes: hasMultipleSizesFlag,
            sizeVariants: processedSizeVariants,
            productStatus: productStatus || 'available',
            wholesaleMinQuantity: hasMultipleSizesFlag ? null : (wholesaleMinQuantity ? parseInt(wholesaleMinQuantity) : null),
            wholesalePrice: hasMultipleSizesFlag ? null : (wholesalePrice ? parseFloat(wholesalePrice) : null),
            availableDate: availableDate ? new Date(availableDate) : null,
            // productExpiryDate will be calculated automatically by the pre-save middleware
            productimage: productImages,
            user: req.user._id,
            validationResults: validation,
            // Soft delete if validation failed
            isDeleted: validation.shouldSoftDelete,
            deletedAt: validation.shouldSoftDelete ? new Date() : null,
            deletionReason: validation.deletionReason
        });

        console.log('Product creation data:', {
            productName,
            isDeleted: validation.shouldSoftDelete,
            deletionReason: validation.deletionReason
        });

        const savedProduct = await product.save();
        const populatedProduct = await Product.findById(savedProduct._id).populate('user', 'name email');

        // Return different messages based on validation results
        let message = 'Product created successfully';
        let warning = null;

        if (validation.shouldSoftDelete) {
            if (!validation.nameValidation.isValid) {
                message = 'Product created but hidden because it\'s not related to fruits, vegetables, or seeds';
                warning = 'Your product has been automatically hidden because the name doesn\'t appear to be related to fruits, vegetables, or seeds. Please update your product name to make it visible.';
            } else if (!validation.nameModeration.isAppropriate || !validation.descriptionModeration.isAppropriate) {
                message = 'Product created but hidden due to inappropriate content';
                warning = 'Your product has been automatically hidden due to inappropriate content detected in the name or description. Please review and update your product details.';
            }
        }

        res.status(201).json({
            success: true,
            data: populatedProduct,
            message,
            warning,
            validation: {
                nameValidation: validation.nameValidation,
                nameModeration: validation.nameModeration,
                descriptionModeration: validation.descriptionModeration,
                isHidden: validation.shouldSoftDelete,
                reason: validation.deletionReason
            }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating product'
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns the product
        if (product.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        const {
            productName,
            productDescription,
            productPrice,
            productCategory,
            productStock,
            harvestDate,
            storageLocation,
            sellingType,
            unit,
            averageWeightPerPiece,
            size,
            productStatus,
            wholesaleMinQuantity,
            wholesalePrice,
            availableDate,
            hasMultipleSizes,
            sizeVariants
        } = req.body;

        // Validate product content if name or description is being updated
        let validation = null;
        if (productName || productDescription) {
            const nameToValidate = productName || product.productName;
            const descriptionToValidate = productDescription || product.productDescription;
            const categoryToValidate = productCategory || product.productCategory;
            
            validation = await validateProductContent(nameToValidate, descriptionToValidate, categoryToValidate);
        }

        // Update fields
        if (productName) product.productName = productName;
        if (productDescription) product.productDescription = productDescription;
        if (productPrice) product.productPrice = parseFloat(productPrice);
        if (productCategory) product.productCategory = productCategory.toLowerCase();
        if (productStock) product.productStock = parseInt(productStock);
        if (harvestDate) product.harvestDate = new Date(harvestDate);
        if (storageLocation) product.storageLocation = storageLocation;
        if (sellingType) product.sellingType = sellingType;
        if (unit) product.unit = unit;
        if (averageWeightPerPiece !== undefined) product.averageWeightPerPiece = averageWeightPerPiece ? parseFloat(averageWeightPerPiece) : null;
        
        // Handle size variants update
        if (hasMultipleSizes !== undefined) {
            product.hasMultipleSizes = hasMultipleSizes === 'true' || hasMultipleSizes === true;
            
            if (product.hasMultipleSizes) {
                product.size = null; // Clear single size when using variants
                if (sizeVariants) {
                    try {
                        // Parse sizeVariants if it's a JSON string
                        const variants = typeof sizeVariants === 'string' ? JSON.parse(sizeVariants) : sizeVariants;
                        if (Array.isArray(variants)) {
                            product.sizeVariants = variants.map(variant => ({
                                size: variant.size,
                                price: parseFloat(variant.price),
                                stock: parseInt(variant.stock),
                                wholesalePrice: variant.wholesalePrice ? parseFloat(variant.wholesalePrice) : null,
                                wholesaleMinQuantity: variant.wholesaleMinQuantity ? parseInt(variant.wholesaleMinQuantity) : null,
                                averageWeightPerPiece: variant.averageWeightPerPiece ? parseFloat(variant.averageWeightPerPiece) : null
                            }));
                        }
                    } catch (error) {
                        console.error('Error parsing size variants in update:', error);
                    }
                }
            } else {
                product.sizeVariants = []; // Clear variants when not using multiple sizes
                if (size !== undefined) product.size = size;
            }
        } else if (size !== undefined && !product.hasMultipleSizes) {
            product.size = size;
        }
        
        if (productStatus) product.productStatus = productStatus;
        if (wholesaleMinQuantity !== undefined) product.wholesaleMinQuantity = wholesaleMinQuantity ? parseInt(wholesaleMinQuantity) : null;
        if (wholesalePrice !== undefined) product.wholesalePrice = wholesalePrice ? parseFloat(wholesalePrice) : null;
        if (availableDate !== undefined) product.availableDate = availableDate ? new Date(availableDate) : null;
        // productExpiryDate will be recalculated automatically by the pre-save middleware

        // Update validation results if validation was performed
        if (validation) {
            product.validationResults = validation;
            
            // Update soft delete status based on validation
            if (validation.shouldSoftDelete) {
                product.isDeleted = true;
                product.deletedAt = new Date();
                product.deletionReason = validation.deletionReason;
            } else if (!validation.shouldSoftDelete && product.isDeleted && product.deletionReason === 'inappropriate_content') {
                // Re-enable product if it was previously soft deleted for inappropriate content but is now appropriate
                product.isDeleted = false;
                product.deletedAt = null;
                product.deletionReason = null;
            }
        }

        // Process new images if uploaded
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                public_id: file.filename,
                url: file.path
            }));
            product.productimage = [...product.productimage, ...newImages];
        }

        const updatedProduct = await product.save();
        const populatedProduct = await Product.findById(updatedProduct._id).populate('user', 'name email');

        // Return different messages based on validation results
        let message = 'Product updated successfully';
        let warning = null;

        if (validation && validation.shouldSoftDelete) {
            if (validation.deletionReason === 'inappropriate_content') {
                if (!validation.nameValidation.isValid) {
                    message = 'Product updated but hidden because it\'s not related to fruits, vegetables, or seeds';
                    warning = 'Your product has been automatically hidden because the name doesn\'t appear to be related to fruits, vegetables, or seeds. Please update your product name to make it visible.';
                } else {
                    message = 'Product updated but hidden due to inappropriate content';
                    warning = 'Your product has been automatically hidden due to inappropriate content detected in the name or description. Please review and update your product details.';
                }
            }
        } else if (validation && !validation.shouldSoftDelete && product.deletionReason === 'inappropriate_content') {
            message = 'Product updated and is now visible';
            warning = null;
        }

        res.status(200).json({
            success: true,
            data: populatedProduct,
            message,
            warning,
            validation: validation ? {
                nameValidation: validation.nameValidation,
                nameModeration: validation.nameModeration,
                descriptionModeration: validation.descriptionModeration,
                isHidden: validation.shouldSoftDelete,
                reason: validation.deletionReason
            } : null
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating product'
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns the product
        if (product.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        // Delete images from cloudinary
        if (product.productimage && product.productimage.length > 0) {
            for (const image of product.productimage) {
                try {
                    await cloudinary.uploader.destroy(image.public_id);
                } catch (cloudinaryError) {
                    console.warn('Warning: Could not delete image from cloudinary:', cloudinaryError);
                }
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product'
        });
    }
};

// Add rating to product
const addRating = async (req, res) => {
    try {
        const { rating, comment, orderId } = req.body;
        const productId = req.params.id;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // If orderId is provided, check for existing rating for this order
        let existingRating;
        if (orderId) {
            existingRating = product.ratings.find(
                r => r.user.toString() === req.user._id.toString() && 
                     r.orderId && r.orderId.toString() === orderId
            );
        } else {
            // For backward compatibility, check if user already rated without orderId
            existingRating = product.ratings.find(
                r => r.user.toString() === req.user._id.toString() && !r.orderId
            );
        }

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            existingRating.comment = comment || '';
            existingRating.createdAt = new Date();
        } else {
            // Add new rating
            const newRating = {
                user: req.user._id,
                rating,
                comment: comment || '',
                createdAt: new Date()
            };
            
            // Add orderId if provided
            if (orderId) {
                newRating.orderId = orderId;
            }
            
            product.ratings.push(newRating);
        }

        // Calculate new average rating
        const totalRatings = product.ratings.length;
        const sumRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
        
        product.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
        product.totalRatings = totalRatings;

        await product.save();
        
        const populatedProduct = await Product.findById(productId)
            .populate('user', 'name email')
            .populate('ratings.user', 'name');

        res.status(200).json({
            success: true,
            data: populatedProduct,
            message: existingRating ? 'Rating updated successfully' : 'Rating added successfully'
        });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding rating'
        });
    }
};

// Add rating to product from a completed order
const addOrderRating = async (req, res) => {
    try {
        const { rating, comment, orderId } = req.body;
        const productId = req.params.id;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Verify the order exists and belongs to the user and is delivered
        const Order = require('../models/OrderModel');
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            orderStatus: 'delivered'
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or not delivered yet'
            });
        }

        // Verify the product is in this order
        const productInOrder = order.products.find(
            p => p.product.toString() === productId
        );

        if (!productInOrder) {
            return res.status(400).json({
                success: false,
                message: 'Product not found in this order'
            });
        }

        // Check if user already rated this product for this specific order
        const existingRating = product.ratings.find(
            r => r.user.toString() === req.user._id.toString() && 
                 r.orderId.toString() === orderId
        );

        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: 'You have already rated this product for this order'
            });
        }

        // Add new rating
        product.ratings.push({
            user: req.user._id,
            orderId: orderId,
            rating,
            comment: comment || '',
            createdAt: new Date()
        });

        // Calculate new average rating
        const totalRatings = product.ratings.length;
        const sumRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
        
        product.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
        product.totalRatings = totalRatings;

        await product.save();
        
        const populatedProduct = await Product.findById(productId)
            .populate('user', 'name email')
            .populate('ratings.user', 'name')
            .populate('ratings.orderId', '_id');

        res.status(200).json({
            success: true,
            data: populatedProduct,
            message: 'Rating added successfully'
        });
    } catch (error) {
        console.error('Error adding order rating:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding rating'
        });
    }
};

// Get seller statistics
const getSellerStats = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;

        // Get all products by this seller
        const products = await Product.find({ user: sellerId });

        if (products.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalProducts: 0,
                    averageRating: 0,
                    totalRatings: 0,
                    totalSold: 0
                }
            });
        }

        // Calculate statistics
        const totalProducts = products.length;
        const totalSold = products.reduce((sum, product) => sum + (product.totalSold || 0), 0);
        
        // Calculate overall rating across all products
        let totalRatingSum = 0;
        let totalRatingCount = 0;
        
        products.forEach(product => {
            if (product.ratings && product.ratings.length > 0) {
                product.ratings.forEach(rating => {
                    totalRatingSum += rating.rating;
                    totalRatingCount++;
                });
            }
        });

        const averageRating = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                totalRatings: totalRatingCount,
                totalSold
            }
        });
    } catch (error) {
        console.error('Error fetching seller stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching seller statistics'
        });
    }
};

// Check if products in an order have been rated by the user
const checkOrderProductRatings = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order and populate products
        const Order = require('../models/OrderModel');
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            orderStatus: 'delivered'
        }).populate('products.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or not delivered yet'
            });
        }

        // Check rating status for each product in the order
        const productRatingStatus = [];

        for (const orderProduct of order.products) {
            const product = await Product.findById(orderProduct.product._id);
            
            const hasRated = product.ratings.some(
                r => r.user.toString() === req.user._id.toString() && 
                     r.orderId.toString() === orderId
            );

            productRatingStatus.push({
                productId: orderProduct.product._id,
                productName: orderProduct.product.productName,
                hasRated: hasRated,
                quantity: orderProduct.quantity,
                selectedSize: orderProduct.selectedSize
            });
        }

        res.status(200).json({
            success: true,
            data: {
                orderId: orderId,
                products: productRatingStatus
            }
        });
    } catch (error) {
        console.error('Error checking order product ratings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking rating status'
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addRating,
    addOrderRating,
    checkOrderProductRatings,
    getSellerStats
};
