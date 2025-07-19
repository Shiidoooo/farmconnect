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
  getProductById,
  updateProductStatus,
  updateProduct,
  deleteProduct,
  getProductStats,
  getAllUsers,
  getUserStats,
  getUserById,
  updateUserStatus,
  deleteUser,
  updateUser,
  createUser
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

// Order management routes
router.get('/orders', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// Product management routes
router.get('/products', getAllProducts);
router.get('/products/stats', getProductStats);
router.get('/products/:id', getProductById);
router.put('/products/:id/status', updateProductStatus);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Legacy routes for backward compatibility
router.get('/legacy/users', userController.getAllUsers);
router.get('/legacy/users/:id', userController.getUserById);
router.delete('/legacy/users/:id', userController.deleteUser);

module.exports = router;
