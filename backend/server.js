const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();
const connectDB = require('./config/database');
const { softDeleteExpiredProducts } = require('./utils/productUtils');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoute');
const orderRoutes = require('./routes/orderRoutes');
const forumRoutes = require('./routes/forumRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();

// CORS middleware - must be first
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:3000',
    'http://192.168.1.9:8080', // Network IP
    /^http:\/\/192\.168\.\d+\.\d+:8080$/, // Allow any local network IP on port 8080
    /^http:\/\/10\.\d+\.\d+\.\d+:8080$/, // Allow 10.x.x.x network
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:8080$/ // Allow 172.16-31.x.x network
  ],
  credentials: true
}));

// Basic logging middleware (before body parsing)
app.use((req, res, next) => {
  // Only log non-profile requests to reduce spam
  if (req.path !== '/api/users/profile') {
    console.log(`${req.method} ${req.path}`);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
  }
  next();
});

// Body parsing middleware - for non-multipart requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes (multer middleware will handle multipart/form-data)
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.send('HarvestConnect API is working!');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HarvestConnect API is healthy',
    timestamp: new Date().toISOString(),
    server: 'HarvestConnect Backend'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Network access: http://192.168.1.9:${PORT}`);
  
  // Schedule task to check for expired products every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled task: Checking for expired products...');
    try {
      const deletedCount = await softDeleteExpiredProducts();
      if (deletedCount > 0) {
        console.log(`Automatically soft deleted ${deletedCount} expired products`);
      }
    } catch (error) {
      console.error('Error in scheduled task:', error);
    }
  });
  
  console.log('Scheduled task set up: Checking for expired products every hour');
});
