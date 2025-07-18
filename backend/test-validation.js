const { validateProductContent, validateProductWithHuggingFace, validateContentWithOpenAI } = require('./utils/productValidation');

// Test function to run various validation scenarios
async function testValidation() {
  console.log('🚀 Starting Product Validation Tests...\n');

  // Test 1: Valid product names
  console.log('📝 Test 1: Valid Product Names');
  console.log('==================================');
  
  const validProducts = [
    { name: 'Fresh Tomatoes', category: 'vegetables' },
    { name: 'Organic Mangoes', category: 'fruits' },
    { name: 'Kamatis', category: 'vegetables' },
    { name: 'Saging', category: 'fruits' },
    { name: 'Sunflower Seeds', category: 'seeds' },
    { name: 'Corn Seeds', category: 'seeds' }
  ];

  for (const product of validProducts) {
    try {
      const result = await validateProductWithHuggingFace(product.name, product.category);
      console.log(`✅ "${product.name}" (${product.category}): ${result.isValid ? 'VALID' : 'INVALID'} - Confidence: ${result.confidence.toFixed(2)}`);
    } catch (error) {
      console.log(`❌ "${product.name}" (${product.category}): ERROR - ${error.message}`);
    }
  }

  console.log('\n📝 Test 2: Invalid Product Names');
  console.log('==================================');
  
  const invalidProducts = [
    { name: 'Smartphone', category: 'vegetables' },
    { name: 'Car Parts', category: 'fruits' },
    { name: 'Laptop Computer', category: 'vegetables' },
    { name: 'Gaming Console', category: 'fruits' }
  ];

  for (const product of invalidProducts) {
    try {
      const result = await validateProductWithHuggingFace(product.name, product.category);
      console.log(`${result.isValid ? '❌' : '✅'} "${product.name}" (${product.category}): ${result.isValid ? 'VALID' : 'INVALID'} - Confidence: ${result.confidence.toFixed(2)}`);
    } catch (error) {
      console.log(`❌ "${product.name}" (${product.category}): ERROR - ${error.message}`);
    }
  }

  console.log('\n📝 Test 3: Content Moderation - Appropriate Content');
  console.log('=====================================================');
  
  const appropriateContent = [
    'Fresh organic tomatoes grown in our farm',
    'Sweet and juicy mangoes from Cebu',
    'Maasim na kamatis para sa ulam',
    'Matamis na saging mula sa Davao'
  ];

  for (const content of appropriateContent) {
    try {
      const result = await validateContentWithOpenAI(content);
      console.log(`✅ "${content}": ${result.isAppropriate ? 'APPROPRIATE' : 'INAPPROPRIATE'} - ${result.message}`);
    } catch (error) {
      console.log(`❌ "${content}": ERROR - ${error.message}`);
    }
  }

  console.log('\n📝 Test 4: Content Moderation - Inappropriate Content');
  console.log('======================================================');
  
  const inappropriateContent = [
    'This product contains drugs',
    'Weapon for sale',
    'Violent content here',
    'Adult explicit material'
  ];

  for (const content of inappropriateContent) {
    try {
      const result = await validateContentWithOpenAI(content);
      console.log(`${result.isAppropriate ? '❌' : '✅'} "${content}": ${result.isAppropriate ? 'APPROPRIATE' : 'INAPPROPRIATE'} - ${result.message}`);
    } catch (error) {
      console.log(`❌ "${content}": ERROR - ${error.message}`);
    }
  }

  console.log('\n📝 Test 5: Full Product Validation');
  console.log('===================================');
  
  const fullTests = [
    {
      name: 'Fresh Organic Tomatoes',
      description: 'Locally grown tomatoes from our farm, perfect for cooking',
      category: 'vegetables'
    },
    {
      name: 'Sweet Mangoes',
      description: 'Juicy mangoes from Cebu, great for desserts',
      category: 'fruits'
    },
    {
      name: 'Laptop Computer',
      description: 'High-performance laptop for gaming',
      category: 'vegetables'
    },
    {
      name: 'Fresh Tomatoes',
      description: 'Contains inappropriate adult content',
      category: 'vegetables'
    }
  ];

  for (const test of fullTests) {
    try {
      const result = await validateProductContent(test.name, test.description, test.category);
      console.log(`\n🔍 Product: "${test.name}"`);
      console.log(`   Category: ${test.category}`);
      console.log(`   Description: "${test.description}"`);
      console.log(`   Name Valid: ${result.nameValidation.isValid ? '✅' : '❌'} (${result.nameValidation.confidence.toFixed(2)})`);
      console.log(`   Name Appropriate: ${result.nameModeration.isAppropriate ? '✅' : '❌'}`);
      console.log(`   Description Appropriate: ${result.descriptionModeration.isAppropriate ? '✅' : '❌'}`);
      console.log(`   Overall Valid: ${result.isValid ? '✅' : '❌'}`);
      console.log(`   Should Soft Delete: ${result.shouldSoftDelete ? '⚠️  YES' : '✅ NO'}`);
      if (result.deletionReason) {
        console.log(`   Deletion Reason: ${result.deletionReason}`);
      }
    } catch (error) {
      console.log(`❌ "${test.name}": ERROR - ${error.message}`);
    }
  }

  console.log('\n✅ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Valid products should pass name validation');
  console.log('- Invalid products should fail name validation');
  console.log('- Appropriate content should pass moderation');
  console.log('- Inappropriate content should fail moderation');
  console.log('- Products with inappropriate content should be soft-deleted');
}

// Test environment variables
console.log('🔑 Environment Variables Check:');
console.log('================================');
console.log(`HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log('');

// Run the tests
testValidation().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
