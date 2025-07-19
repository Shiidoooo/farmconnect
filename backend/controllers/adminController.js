const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const Analytics = require('../models/AnalyticsModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for better performance
    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      todayRevenue,
      todayOrders,
      weeklyRevenue,
      monthlyRevenue,
      recentOrders,
      lowStockProducts,
      expiredProducts
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { orderStatus: { $in: ['delivered', 'confirmed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Total orders
      Order.countDocuments(),
      
      // Total users
      User.countDocuments(),
      
      // Total products
      Product.countDocuments({ isDeleted: { $ne: true } }),
      
      // Today's revenue
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startOfDay },
            orderStatus: { $in: ['delivered', 'confirmed'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Today's orders
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      
      // Weekly revenue
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: sevenDaysAgo },
            orderStatus: { $in: ['delivered', 'confirmed'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Monthly revenue
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: thirtyDaysAgo },
            orderStatus: { $in: ['delivered', 'confirmed'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Recent orders
      Order.find()
        .populate('user', 'firstName lastName email')
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

    const stats = {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      todayRevenue: todayRevenue[0]?.total || 0,
      todayOrders,
      weeklyRevenue: weeklyRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      recentOrders,
      lowStockProducts,
      expiredProducts,
      averageOrderValue: totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0
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
      { $match: { ...dateFilter, orderStatus: { $in: ['delivered', 'confirmed'] } } },
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
        .populate('user', 'firstName lastName email')
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

// Product Management Functions

// Get all products with seller information
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build filter
    const filter = { isDeleted: { $ne: true } };
    
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productDescription: { $regex: search, $options: 'i' } },
        { productCategory: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.productCategory = category;
    }

    if (status) {
      if (status === 'active') {
        filter.productStock = { $gt: 0 };
      } else if (status === 'out_of_stock') {
        filter.productStock = { $lte: 0 };
      } else if (status === 'low_stock') {
        filter.productStock = { $gt: 0, $lte: 10 };
      }
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate('user', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    // Transform the data to match frontend expectations
    const transformedProducts = products.map(product => ({
      _id: product._id,
      productName: product.productName,
      description: product.productDescription,
      category: product.productCategory,
      price: product.productPrice,
      stockQuantity: product.productStock,
      isActive: product.productStock > 0, // Consider product active if in stock
      imageUrl: product.productimage?.[0]?.url || null,
      seller: product.user, // The user field represents the seller
      createdAt: product.createdAt,
      updatedAt: product.updatedAt || product.createdAt
    }));

    res.json({
      products: transformedProducts,
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

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('ratings.user', 'firstName lastName');

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Transform the data to match frontend expectations
    const transformedProduct = {
      _id: product._id,
      productName: product.productName,
      description: product.productDescription,
      category: product.productCategory,
      price: product.productPrice,
      stockQuantity: product.productStock,
      isActive: product.productStock > 0,
      imageUrl: product.productimage?.[0]?.url || null,
      seller: product.user,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt || product.createdAt,
      ratings: product.ratings,
      averageRating: product.averageRating,
      totalRatings: product.totalRatings
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Update product status (active/inactive)
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active or inactive' });
    }

    const product = await Product.findById(id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // For this model, we'll set stock to 0 for inactive and restore previous stock for active
    // You might want to store the original stock separately in a real application
    const updateData = {
      productStock: status === 'active' ? (product.productStock || 1) : 0,
      updatedAt: new Date()
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'firstName lastName email');

    // Transform the response
    const transformedProduct = {
      _id: updatedProduct._id,
      productName: updatedProduct.productName,
      description: updatedProduct.productDescription,
      category: updatedProduct.productCategory,
      price: updatedProduct.productPrice,
      stockQuantity: updatedProduct.productStock,
      isActive: updatedProduct.productStock > 0,
      imageUrl: updatedProduct.productimage?.[0]?.url || null,
      seller: updatedProduct.user,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    };

    res.json({
      message: 'Product status updated successfully',
      product: transformedProduct
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'Error updating product status' });
  }
};

// Update product details
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove fields that shouldn't be updated via this endpoint
    delete updates._id;
    delete updates.seller;
    delete updates.createdAt;
    delete updates.isDeleted;

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller', 'firstName lastName email');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Soft delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete by marking as deleted
    await Product.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date()
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Get product statistics for dashboard
const getProductStats = async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      inactiveProducts,
      categoriesStats
    ] = await Promise.all([
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ isDeleted: { $ne: true }, productStock: { $gt: 0 } }),
      Product.countDocuments({ isDeleted: { $ne: true }, productStock: { $lte: 0 } }),
      Product.countDocuments({ isDeleted: { $ne: true }, productStock: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ isDeleted: { $ne: true }, productStock: { $lte: 0 } }), // Using out of stock as inactive
      Product.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$productCategory', count: { $sum: 1 }, totalStock: { $sum: '$productStock' } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      inactiveProducts,
      categoriesStats
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ message: 'Error fetching product stats' });
  }
};

// ====== USER MANAGEMENT FUNCTIONS ======

// Get all users with advanced filtering and pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build search query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.accountStatus = status;
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with populated product data for seller classification
    const users = await User.find(query)
      .select('name email phone address accountStatus createdAt updatedAt lastLoginAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Enhance users with additional data
    const enhancedUsers = await Promise.all(users.map(async (user) => {
      // Get user's product count to determine if seller
      const productCount = await Product.countDocuments({ 
        seller: user._id,
        isDeleted: { $ne: true }
      });
      
      // Get user's order statistics
      const orderStats = await Order.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };
      
      return {
        ...user,
        userType: productCount > 0 ? 'Seller' : 'Customer',
        productCount,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        joinDate: user.createdAt,
        lastLogin: user.lastLoginAt || user.updatedAt
      };
    }));
    
    // Apply type filter after enhancement
    let filteredUsers = enhancedUsers;
    if (type) {
      filteredUsers = enhancedUsers.filter(user => 
        user.userType.toLowerCase() === type.toLowerCase()
      );
    }
    
    res.json({
      success: true,
      data: filteredUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersThisMonth,
      customerCount,
      sellerCount
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Active users
      User.countDocuments({ accountStatus: 'active' }),
      
      // Suspended users
      User.countDocuments({ accountStatus: 'suspended' }),
      
      // New users this month
      User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      }),
      
      // Customer count (users with no products)
      User.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'seller',
            as: 'products'
          }
        },
        {
          $match: {
            $or: [
              { products: { $size: 0 } },
              { 'products.isDeleted': true }
            ]
          }
        },
        { $count: "count" }
      ]).then(result => result[0]?.count || 0),
      
      // Seller count (users with products)
      User.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'seller',
            as: 'products'
          }
        },
        {
          $match: {
            products: { $ne: [] },
            'products.isDeleted': { $ne: true }
          }
        },
        { $count: "count" }
      ]).then(result => result[0]?.count || 0)
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        newUsersThisMonth,
        customerCount,
        sellerCount
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

