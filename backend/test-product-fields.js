const mongoose = require('mongoose');
require('dotenv').config();

// Import the Product model
const Product = require('./models/ProductModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test creating a product with all new fields
const testProductCreation = async () => {
  try {
    console.log('\n🧪 Testing product creation with new fields...');
    
    // Create a test product with all the new fields
    const testProduct = new Product({
      productName: 'Premium Organic Tomatoes',
      productDescription: 'Fresh, locally grown organic tomatoes perfect for cooking and salads.',
      productPrice: 150.00,
      productCategory: 'vegetables',
      productStock: 100,
      harvestDate: new Date('2025-07-15'),
      storageLocation: 'fridge',
      
      // New fields
      sellingType: 'both',                    // retail, wholesale, or both
      unit: 'per_kilo',                       // per_piece, per_kilo, etc.
      averageWeightPerPiece: null,            // Only for per_piece
      size: 'l',                              // s, m, l, xl, etc.
      productStatus: 'available',             // available, pre_order, etc.
      wholesaleMinQuantity: 50,               // For wholesale
      wholesalePrice: 120.00,                 // Wholesale price
      availableDate: null,                    // For pre-order items
      
      // Required fields
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // Mock user ID
    });

    const savedProduct = await testProduct.save();
    console.log('✅ Product created successfully with ID:', savedProduct._id);
    console.log('Product details:');
    console.log('- Name:', savedProduct.productName);
    console.log('- Selling Type:', savedProduct.sellingType);
    console.log('- Unit:', savedProduct.unit);
    console.log('- Size:', savedProduct.size);
    console.log('- Status:', savedProduct.productStatus);
    console.log('- Retail Price: ₱', savedProduct.productPrice);
    console.log('- Wholesale Price: ₱', savedProduct.wholesalePrice);
    console.log('- Wholesale Min Quantity:', savedProduct.wholesaleMinQuantity);
    
    // Test another product with per_piece and average weight
    console.log('\n🧪 Testing per_piece product...');
    const testProduct2 = new Product({
      productName: 'Large Mangoes',
      productDescription: 'Sweet and juicy mangoes, perfect ripeness.',
      productPrice: 25.00,
      productCategory: 'fruits',
      productStock: 200,
      harvestDate: new Date('2025-07-18'),
      storageLocation: 'room_temp',
      
      // New fields for per_piece
      sellingType: 'retail',
      unit: 'per_piece',
      averageWeightPerPiece: 250.5,           // 250.5 grams per piece
      size: 'xl',
      productStatus: 'available',
      
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
    });

    const savedProduct2 = await testProduct2.save();
    console.log('✅ Per-piece product created successfully with ID:', savedProduct2._id);
    console.log('- Average Weight Per Piece:', savedProduct2.averageWeightPerPiece, 'grams');
    
    // Test pre-order product
    console.log('\n🧪 Testing pre-order product...');
    const testProduct3 = new Product({
      productName: 'Sweet Corn',
      productDescription: 'Fresh sweet corn, available for pre-order.',
      productPrice: 80.00,
      productCategory: 'vegetables',
      productStock: 0,
      harvestDate: new Date('2025-07-25'),
      storageLocation: 'fridge',
      
      // Pre-order fields
      sellingType: 'wholesale',
      unit: 'per_bundle',
      size: 'm',
      productStatus: 'pre_order',
      wholesaleMinQuantity: 20,
      wholesalePrice: 70.00,
      availableDate: new Date('2025-07-30'),   // Available in 10 days
      
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
    });

    const savedProduct3 = await testProduct3.save();
    console.log('✅ Pre-order product created successfully with ID:', savedProduct3._id);
    console.log('- Status:', savedProduct3.productStatus);
    console.log('- Available Date:', savedProduct3.availableDate.toDateString());
    
    // Test fetching products to see if all fields are saved
    console.log('\n🔍 Fetching all test products...');
    const allProducts = await Product.find({
      productName: { $in: ['Premium Organic Tomatoes', 'Large Mangoes', 'Sweet Corn'] }
    });
    
    console.log(`✅ Found ${allProducts.length} test products`);
    allProducts.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}:`);
      console.log('- Name:', product.productName);
      console.log('- Selling Type:', product.sellingType);
      console.log('- Unit:', product.unit);
      console.log('- Size:', product.size || 'Not specified');
      console.log('- Status:', product.productStatus);
      console.log('- Average Weight Per Piece:', product.averageWeightPerPiece || 'N/A');
      console.log('- Wholesale Min Quantity:', product.wholesaleMinQuantity || 'N/A');
      console.log('- Available Date:', product.availableDate ? product.availableDate.toDateString() : 'N/A');
    });
    
    // Clean up test products
    console.log('\n🧹 Cleaning up test products...');
    await Product.deleteMany({
      productName: { $in: ['Premium Organic Tomatoes', 'Large Mangoes', 'Sweet Corn'] }
    });
    console.log('✅ Test products cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
const runTests = async () => {
  await connectDB();
  await testProductCreation();
  await mongoose.connection.close();
  console.log('\n✅ All tests completed and database connection closed');
};

runTests();
