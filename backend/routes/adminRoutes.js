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
router.get('/analytics', async (req, res) => {
    try {
        const Order = require('../models/OrderModel');
        const Product = require('../models/ProductModel');
        const User = require('../models/UserModel');
        
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get comprehensive analytics data
        const [
            // Overview Stats - Sales and Revenue
            totalSales,
            totalOrders,
            deliveredOrders,
            totalUsers,
            totalProducts,
            todaySales,
            todayOrders,
            monthlySales,
            
            // Product Analytics
            categoryStats,
            topSellingProducts,
            stockStats,
            
            // Customer Analytics
            newCustomers,
            returningCustomers,
            customerOrderStats,
            
            // Order Analytics
            orderStatusDistribution,
            paymentMethodDistribution,
            recentOrders
        ] = await Promise.all([
            // Overview queries - only delivered orders for sales/revenue
            Order.aggregate([
                { $match: { orderStatus: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.countDocuments(),
            Order.countDocuments({ orderStatus: 'delivered' }),
            User.countDocuments(),
            Product.countDocuments({ isDeleted: { $ne: true } }),
            Order.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: startOfDay },
                        orderStatus: 'delivered'
                    }
                },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.countDocuments({ createdAt: { $gte: startOfDay } }),
            Order.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: thirtyDaysAgo },
                        orderStatus: 'delivered'
                    }
                },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            
            // Product Analytics - only delivered orders
            Order.aggregate([
                { $match: { orderStatus: 'delivered' } },
                { $unwind: '$products' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'products.product',
                        foreignField: '_id',
                        as: 'productData'
                    }
                },
                { $unwind: '$productData' },
                {
                    $group: {
                        _id: '$productData.productCategory',
                        revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
                        orders: { $sum: 1 },
                        totalQuantity: { $sum: '$products.quantity' }
                    }
                },
                { $sort: { revenue: -1 } }
            ]),
            Order.aggregate([
                { $match: { orderStatus: 'delivered' } },
                { $unwind: '$products' },
                {
                    $group: {
                        _id: '$products.product',
                        totalSold: { $sum: '$products.quantity' },
                        revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productData'
                    }
                },
                { $unwind: '$productData' },
                {
                    $project: {
                        productName: '$productData.productName',
                        totalSold: 1,
                        revenue: 1
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 }
            ]),
            Product.aggregate([
                { $match: { isDeleted: { $ne: true } } },
                {
                    $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        averageStock: { $avg: '$productStock' },
                        lowStock: {
                            $sum: {
                                $cond: [{ $lt: ['$productStock', 10] }, 1, 0]
                            }
                        }
                    }
                }
            ]),
            
            // Customer Analytics
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Order.aggregate([
                {
                    $group: {
                        _id: '$user',
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $match: { orderCount: { $gt: 1 } }
                },
                {
                    $count: 'returningCustomers'
                }
            ]),
            Order.aggregate([
                {
                    $group: {
                        _id: '$user',
                        totalOrders: { $sum: 1 },
                        totalSpent: { $sum: '$totalAmount' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageOrdersPerCustomer: { $avg: '$totalOrders' },
                        averageSpentPerCustomer: { $avg: '$totalSpent' }
                    }
                }
            ]),
            
            // Order Analytics
            Order.aggregate([
                {
                    $group: {
                        _id: '$orderStatus',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Order.aggregate([
                {
                    $group: {
                        _id: '$paymentMethod.type',
                        count: { $sum: 1 },
                        revenue: { $sum: '$totalAmount' }
                    }
                }
            ]),
            Order.find()
                .populate('user', 'firstName lastName email')
                .populate('products.product', 'productName')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        // Calculate key metrics
        const totalSalesAmount = totalSales[0]?.total || 0;
        const todaySalesAmount = todaySales[0]?.total || 0;
        const monthlySalesAmount = monthlySales[0]?.total || 0;
        
        // Calculate 2% commission (platform revenue)
        const totalRevenueAmount = totalSalesAmount * 0.02;
        const todayRevenueAmount = todaySalesAmount * 0.02;
        const monthlyRevenueAmount = monthlySalesAmount * 0.02;

        const overviewStats = {
            // Sales metrics (total customer spending from delivered orders)
            totalSales: totalSalesAmount,
            todaySales: todaySalesAmount,
            monthlySales: monthlySalesAmount,
            
            // Revenue metrics (2% commission from delivered orders)
            totalRevenue: totalRevenueAmount,
            todayRevenue: todayRevenueAmount,
            monthlyRevenue: monthlyRevenueAmount,
            
            // Order metrics
            totalOrders,
            deliveredOrders,
            todayOrders,
            
            // Other metrics
            totalUsers,
            totalProducts,
            averageOrderValue: deliveredOrders > 0 ? totalSalesAmount / deliveredOrders : 0
        };

        // Calculate growth rates (basic example)
        const revenueGrowth = overviewStats.monthlyRevenue > 0 ? 
            ((overviewStats.todayRevenue * 30 - overviewStats.monthlyRevenue) / overviewStats.monthlyRevenue * 100) : 0;
        
        const customerGrowth = totalUsers > 0 ? (newCustomers / totalUsers * 100) : 0;

        // Prepare stock data for StockStatusChart
        const stockInfo = stockStats[0] || { totalProducts: 0, averageStock: 0, lowStock: 0 };
        const stockData = {
            totalProducts: stockInfo.totalProducts,
            inStock: stockInfo.totalProducts - stockInfo.lowStock,
            lowStock: stockInfo.lowStock,
            outOfStock: Math.max(0, stockInfo.totalProducts - stockInfo.inStock - stockInfo.lowStock),
            stockCategories: categoryStats.slice(0, 3).map(cat => ({
                name: cat._id,
                inStock: Math.floor(cat.totalQuantity * 0.7),
                lowStock: Math.floor(cat.totalQuantity * 0.2),
                outOfStock: Math.floor(cat.totalQuantity * 0.1)
            }))
        };

        // Format analytics data for frontend
        const analyticsData = {
            overview: {
                // Sales metrics (customer spending from delivered orders)
                totalSales: overviewStats.totalSales,
                todaySales: overviewStats.todaySales,
                monthlySales: overviewStats.monthlySales,
                
                // Revenue metrics (2% commission from delivered orders)
                totalRevenue: overviewStats.totalRevenue,
                todayRevenue: overviewStats.todayRevenue,
                monthlyRevenue: overviewStats.monthlyRevenue,
                
                // Order metrics
                totalOrders: overviewStats.totalOrders,
                deliveredOrders: overviewStats.deliveredOrders,
                todayOrders: overviewStats.todayOrders,
                
                // Other metrics
                totalUsers: overviewStats.totalUsers,
                totalProducts: overviewStats.totalProducts,
                averageOrderValue: overviewStats.averageOrderValue,
                revenueGrowth: revenueGrowth.toFixed(1),
                customerGrowth: customerGrowth.toFixed(1)
            },
            categories: categoryStats,
            topProducts: topSellingProducts,
            stockInfo: stockData,
            customerData: {
                totalCustomers: totalUsers,
                newCustomers,
                returningCustomers: returningCustomers[0]?.returningCustomers || 0,
                averageOrdersPerCustomer: customerOrderStats[0]?.averageOrdersPerCustomer || 0,
                averageSpentPerCustomer: customerOrderStats[0]?.averageSpentPerCustomer || 0
            },
            orderDistribution: orderStatusDistribution,
            paymentMethods: paymentMethodDistribution,
            recentOrders: recentOrders.slice(0, 5),
            lastUpdated: new Date()
        };

        res.json({
            success: true,
            data: analyticsData
        });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics data',
            error: error.message
        });
    }
});
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/products', getProductAnalytics);
router.get('/analytics/customers', getCustomerAnalytics);
router.get('/analytics/orders', getOrderAnalytics);

// Enhanced admin routes
router.get('/orders', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatus);
router.get('/products', getAllProducts);
router.get('/users', getAllUsers);

// Legacy routes for backward compatibility - remove duplicates
// router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.delete('/users/:id', userController.deleteUser);

// Use admin controller for orders since orderController.getAllOrders doesn't exist
// router.get('/orders', getAllOrders);  // Already defined above
// router.put('/orders/:orderId/status', updateOrderStatus);  // Already defined above

// Remove conflicting routes - use the admin controller routes instead
// router.get('/products', productController.getAllProducts);  // Conflicts with admin route above
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
