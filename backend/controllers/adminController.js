const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const Analytics = require('../models/AnalyticsModel');
const mongoose = require('mongoose');

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for better performance
    const [
      totalSales,
      totalOrders,
      deliveredOrders,
      totalUsers,
      totalProducts,
      todaySales,
      todayOrders,
      weeklySales,
      monthlySales,
      recentOrders,
      lowStockProducts,
      expiredProducts
    ] = await Promise.all([
      // Total sales from delivered orders only
      Order.aggregate([
        { $match: { orderStatus: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Total orders (all statuses)
      Order.countDocuments(),
      
      // Delivered orders count
      Order.countDocuments({ orderStatus: 'delivered' }),
      
      // Total users
      User.countDocuments(),
      
      // Total products
      Product.countDocuments({ isDeleted: { $ne: true } }),
      
      // Today's sales from delivered orders only
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startOfDay },
            orderStatus: 'delivered'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Today's orders (all statuses)
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      
      // Weekly sales from delivered orders only
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: sevenDaysAgo },
            orderStatus: 'delivered'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Monthly sales from delivered orders only
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: thirtyDaysAgo },
            orderStatus: 'delivered'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Recent orders
      Order.find()
        .populate('user', 'name email')
        .populate('products.product', 'productName')
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Low stock products
      Product.find({ 
        productStock: { $lt: 10 },
        isDeleted: { $ne: true }
      }).limit(5),
      
      // Expired products
      Product.find({
        expiryDate: { $lt: today },
        isDeleted: { $ne: true }
      }).limit(5)
    ]);

    const totalSalesAmount = totalSales[0]?.total || 0;
    const todaySalesAmount = todaySales[0]?.total || 0;
    const weeklySalesAmount = weeklySales[0]?.total || 0;
    const monthlySalesAmount = monthlySales[0]?.total || 0;

    // Calculate 2% commission (platform revenue)
    const totalRevenue = totalSalesAmount * 0.02;
    const todayRevenue = todaySalesAmount * 0.02;
    const weeklyRevenue = weeklySalesAmount * 0.02;
    const monthlyRevenue = monthlySalesAmount * 0.02;

    const stats = {
      // Sales metrics (total customer spending)
      totalSales: totalSalesAmount,
      todaySales: todaySalesAmount,
      weeklySales: weeklySalesAmount,
      monthlySales: monthlySalesAmount,
      
      // Revenue metrics (2% commission)
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      
      // Order metrics
      totalOrders,
      deliveredOrders,
      todayOrders,
      
      // Other metrics
      totalUsers,
      totalProducts,
      recentOrders,
      lowStockProducts,
      expiredProducts,
      averageOrderValue: deliveredOrders > 0 ? totalSalesAmount / deliveredOrders : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      dateFilter = { createdAt: { $gte: twelveMonthsAgo } };
    }

    // Determine grouping based on period
    let groupFormat;
    switch (period) {
      case 'daily':
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case 'weekly':
        groupFormat = { $dateToString: { format: "%Y-W%U", date: "$createdAt" } };
        break;
      case 'yearly':
        groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
      default: // monthly
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }

    const salesData = await Order.aggregate([
      { $match: { ...dateFilter, orderStatus: 'delivered' } },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ message: 'Error fetching sales analytics' });
  }
};

// Get product analytics
const getProductAnalytics = async (req, res) => {
  try {
    const [
      categoryStats,
      topSellingProducts,
      stockStats,
      expiryStats
    ] = await Promise.all([
      // Category performance
      Order.aggregate([
        { $match: { orderStatus: { $in: ['delivered', 'confirmed'] } } },
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
      
      // Top selling products
      Order.aggregate([
        { $match: { orderStatus: { $in: ['delivered', 'confirmed'] } } },
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
      
      // Stock statistics
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
            },
            outOfStock: {
              $sum: {
                $cond: [{ $eq: ['$productStock', 0] }, 1, 0]
              }
            }
          }
        }
      ]),
      
      // Expiry statistics
      Product.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            expiredProducts: {
              $sum: {
                $cond: [{ $lt: ['$expiryDate', new Date()] }, 1, 0]
              }
            },
            expiringSoon: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$expiryDate', new Date()] },
                      { $lte: ['$expiryDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    res.json({
      categories: categoryStats,
      topProducts: topSellingProducts,
      stockStats: stockStats[0] || {},
      expiryStats: expiryStats[0] || {}
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({ message: 'Error fetching product analytics' });
  }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      totalCustomers,
      newCustomers,
      returningCustomers,
      customerOrderStats,
      geographicData
    ] = await Promise.all([
      // Total customers
      User.countDocuments(),
      
      // New customers (last 30 days)
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      
      // Returning customers (customers with more than 1 order)
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
      
      // Customer order statistics
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
      
      // Geographic distribution
      Order.aggregate([
        {
          $group: {
            _id: '$shipping.address.city',
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { orders: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      totalCustomers,
      newCustomers,
      returningCustomers: returningCustomers[0]?.returningCustomers || 0,
      customerOrderStats: customerOrderStats[0] || {},
      geographicData
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ message: 'Error fetching customer analytics' });
  }
};

// Get order analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const [
      orderStatusDistribution,
      paymentMethodDistribution,
      orderTrends,
      averageDeliveryTime
    ] = await Promise.all([
      // Order status distribution
      Order.aggregate([
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Payment method distribution
      Order.aggregate([
        {
          $group: {
            _id: '$paymentMethod.type',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Order trends (last 30 days)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Average delivery time (for delivered orders)
      Order.aggregate([
        {
          $match: {
            orderStatus: 'delivered',
            deliveryDate: { $exists: true }
          }
        },
        {
          $project: {
            deliveryTime: {
              $divide: [
                { $subtract: ['$deliveryDate', '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageDeliveryTime: { $avg: '$deliveryTime' }
          }
        }
      ])
    ]);

    res.json({
      orderStatusDistribution,
      paymentMethodDistribution,
      orderTrends,
      averageDeliveryTime: averageDeliveryTime[0]?.averageDeliveryTime || 0
    });
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({ message: 'Error fetching order analytics' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'to deliver', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        orderStatus: status,
        status: status,
        ...(status === 'delivered' && { deliveryDate: new Date() })
      },
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('products.product', 'productName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// Get all orders with pagination and filters
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = {};

    // Status filter
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Search filter (by user name or order ID)
    if (search) {
      filter.$or = [
        { _id: mongoose.Types.ObjectId.isValid(search) ? search : null },
        { 'shipping.address.fullName': { $regex: search, $options: 'i' } }
      ].filter(Boolean);
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('products.product', 'productName productCategory')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      orders,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / limit),
      hasNextPage: page * limit < totalOrders,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get all products with pagination and filters
const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = { isDeleted: { $ne: true } };

    // Category filter
    if (category && category !== 'all') {
      filter.productCategory = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate('user', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      totalProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: page * limit < totalProducts,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get all users with pagination and filters
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      totalUsers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page * limit < totalUsers,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getOrderAnalytics,
  updateOrderStatus,
  getAllOrders,
  getAllProducts,
  getAllUsers
};
