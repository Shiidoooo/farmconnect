const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    updateOrderStatus,
    getSellerOrders,
    confirmOrderReceived,
    getDeliveryEstimate
} = require('../controllers/orderController');

// Create new order
router.post('/', authenticateUser, createOrder);

// Get delivery estimate
router.post('/delivery-estimate', authenticateUser, getDeliveryEstimate);

// Get user's orders
router.get('/my-orders', authenticateUser, getUserOrders);

// Get seller's orders (orders containing seller's products)
router.get('/seller', authenticateUser, getSellerOrders);

// Get single order by ID
router.get('/:orderId', authenticateUser, getOrderById);

// Update order status
router.put('/:orderId/status', authenticateUser, updateOrderStatus);

// Customer confirms receipt of order
router.put('/:orderId/confirm-received', authenticateUser, confirmOrderReceived);

module.exports = router;