// Get user by ID with detailed information
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const user = await User.findById(id)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's products for seller info
    const products = await Product.find({ 
      seller: id,
      isDeleted: { $ne: true }
    }).select('name price category stockQuantity');
    
    // Get user's order history
    const orders = await Order.find({ user: id })
      .populate('items.product', 'name price')
      .select('orderNumber totalAmount orderStatus createdAt deliveryAddress')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate user statistics
    const orderStats = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, completedOrders: 0 };
    
    // Enhanced user data
    const enhancedUser = {
      ...user,
      userType: products.length > 0 ? 'Seller' : 'Customer',
      productCount: products.length,
      products: products,
      recentOrders: orders,
      statistics: {
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        completedOrders: stats.completedOrders,
        averageOrderValue: stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0
      }
    };
    
    res.json({
      success: true,
      data: enhancedUser
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// Update user status (activate/suspend)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "suspended"'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { 
        accountStatus: status,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    // Check if user has active orders
    const activeOrders = await Order.countDocuments({
      user: id,
      orderStatus: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    });
    
    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active orders. Please wait for orders to complete or cancel them first.'
      });
    }
    
    // Soft delete user
    const user = await User.findByIdAndUpdate(
      id,
      { 
        accountStatus: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Also soft delete user's products
    await Product.updateMany(
      { seller: id },
      { 
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    );
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Update user information
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    
    // Add update timestamp
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Create new user (Admin function)
const createUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      userType = 'user',
      accountStatus = 'active',
      address,
      dateOfBirth,
      gender 
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Required fields validation based on current User model
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required'
      });
    }

    if (!gender) {
      return res.status(400).json({
        success: false,
        message: 'Gender is required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Convert address object to string if it's an object
    let addressString = address;
    if (typeof address === 'object' && address !== null) {
      const { street, city, province, zipCode } = address;
      addressString = [street, city, province, zipCode].filter(Boolean).join(', ');
    }

    // Create user data object matching the current User model
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone_number: phone.trim(), // Note: model uses phone_number, not phone
      address: addressString || 'Address not provided',
      role: userType === 'admin' ? 'admin' : 'user', // Convert userType to role
      dateOfBirth: new Date(dateOfBirth),
      gender: gender,
      createdAt: new Date()
    };

    // Create new user
    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key error (shouldn't happen due to pre-check, but just in case)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
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
};
