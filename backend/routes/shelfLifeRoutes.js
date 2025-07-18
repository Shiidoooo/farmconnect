const express = require('express');
const router = express.Router();
const shelfLifeController = require('../controllers/shelfLifeController');
const auth = require('../middleware/auth');

// Public routes
router.post('/predict', shelfLifeController.predictShelfLife);
router.get('/products', shelfLifeController.getAvailableProducts);
router.get('/search', shelfLifeController.searchProducts);

// Protected routes (require authentication)
router.get('/expiring', auth, shelfLifeController.getExpiringProducts);
router.put('/update/:productId', auth, shelfLifeController.updateProductExpiryDate);

module.exports = router;
