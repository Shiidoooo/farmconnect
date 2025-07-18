const ShelfLifePredictor = require('../utils/shelfLifePredictor');
const Product = require('../models/ProductModel');

const predictor = new ShelfLifePredictor();

const shelfLifeController = {
    // Predict shelf life for a product
    predictShelfLife: async (req, res) => {
        try {
            const { productName, harvestDate, storageLocation } = req.body;

            if (!productName || !harvestDate || !storageLocation) {
                return res.status(400).json({
                    success: false,
                    message: 'Product name, harvest date, and storage location are required'
                });
            }

            const prediction = predictor.predictExpiryDate(productName, harvestDate, storageLocation);

            res.status(200).json({
                success: true,
                prediction: prediction
            });
        } catch (error) {
            console.error('Error predicting shelf life:', error);
            res.status(500).json({
                success: false,
                message: 'Error predicting shelf life',
                error: error.message
            });
        }
    },

    // Get all available products in shelf life database
    getAvailableProducts: async (req, res) => {
        try {
            const products = predictor.getAllProducts();
            
            res.status(200).json({
                success: true,
                totalProducts: products.length,
                products: products
            });
        } catch (error) {
            console.error('Error getting available products:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting available products',
                error: error.message
            });
        }
    },

    // Search products in shelf life database
    searchProducts: async (req, res) => {
        try {
            const { query } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const results = predictor.searchProducts(query);

            res.status(200).json({
                success: true,
                query: query,
                results: results
            });
        } catch (error) {
            console.error('Error searching products:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching products',
                error: error.message
            });
        }
    },

    // Get user's products that are expiring soon
    getExpiringProducts: async (req, res) => {
        try {
            const userId = req.user.id;
            const { days = 3 } = req.query; // Default to 3 days

            const currentDate = new Date();
            const futureDate = new Date();
            futureDate.setDate(currentDate.getDate() + parseInt(days));

            const expiringProducts = await Product.find({
                user: userId,
                isDeleted: false,
                productExpiryDate: {
                    $gte: currentDate,
                    $lte: futureDate
                }
            }).select('productName productExpiryDate harvestDate storageLocation')
              .sort({ productExpiryDate: 1 });

            res.status(200).json({
                success: true,
                days: parseInt(days),
                count: expiringProducts.length,
                products: expiringProducts
            });
        } catch (error) {
            console.error('Error getting expiring products:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting expiring products',
                error: error.message
            });
        }
    },

    // Update expiry date for existing product
    updateProductExpiryDate: async (req, res) => {
        try {
            const { productId } = req.params;
            const userId = req.user.id;

            const product = await Product.findOne({
                _id: productId,
                user: userId,
                isDeleted: false
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            await product.recalculateExpiryDate();

            res.status(200).json({
                success: true,
                message: 'Product expiry date updated successfully',
                product: {
                    id: product._id,
                    productName: product.productName,
                    harvestDate: product.harvestDate,
                    storageLocation: product.storageLocation,
                    productExpiryDate: product.productExpiryDate
                }
            });
        } catch (error) {
            console.error('Error updating product expiry date:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating product expiry date',
                error: error.message
            });
        }
    }
};

module.exports = shelfLifeController;