const express = require('express');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');
const {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getOrderAnalytics,
  updateOrderStatus,
  getAllOrders,
  getAllProducts,
  getAllUsers
} = require('../controllers/adminController');

const router = express.Router();

// Apply authentication and admin authorization to all admin routes
router.use(authenticateUser);
router.use(authorizeAdmin);

// Dashboard overview
router.get('/dashboard/stats', getDashboardStats);

// Analytics endpoints
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/products', getProductAnalytics);
router.get('/analytics/customers', getCustomerAnalytics);
router.get('/analytics/orders', getOrderAnalytics);

// Enhanced admin routes
router.get('/admin/orders', getAllOrders);
router.put('/admin/orders/:orderId/status', updateOrderStatus);
router.get('/admin/products', getAllProducts);
router.get('/admin/users', getAllUsers);

// Legacy routes for backward compatibility
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.delete('/users/:id', userController.deleteUser);

// Use admin controller for orders since orderController.getAllOrders doesn't exist
router.get('/orders', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

router.get('/products', productController.getAllProducts);
router.delete('/products/:id', productController.deleteProduct);

// Admin statistics routes
router.get('/stats/dashboard', async (req, res) => {
    try {
        // This would contain dashboard statistics logic
        res.json({
            success: true,
            data: {
                totalUsers: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalRevenue: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

// Admin financial overview
router.get('/financial-overview', async (req, res) => {
    try {
        const Order = require('../models/OrderModel');
        const User = require('../models/UserModel');
        
        const ADMIN_ID = '686fcb79c45728d5cd379585';
        
        // Get admin wallet balance
        const admin = await User.findById(ADMIN_ID).select('defaultWallet');
        
        // Get payment statistics
        const totalOrders = await Order.countDocuments();
        const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
        const pendingPayments = await Order.countDocuments({ 
            paymentStatus: 'pending',
            orderStatus: { $ne: 'cancelled' }
        });
        
        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        
        // Get pending COD payments
        const pendingCODPayments = await Order.aggregate([
            { 
                $match: { 
                    'paymentMethod.type': 'cod',
                    paymentStatus: 'pending',
                    orderStatus: { $ne: 'cancelled' }
                }
            },
            { $group: { _id: null, totalPending: { $sum: '$totalAmount' } } }
        ]);
        
        const totalPendingCOD = pendingCODPayments.length > 0 ? pendingCODPayments[0].totalPending : 0;
        
        res.json({
            success: true,
            data: {
                adminWalletBalance: admin ? admin.defaultWallet : 0,
                totalOrders,
                paidOrders,
                pendingPayments,
                totalRevenue,
                totalPendingCOD,
                paymentBreakdown: {
                    ewalletPayments: totalRevenue - totalPendingCOD,
                    codPayments: totalRevenue,
                    pendingCOD: totalPendingCOD
                }
            }
        });
    } catch (error) {
        console.error('Financial overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial overview'
        });
    }
});

// Get payment transactions
router.get('/payment-transactions', async (req, res) => {
    try {
        const Order = require('../models/OrderModel');
        
        const transactions = await Order.find({ paymentProcessed: true })
            .populate('user', 'name email')
            .populate('products.product', 'productName')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Payment transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment transactions'
        });
    }
});

module.exports = router;
