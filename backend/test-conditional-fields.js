const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Database connection error:', err));

const Product = require('./models/ProductModel');

async function testConditionalFields() {
  console.log('\n=== Testing Conditional Product Fields ===\n');

  // Test 1: Single size product WITH price and stock (should succeed)
  console.log('Test 1: Single size product with price and stock');
  try {
    const singleSizeProduct = new Product({
      productName: 'Test Single Size Product',
      productDescription: 'Test description',
      productPrice: 50.00,
      productStock: 100,
      category: 'vegetables',
      hasMultipleSizes: false,
      sellingType: 'retail'
    });
    
    const validation1 = singleSizeProduct.validateSync();
    if (validation1) {
      console.log('❌ Validation failed:', validation1.message);
    } else {
      console.log('✅ Single size product validation passed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Single size product WITHOUT price and stock (should fail)
  console.log('\nTest 2: Single size product without price and stock');
  try {
    const singleSizeNoPrice = new Product({
      productName: 'Test Single Size No Price',
      productDescription: 'Test description',
      category: 'vegetables',
      hasMultipleSizes: false,
      sellingType: 'retail'
    });
    
    const validation2 = singleSizeNoPrice.validateSync();
    if (validation2) {
      console.log('✅ Validation correctly failed:', validation2.message);
    } else {
      console.log('❌ Validation should have failed but passed');
    }
  } catch (error) {
    console.log('✅ Error correctly caught:', error.message);
  }

  // Test 3: Multiple sizes product with variants but no base price/stock (should succeed)
  console.log('\nTest 3: Multiple sizes product with variants, no base price/stock');
  try {
    const multiSizeProduct = new Product({
      productName: 'Test Multi Size Product',
      productDescription: 'Test description',
      category: 'vegetables',
      hasMultipleSizes: true,
      sellingType: 'retail',
      sizeVariants: [
        {
          size: 'Small',
          price: 30.00,
          stock: 50,
          averageWeightPerPiece: 100
        },
        {
          size: 'Large',
          price: 60.00,
          stock: 30,
          averageWeightPerPiece: 200
        }
      ]
    });
    
    const validation3 = multiSizeProduct.validateSync();
    if (validation3) {
      console.log('❌ Validation failed:', validation3.message);
    } else {
      console.log('✅ Multi size product validation passed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 4: Multiple sizes product without variants (should fail)
  console.log('\nTest 4: Multiple sizes product without variants');
  try {
    const multiSizeNoVariants = new Product({
      productName: 'Test Multi Size No Variants',
      productDescription: 'Test description',
      category: 'vegetables',
      hasMultipleSizes: true,
      sellingType: 'retail'
    });
    
    const validation4 = multiSizeNoVariants.validateSync();
    if (validation4) {
      console.log('✅ Validation correctly failed:', validation4.message);
    } else {
      console.log('❌ Validation should have failed but passed');
    }
  } catch (error) {
    console.log('✅ Error correctly caught:', error.message);
  }

  // Test 5: Multiple sizes with wholesale variants
  console.log('\nTest 5: Multiple sizes with wholesale variants');
  try {
    const multiSizeWholesale = new Product({
      productName: 'Test Multi Size Wholesale',
      productDescription: 'Test description',
      category: 'vegetables',
      hasMultipleSizes: true,
      sellingType: 'both',
      sizeVariants: [
        {
          size: 'Small',
          price: 30.00,
          stock: 50,
          averageWeightPerPiece: 100,
          wholesalePrice: 25.00,
          wholesaleMinQuantity: 20
        },
        {
          size: 'Large',
          price: 60.00,
          stock: 30,
          averageWeightPerPiece: 200,
          wholesalePrice: 50.00,
          wholesaleMinQuantity: 10
        }
      ]
    });
    
    const validation5 = multiSizeWholesale.validateSync();
    if (validation5) {
      console.log('❌ Validation failed:', validation5.message);
    } else {
      console.log('✅ Multi size wholesale product validation passed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n=== Test Complete ===');
  process.exit(0);
}

testConditionalFields();
