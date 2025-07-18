const Product = require('../models/ProductModel');

// Function to soft delete expired products
const softDeleteExpiredProducts = async () => {
    try {
        const currentDate = new Date();
        
        // Find products that are expired but not deleted yet
        const expiredProducts = await Product.find({
            productExpiryDate: { $lt: currentDate },
            isDeleted: false
        });

        if (expiredProducts.length > 0) {
            // Update expired products to mark them as soft deleted
            const result = await Product.updateMany(
                {
                    productExpiryDate: { $lt: currentDate },
                    isDeleted: false
                },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: currentDate,
                        deletionReason: 'expired'
                    }
                }
            );

            console.log(`Soft deleted ${result.modifiedCount} expired products`);
            return result.modifiedCount;
        }

        return 0;
    } catch (error) {
        console.error('Error soft deleting expired products:', error);
        throw error;
    }
};

// Function to check if a product is expired
const isProductExpired = (product) => {
    return new Date(product.productExpiryDate) < new Date();
};

module.exports = {
    softDeleteExpiredProducts,
    isProductExpired
};
