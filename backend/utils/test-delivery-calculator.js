const DeliveryCalculator = require('./deliveryCalculator');

// Test the delivery calculator
const calculator = new DeliveryCalculator();

console.log('🚚 DELIVERY CALCULATOR TEST\n');
console.log('==================================================');

// Test Case 1: Light order (should use motorcycle)
console.log('\n📦 Test Case 1: Light Order (5kg vegetables)');
const lightOrder = [
    {
        product: {
            productName: 'Tomatoes',
            productCategory: 'vegetables',
            averageWeightPerPiece: 150, // 150g per piece
            unit: 'per_piece'
        },
        quantity: 33, // 33 pieces = 4.95kg
        selectedSize: null
    }
];

const lightWeight = calculator.calculateOrderWeight(lightOrder);
const lightDelivery = calculator.calculateDeliveryCost(lightWeight, 8); // 8km distance

console.log(`Weight: ${lightWeight}g (${(lightWeight/1000).toFixed(1)}kg)`);
console.log(`Vehicle: ${lightDelivery.vehicleName}`);
console.log(`Cost: ₱${lightDelivery.totalCost}`);
console.log(`Warnings: ${lightDelivery.warnings.join(', ') || 'None'}`);
console.log(`Recommendations: ${lightDelivery.recommendations.join(', ') || 'None'}`);

// Test Case 2: Heavy order (should automatically select larger vehicle)
console.log('\n📦 Test Case 2: Heavy Order (150kg rice)');
const heavyOrder = [
    {
        product: {
            productName: 'Rice',
            productCategory: 'grains',
            averageWeightPerPiece: null,
            unit: 'per_kilo'
        },
        quantity: 150, // 150 kg
        selectedSize: null
    }
];

const heavyWeight = calculator.calculateOrderWeight(heavyOrder);
const heavyDelivery = calculator.calculateDeliveryCost(heavyWeight, 12); // 12km distance

console.log(`Weight: ${heavyWeight}g (${(heavyWeight/1000).toFixed(1)}kg)`);
console.log(`Vehicle: ${heavyDelivery.vehicleName}`);
console.log(`Cost: ₱${heavyDelivery.totalCost}`);
console.log(`Weight Utilization: ${heavyDelivery.weightUtilization}%`);
console.log(`Warnings: ${heavyDelivery.warnings.join(', ') || 'None'}`);
console.log(`Recommendations: ${heavyDelivery.recommendations.join(', ') || 'None'}`);

// Test Case 3: Super heavy order (should use largest truck)
console.log('\n📦 Test Case 3: Super Heavy Order (5000kg mixed products)');
const superHeavyOrder = [
    {
        product: {
            productName: 'Bulk Rice',
            productCategory: 'grains',
            unit: 'per_kilo'
        },
        quantity: 5000, // 5000 kg
        selectedSize: null
    }
];

const superHeavyWeight = calculator.calculateOrderWeight(superHeavyOrder);
const superHeavyDelivery = calculator.calculateDeliveryCost(superHeavyWeight, 25); // 25km distance

console.log(`Weight: ${superHeavyWeight}g (${(superHeavyWeight/1000).toFixed(1)}kg)`);
console.log(`Vehicle: ${superHeavyDelivery.vehicleName}`);
console.log(`Cost: ₱${superHeavyDelivery.totalCost}`);
console.log(`Trips Needed: ${superHeavyDelivery.tripsNeeded}`);
console.log(`Weight Utilization: ${superHeavyDelivery.weightUtilization}%`);
console.log(`Warnings: ${superHeavyDelivery.warnings.join(', ') || 'None'}`);

// Test Case 4: Multiple size variants
console.log('\n📦 Test Case 4: Multiple Size Products (Mixed vegetables)');
const mixedOrder = [
    {
        product: {
            productName: 'Mixed Vegetables',
            productCategory: 'vegetables',
            hasMultipleSizes: true,
            sizeVariants: [
                { size: 's', averageWeightPerPiece: 100 },
                { size: 'm', averageWeightPerPiece: 150 },
                { size: 'l', averageWeightPerPiece: 200 }
            ]
        },
        quantity: 50,
        selectedSize: 'l'
    },
    {
        product: {
            productName: 'Mixed Vegetables',
            productCategory: 'vegetables',
            hasMultipleSizes: true,
            sizeVariants: [
                { size: 's', averageWeightPerPiece: 100 },
                { size: 'm', averageWeightPerPiece: 150 },
                { size: 'l', averageWeightPerPiece: 200 }
            ]
        },
        quantity: 100,
        selectedSize: 'm'
    }
];

const mixedWeight = calculator.calculateOrderWeight(mixedOrder);
const mixedDelivery = calculator.calculateDeliveryCost(mixedWeight, 15); // 15km distance

console.log(`Weight: ${mixedWeight}g (${(mixedWeight/1000).toFixed(1)}kg)`);
console.log(`Vehicle: ${mixedDelivery.vehicleName}`);
console.log(`Cost: ₱${mixedDelivery.totalCost}`);
console.log(`Weight Utilization: ${mixedDelivery.weightUtilization}%`);

// Test Case 5: Get all delivery options for comparison
console.log('\n📋 Test Case 5: All Delivery Options for 500kg order');
const mediumWeight = 500000; // 500kg
const allOptions = calculator.getDeliveryOptions(mediumWeight, 10);

console.log('\nAvailable delivery options:');
allOptions.forEach((option, index) => {
    console.log(`${index + 1}. ${option.name} (${option.maxCapacity})`);
    console.log(`   Cost: ₱${option.totalCost} | Efficiency: ${option.efficiency} | Status: ${option.viability}`);
    if (option.recommended) console.log('   ⭐ RECOMMENDED');
    console.log('');
});

console.log('\n==================================================');
console.log('🎉 All tests completed!');
