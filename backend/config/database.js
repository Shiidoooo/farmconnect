const mongoose = require('mongoose');
require('dotenv').config(); // Load .env here

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); // Exit on failure
  }
};

module.exports = connectDB;
