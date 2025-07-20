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

// Test creating a product with size variants
const testSizeVariants = async () => {
  try {
    console.log('\n🧪 Testing product creation with size variants...');
    
    // Create a test product with multiple size variants (like bananas)
    const testProduct = new Product({
      productName: 'Fresh Bananas',
      productDescription: 'Sweet and fresh bananas available in different sizes.',
      productPrice: 60.00, // This will be the base price, variants have their own prices
      productCategory: 'fruits',
      productStock: 0, // Total stock will be sum of variant stocks
      harvestDate: new Date('2025-07-20'),
      storageLocation: 'room_temp',
      
      // Multiple size configuration
      hasMultipleSizes: true,
      sizeVariants: [
        {
          size: 's',
          price: 50.00,
          stock: 100,
          wholesalePrice: 45.00
        },
        {
          size: 'm',
          price: 60.00,
          stock: 150,
          wholesalePrice: 55.00
        },
        {
          size: 'l',
          price: 70.00,
          stock: 80,
          wholesalePrice: 65.00
        },
        {
          size: 'xl',
          price: 80.00,
          stock: 50,
          wholesalePrice: 75.00
        }
      ],
      
      // Other fields
      sellingType: 'both',
      unit: 'per_kilo',
      productStatus: 'available',
      wholesaleMinQuantity: 25,
      
      // Required fields
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // Mock user ID
    });

    const savedProduct = await testProduct.save();
    console.log('✅ Product with size variants created successfully!');
    console.log('Product ID:', savedProduct._id);
    console.log('Product Name:', savedProduct.productName);
    console.log('Has Multiple Sizes:', savedProduct.hasMultipleSizes);
    console.log('Size Variants:');
    
    savedProduct.sizeVariants.forEach((variant, index) => {
      console.log(`  ${index + 1}. Size: ${variant.size.toUpperCase()}`);
      console.log(`     Price: ₱${variant.price} per kilo`);
      console.log(`     Stock: ${variant.stock} kilos`);
      console.log(`     Wholesale: ₱${variant.wholesalePrice} per kilo`);
      console.log('');
    });
    
    // Test creating a single size product
    console.log('🧪 Testing single size product...');
    const singleSizeProduct = new Product({
      productName: 'Organic Carrots',
      productDescription: 'Fresh organic carrots.',
      productPrice: 45.00,
      productCategory: 'vegetables',
      productStock: 200,
      harvestDate: new Date('2025-07-19'),
      storageLocation: 'fridge',
      
      // Single size configuration
      hasMultipleSizes: false,
      size: 'm',
      sizeVariants: [], // Empty array for single size
      
      sellingType: 'retail',
      unit: 'per_kilo',
      productStatus: 'available',
      
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
    });

    const savedSingleProduct = await singleSizeProduct.save();
    console.log('✅ Single size product created successfully!');
    console.log('Product Name:', savedSingleProduct.productName);
    console.log('Has Multiple Sizes:', savedSingleProduct.hasMultipleSizes);
    console.log('Single Size:', savedSingleProduct.size);
    console.log('Price: ₱', savedSingleProduct.productPrice);
    
    // Test fetching and verifying the products
    console.log('\n🔍 Fetching and verifying products...');
    const allTestProducts = await Product.find({
      productName: { $in: ['Fresh Bananas', 'Organic Carrots'] }
    });
    
    console.log(`Found ${allTestProducts.length} test products`);
    
    allTestProducts.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1}: ${product.productName} ---`);
      console.log('Has Multiple Sizes:', product.hasMultipleSizes);
      
      if (product.hasMultipleSizes) {
        console.log(`Number of size variants: ${product.sizeVariants.length}`);
        product.sizeVariants.forEach(variant => {
          console.log(`- ${variant.size.toUpperCase()}: ₱${variant.price} (Stock: ${variant.stock})`);
        });
      } else {
        console.log(`Single size: ${product.size || 'No specific size'}`);
        console.log(`Price: ₱${product.productPrice}`);
        console.log(`Stock: ${product.productStock}`);
      }
    });
    
    // Clean up test products
    console.log('\n🧹 Cleaning up test products...');
    await Product.deleteMany({
      productName: { $in: ['Fresh Bananas', 'Organic Carrots'] }
    });
    console.log('✅ Test products cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
const runTests = async () => {
  await connectDB();
  await testSizeVariants();
  await mongoose.connection.close();
  console.log('\n✅ All size variant tests completed and database connection closed');
};

runTests();
