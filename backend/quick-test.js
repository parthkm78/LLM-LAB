/**
 * Quick Production Backend Test
 * Simple validation of refactored backend structure
 */

console.log('🚀 Quick Production Backend Validation...\n');

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/controllers/ExperimentController.js',
  'src/controllers/ResponseController.js',
  'src/models/Experiment.js',
  'src/models/Response.js',
  'src/services/llmService.js',
  'src/services/qualityMetricsService.js',
  'src/utils/errors.js',
  'src/utils/validators.js',
  'src/utils/logger.js',
  'src/middleware/errorHandler.js',
  'src/middleware/validation.js',
  'src/middleware/logging.js',
  'src/config/database.js'
];

let allGood = true;

console.log('Checking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
}

console.log('\nTesting module loading...');
try {
  const errors = require('./src/utils/errors.js');
  console.log('✅ Error utilities loaded');
  
  const validators = require('./src/utils/validators.js');
  console.log('✅ Validators loaded');
  
  const logger = require('./src/utils/logger.js');
  console.log('✅ Logger loaded');
  
  // Test error creation
  const { ValidationError } = errors;
  const testError = new ValidationError('Test error');
  if (testError.statusCode === 400) {
    console.log('✅ Error classes working');
  }
  
  // Test validation
  const result = validators.validateExperimentData({
    name: 'Test',
    prompt: 'Test prompt',
    temperature_min: 0.1,
    temperature_max: 1.0
  });
  
  if (result.isValid) {
    console.log('✅ Validation working');
  }
  
} catch (error) {
  console.log(`❌ Module loading failed: ${error.message}`);
  allGood = false;
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 Production backend structure is VALID!');
  console.log('\nNext steps:');
  console.log('1. Update existing routes to use new controllers');
  console.log('2. Add middleware to Express app');
  console.log('3. Run integration tests');
  console.log('4. Deploy to production');
} else {
  console.log('❌ Some issues found. Please fix and re-run.');
}
console.log('='.repeat(50));
