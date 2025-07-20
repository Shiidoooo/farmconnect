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

// Test creating a product with enhanced size variants
const testEnhancedSizeVariants = async () => {
  try {
    console.log('\n🧪 Testing enhanced size variants with weight and wholesale...');
    
    // Create a test product like your example: 
    // Small: 50g, ₱50 retail, ₱30 wholesale, min 20
    const testProduct = new Product({
      productName: 'Premium Fresh Bananas',
      productDescription: 'High-quality bananas with different sizes and weights.',
      productPrice: 60.00, // Base price (will be overridden by variants)
      productCategory: 'fruits',
      productStock: 0, // Total stock will be sum of variant stocks
      harvestDate: new Date('2025-07-20'),
      storageLocation: 'room_temp',
      
      // Multiple size configuration with enhanced fields
      hasMultipleSizes: true,
      sizeVariants: [
        {
          size: 's',
          price: 50.00,
          stock: 100,
          wholesalePrice: 30.00,
          wholesaleMinQuantity: 20,
          averageWeightPerPiece: 50.0 // 50 grams
        },
        {
          size: 'm',
          price: 75.00,
          stock: 80,
          wholesalePrice: 45.00,
          wholesaleMinQuantity: 15,
          averageWeightPerPiece: 80.0 // 80 grams
        },
        {
          size: 'l',
          price: 100.00,
          stock: 60,
          wholesalePrice: 60.00,
          wholesaleMinQuantity: 10,
          averageWeightPerPiece: 120.0 // 120 grams
        },
        {
          size: 'xl',
          price: 130.00,
          stock: 40,
          wholesalePrice: 80.00,
          wholesaleMinQuantity: 8,
          averageWeightPerPiece: 180.0 // 180 grams
        }
      ],
      
      // Other fields
      sellingType: 'both',
      unit: 'per_piece',
      productStatus: 'available',
      
      // Required fields
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // Mock user ID
    });

    const savedProduct = await testProduct.save();
    console.log('✅ Enhanced size variants product created successfully!');
    console.log('Product ID:', savedProduct._id);
    console.log('Product Name:', savedProduct.productName);
    console.log('Has Multiple Sizes:', savedProduct.hasMultipleSizes);
    console.log('Unit:', savedProduct.unit);
    console.log('\nSize Variants Details:');
    
    savedProduct.sizeVariants.forEach((variant, index) => {
      console.log(`\n  ${index + 1}. Size: ${variant.size.toUpperCase()}`);
      console.log(`     Weight: ${variant.averageWeightPerPiece}g per piece`);
      console.log(`     Retail Price: ₱${variant.price} per piece`);
      console.log(`     Wholesale Price: ₱${variant.wholesalePrice} per piece`);
      console.log(`     Wholesale Min Qty: ${variant.wholesaleMinQuantity} pieces`);
      console.log(`     Stock: ${variant.stock} pieces`);
    });
    
    // Test fetching and verifying the product
    console.log('\n🔍 Fetching and verifying product...');
    const fetchedProduct = await Product.findById(savedProduct._id);
    
    console.log('\n--- Verification ---');
    console.log('Product Name:', fetchedProduct.productName);
    console.log('Has Multiple Sizes:', fetchedProduct.hasMultipleSizes);
    console.log('Number of Size Variants:', fetchedProduct.sizeVariants.length);
    
    // Verify all fields are saved correctly
    fetchedProduct.sizeVariants.forEach((variant, index) => {
      console.log(`\nVariant ${index + 1} (${variant.size.toUpperCase()}):`);
      console.log(`- Weight per piece: ${variant.averageWeightPerPiece}g`);
      console.log(`- Retail: ₱${variant.price}`);
      console.log(`- Wholesale: ₱${variant.wholesalePrice} (min ${variant.wholesaleMinQuantity})`);
      console.log(`- Stock: ${variant.stock}`);
    });
    
    // Test creating JSON representation (like frontend would send)
    console.log('\n🧪 Testing JSON serialization (like frontend form)...');
    const sizeVariantsJSON = JSON.stringify(savedProduct.sizeVariants.map(v => ({
      size: v.size,
      price: v.price.toString(),
      stock: v.stock.toString(),
      wholesalePrice: v.wholesalePrice.toString(),
      wholesaleMinQuantity: v.wholesaleMinQuantity.toString(),
      averageWeightPerPiece: v.averageWeightPerPiece.toString()
    })));
    
    console.log('JSON representation:', sizeVariantsJSON);
    
    // Test parsing back
    const parsedVariants = JSON.parse(sizeVariantsJSON);
    console.log('✅ JSON parsing successful!');
    console.log('First variant after parsing:', parsedVariants[0]);
    
    // Clean up test product
    console.log('\n🧹 Cleaning up test product...');
    await Product.deleteOne({ _id: savedProduct._id });
    console.log('✅ Test product cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
};

// Run the test
const runTests = async () => {
  await connectDB();
  await testEnhancedSizeVariants();
  await mongoose.connection.close();
  console.log('\n✅ All enhanced size variant tests completed');
};

runTests();
