const ShelfLifePredictor = require('./utils/shelfLifePredictor');

console.log('🥬 HarvestConnect Shelf Life Prediction Test 🍎\n');

const predictor = new ShelfLifePredictor();

// Test cases
const testCases = [
    {
        productName: 'Apple',
        harvestDate: '2025-01-10',
        storageLocation: 'fridge'
    },
    {
        productName: 'Kamatis', // Tomato in Tagalog
        harvestDate: '2025-01-10',
        storageLocation: 'pantry'
    },
    {
        productName: 'Saging', // Banana in Tagalog
        harvestDate: '2025-01-10',
        storageLocation: 'room_temp'
    },
    {
        productName: 'Lettuce',
        harvestDate: '2025-01-10',
        storageLocation: 'fridge'
    },
    {
        productName: 'Unknown Fruit', // Test unknown product
        harvestDate: '2025-01-10',
        storageLocation: 'fridge'
    }
];

console.log('Testing Shelf Life Predictions:\n');

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. Testing: ${testCase.productName}`);
    console.log(`   Harvest Date: ${testCase.harvestDate}`);
    console.log(`   Storage: ${testCase.storageLocation}`);
    
    const prediction = predictor.predictExpiryDate(
        testCase.productName,
        testCase.harvestDate,
        testCase.storageLocation
    );
    
    console.log(`   ✅ Result:`);
    console.log(`      Matched Product: ${prediction.matchedProduct || 'Not found (using default)'}`);
    console.log(`      Shelf Life: ${prediction.shelfLifeDays} days`);
    console.log(`      Expiry Date: ${prediction.expiryDate.toDateString()}`);
    console.log(`      Product Found: ${prediction.isProductFound ? 'Yes' : 'No'}`);
    console.log('');
});

// Test search functionality
console.log('Testing Search Functionality:\n');

const searchQueries = ['apple', 'kamatis', 'saging'];

searchQueries.forEach(query => {
    const results = predictor.searchProducts(query);
    console.log(`Search for "${query}": Found ${results.length} results`);
    results.slice(0, 3).forEach(product => {
        console.log(`  - ${product.product_english} (${product.product_tagalog})`);
    });
    console.log('');
});

// Show total products available
const allProducts = predictor.getAllProducts();
console.log(`Total products in database: ${allProducts.length}`);
console.log(`Fruits: ${predictor.data.fruits.length}`);
console.log(`Vegetables: ${predictor.data.vegetables.length}`);

console.log('\n🎉 Test completed successfully!');
