const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/seller/:sellerId/stats', productController.getSellerStats);
router.get('/:id', productController.getProductById);

// Protected routes (require authentication)
router.use(authenticateUser);

// User's own products
router.get('/user/my-products', productController.getMyProducts);

// Create product with image upload
router.post('/', upload.array('productimage', 5), productController.createProduct);

// Update product with optional image upload
router.put('/:id', upload.array('productimage', 5), productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

// Add rating to product
router.post('/:id/rating', productController.addRating);

module.exports = router;
