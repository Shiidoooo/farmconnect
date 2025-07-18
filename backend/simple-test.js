const path = require('path');
require('dotenv').config();

console.log('Testing module import...');

try {
  const validationModule = require('./utils/productValidation');
  console.log('✅ Module imported successfully');
  console.log('Available functions:', Object.keys(validationModule));
  
  // Test if the function exists
  if (typeof validationModule.validateProductContent === 'function') {
    console.log('✅ validateProductContent is available');
  } else {
    console.log('❌ validateProductContent is not a function');
    console.log('Type:', typeof validationModule.validateProductContent);
  }
  
  // Test a simple validation
  console.log('\nTesting simple validation...');
  validationModule.validateProductContent('Fresh Tomatoes', 'Organic tomatoes from local farm', 'vegetables')
    .then(result => {
      console.log('✅ Validation test passed:', result);
    })
    .catch(error => {
      console.error('❌ Validation test failed:', error);
    });
    
} catch (error) {
  console.error('❌ Module import failed:', error);
}
