const mongoose = require('mongoose');

// Admin Analytics Schema for storing aggregated data
const AnalyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  data: {
    // Sales Data
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    
    // Product Data
    totalProducts: {
      type: Number,
      default: 0
    },
    activeProducts: {
      type: Number,
      default: 0
    },
    expiredProducts: {
      type: Number,
      default: 0
    },
    lowStockProducts: {
      type: Number,
      default: 0
    },
    
    // User Data
    totalUsers: {
      type: Number,
      default: 0
    },
    newUsers: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    
    // Category breakdown
    categoryData: [{
      category: String,
      revenue: Number,
      orders: Number,
      products: Number
    }],
    
    // Order status breakdown
    orderStatusData: [{
      status: String,
      count: Number,
      percentage: Number
    }],
    
    // Payment method breakdown
    paymentMethodData: [{
      method: String,
      count: Number,
      revenue: Number,
      percentage: Number
    }],
    
    // Top selling products
    topProducts: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      productName: String,
      totalSold: Number,
      revenue: Number
    }],
    
    // Customer insights
    customerData: {
      newCustomers: Number,
      returningCustomers: Number,
      customerRetentionRate: Number
    },
    
    // Geographic data
    regionData: [{
      city: String,
      orders: Number,
      revenue: Number
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
AnalyticsSchema.index({ type: 1, date: 1 }, { unique: true });

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

module.exports = Analytics;
