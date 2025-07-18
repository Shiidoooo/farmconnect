const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model
const User = require('./models/UserModel');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@farmconnect.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = new User({
      name: 'Farm Connect Admin',
      email: 'admin@farmconnect.com',
      password: hashedPassword,
      role: 'admin',
      address: 'Admin Office, FarmConnect HQ',
      phone_number: '+1234567890',
      gender: 'prefer not to say',
      dateOfBirth: new Date('1990-01-01'),
      defaultWallet: 0
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@farmconnect.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      console.log('\nValidation errors:');
      Object.keys(error.errors).forEach(key => {
        console.log(`- ${key}: ${error.errors[key].message}`);
      });
    }
  }
};

// Run the script
const main = async () => {
  console.log('🚀 Creating admin user for FarmConnect...\n');
  
  await connectDB();
  await createAdminUser();
  
  console.log('\n✨ Done! Closing database connection...');
  await mongoose.connection.close();
};

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createAdminUser };
