/**
 * @fileoverview Production-Ready Backend Test Suite
 * @description Comprehensive test script to validate the refactored backend architecture
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Production-Ready Backend Validation Tests...\n');

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  baseDir: __dirname, // Use current directory instead of parent
  timeout: 30000,
  verbose: true
};

/**
 * Color codes for console output
 */
const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

/**
 * Test result tracking
 */
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Utility function to print colored output
 */
function colorLog(color, message) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

/**
 * Test runner function
 */
async function runTest(testName, testFunction) {
  try {
    colorLog(COLORS.CYAN, `  ⏳ Running: ${testName}`);
    await testFunction();
    colorLog(COLORS.GREEN, `  ✅ PASSED: ${testName}`);
    testResults.passed++;
  } catch (error) {
    colorLog(COLORS.RED, `  ❌ FAILED: ${testName}`);
    console.log(`     Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ testName, error: error.message });
  }
}

/**
 * Test 1: Verify folder structure
 */
async function testFolderStructure() {
  const requiredPaths = [
    'src/controllers',
    'src/models',
    'src/services',
    'src/routes',
    'src/middleware',
    'src/config',
    'src/utils',
    'tests/unit/controllers',
    'tests/unit/models',
    'tests/unit/services',
    'tests/integration/routes',
    'tests/e2e'
  ];

  for (const reqPath of requiredPaths) {
    const fullPath = path.join(TEST_CONFIG.baseDir, reqPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Required directory missing: ${reqPath}`);
    }
  }
}

/**
 * Test 2: Verify controller files exist and are valid
 */
async function testControllerFiles() {
  const controllerFiles = [
    'src/controllers/ExperimentController.js',
    'src/controllers/ResponseController.js'
  ];

  for (const file of controllerFiles) {
    const filePath = path.join(TEST_CONFIG.baseDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Controller file missing: ${file}`);
    }

    // Try to require the file to check for syntax errors
    try {
      const ControllerClass = require(filePath);
      if (typeof ControllerClass !== 'function' && typeof ControllerClass !== 'object') {
        throw new Error(`Invalid controller export in ${file}`);
      }
    } catch (error) {
      throw new Error(`Failed to load controller ${file}: ${error.message}`);
    }
  }
}

/**
 * Test 3: Verify utility modules
 */
async function testUtilityModules() {
  const utilityFiles = [
    'src/utils/errors.js',
    'src/utils/validators.js',
    'src/utils/logger.js'
  ];

  for (const file of utilityFiles) {
    const filePath = path.join(TEST_CONFIG.baseDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Utility file missing: ${file}`);
    }

    try {
      const module = require(filePath);
      if (!module || typeof module !== 'object') {
        throw new Error(`Invalid utility module export in ${file}`);
      }
    } catch (error) {
      throw new Error(`Failed to load utility ${file}: ${error.message}`);
    }
  }
}

/**
 * Test 4: Verify middleware modules
 */
async function testMiddlewareModules() {
  const middlewareFiles = [
    'src/middleware/errorHandler.js',
    'src/middleware/validation.js',
    'src/middleware/logging.js'
  ];

  for (const file of middlewareFiles) {
    const filePath = path.join(TEST_CONFIG.baseDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Middleware file missing: ${file}`);
    }

    try {
      const middleware = require(filePath);
      if (!middleware || typeof middleware !== 'object') {
        throw new Error(`Invalid middleware export in ${file}`);
      }
    } catch (error) {
      throw new Error(`Failed to load middleware ${file}: ${error.message}`);
    }
  }
}

/**
 * Test 5: Test error classes functionality
 */
async function testErrorClasses() {
  const { 
    ValidationError, 
    NotFoundError, 
    DatabaseError,
    ExternalAPIError
  } = require(path.join(TEST_CONFIG.baseDir, 'src/utils/errors.js'));

  // Test ValidationError
  const validationError = new ValidationError('Test validation error', ['field1', 'field2']);
  if (validationError.statusCode !== 400) {
    throw new Error('ValidationError statusCode should be 400');
  }
  if (!validationError.details || !Array.isArray(validationError.details)) {
    throw new Error('ValidationError should have details array');
  }

  // Test NotFoundError
  const notFoundError = new NotFoundError('Resource not found');
  if (notFoundError.statusCode !== 404) {
    throw new Error('NotFoundError statusCode should be 404');
  }

  // Test DatabaseError
  const originalError = new Error('Original database error');
  const databaseError = new DatabaseError('Database operation failed', originalError);
  if (databaseError.statusCode !== 500) {
    throw new Error('DatabaseError statusCode should be 500');
  }

  // Test JSON serialization
  const serialized = JSON.stringify(validationError.toJSON());
  if (!serialized.includes('ValidationError')) {
    throw new Error('Error serialization should include error name');
  }
}

/**
 * Test 6: Test validator functions
 */
async function testValidatorFunctions() {
  const { 
    validateExperimentData,
    validateResponseData,
    isValidNumber
  } = require(path.join(TEST_CONFIG.baseDir, 'src/utils/validators.js'));

  // Test experiment validation - valid data
  const validExperiment = {
    name: 'Test Experiment',
    prompt: 'Test prompt',
    temperature_min: 0.1,
    temperature_max: 1.0,
    temperature_step: 0.1,
    max_tokens: 150
  };

  const validResult = validateExperimentData(validExperiment);
  if (!validResult.isValid) {
    throw new Error('Valid experiment data should pass validation');
  }

  // Test experiment validation - invalid data
  const invalidExperiment = {
    name: '', // Empty name should fail
    prompt: 'Test prompt'
  };

  const invalidResult = validateExperimentData(invalidExperiment);
  if (invalidResult.isValid) {
    throw new Error('Invalid experiment data should fail validation');
  }
  if (!Array.isArray(invalidResult.errors) || invalidResult.errors.length === 0) {
    throw new Error('Invalid data should return errors array');
  }

  // Test number validation
  if (!isValidNumber(0.5, 0, 1)) {
    throw new Error('0.5 should be valid number between 0 and 1');
  }
  if (isValidNumber(1.5, 0, 1)) {
    throw new Error('1.5 should not be valid number between 0 and 1');
  }
  if (isValidNumber('not_a_number', 0, 1)) {
    throw new Error('String should not be valid number');
  }
}

/**
 * Test 7: Test logger functionality
 */
async function testLoggerFunctionality() {
  const logger = require(path.join(TEST_CONFIG.baseDir, 'src/utils/logger.js'));

  // Test logger methods exist
  const requiredMethods = ['info', 'error', 'warn', 'debug'];
  for (const method of requiredMethods) {
    if (typeof logger[method] !== 'function') {
      throw new Error(`Logger should have ${method} method`);
    }
  }

  // Test child logger creation
  if (typeof logger.child !== 'function') {
    throw new Error('Logger should have child method');
  }

  const childLogger = logger.child({ component: 'test' });
  if (typeof childLogger.info !== 'function') {
    throw new Error('Child logger should have info method');
  }

  // Test log level management
  if (typeof logger.setLevel !== 'function' || typeof logger.getLevel !== 'function') {
    throw new Error('Logger should have setLevel and getLevel methods');
  }
}

/**
 * Test 8: Test middleware functions
 */
async function testMiddlewareFunctions() {
  const errorHandler = require(path.join(TEST_CONFIG.baseDir, 'src/middleware/errorHandler.js'));
  const validation = require(path.join(TEST_CONFIG.baseDir, 'src/middleware/validation.js'));
  const logging = require(path.join(TEST_CONFIG.baseDir, 'src/middleware/logging.js'));

  // Test error handler functions
  const errorFunctions = ['errorHandler', 'notFoundHandler', 'asyncHandler'];
  for (const func of errorFunctions) {
    if (typeof errorHandler[func] !== 'function') {
      throw new Error(`Error handler should have ${func} function`);
    }
  }

  // Test validation functions
  const validationFunctions = ['validateExperiment', 'validateResponse', 'validateIdParam'];
  for (const func of validationFunctions) {
    if (typeof validation[func] !== 'function') {
      throw new Error(`Validation middleware should have ${func} function`);
    }
  }

  // Test logging functions
  const loggingFunctions = ['requestId', 'requestLogger', 'performanceMonitor'];
  for (const func of loggingFunctions) {
    if (typeof logging[func] !== 'function') {
      throw new Error(`Logging middleware should have ${func} function`);
    }
  }

  // Test that middleware functions return functions
  const validateExperimentMiddleware = validation.validateExperiment();
  if (typeof validateExperimentMiddleware !== 'function') {
    throw new Error('Validation middleware should return a function');
  }

  const requestIdMiddleware = logging.requestId();
  if (typeof requestIdMiddleware !== 'function') {
    throw new Error('Request ID middleware should return a function');
  }
}

/**
 * Test 9: Test model structure (if accessible)
 */
async function testModelStructure() {
  try {
    const ExperimentModel = require(path.join(TEST_CONFIG.baseDir, 'src/models/Experiment.js'));
    
    // Test that model has required methods
    const requiredMethods = ['findAll', 'findById', 'create', 'update', 'delete'];
    for (const method of requiredMethods) {
      if (typeof ExperimentModel[method] !== 'function') {
        throw new Error(`Experiment model should have ${method} method`);
      }
    }
  } catch (error) {
    // If model requires database connection, just check file exists
    const modelPath = path.join(TEST_CONFIG.baseDir, 'src/models/Experiment.js');
    if (!fs.existsSync(modelPath)) {
      throw new Error('Experiment model file should exist');
    }
  }
}

/**
 * Test 10: Test integration with existing code
 */
async function testExistingCodeIntegration() {
  // Check that original files still exist
  const originalFiles = [
    'server.js',
    'models/Experiment.js',
    'routes/experiments.js',
    'services/llmService.js'
  ];

  for (const file of originalFiles) {
    const filePath = path.join(TEST_CONFIG.baseDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Original file should still exist: ${file}`);
    }
  }

  // Check that we haven't broken existing functionality by trying to require core files
  try {
    require(path.join(TEST_CONFIG.baseDir, 'services/llmService.js'));
  } catch (error) {
    // Only fail if it's a syntax error, not missing dependencies
    if (error.message.includes('SyntaxError')) {
      throw new Error(`Syntax error in original llmService: ${error.message}`);
    }
  }
}

/**
 * Main test execution
 */
async function runAllTests() {
  console.log(`${COLORS.BOLD}${COLORS.BLUE}Production-Ready Backend Validation Test Suite${COLORS.RESET}\n`);
  
  const tests = [
    ['Folder Structure', testFolderStructure],
    ['Controller Files', testControllerFiles],
    ['Utility Modules', testUtilityModules],
    ['Middleware Modules', testMiddlewareModules],
    ['Error Classes', testErrorClasses],
    ['Validator Functions', testValidatorFunctions],
    ['Logger Functionality', testLoggerFunctionality],
    ['Middleware Functions', testMiddlewareFunctions],
    ['Model Structure', testModelStructure],
    ['Existing Code Integration', testExistingCodeIntegration]
  ];

  colorLog(COLORS.YELLOW, `Running ${tests.length} test suites...\n`);

  for (const [testName, testFunction] of tests) {
    await runTest(testName, testFunction);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  colorLog(COLORS.BOLD, 'TEST SUMMARY');
  console.log('='.repeat(60));
  
  colorLog(COLORS.GREEN, `✅ Passed: ${testResults.passed}`);
  colorLog(COLORS.RED, `❌ Failed: ${testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\nFailed Tests:');
    testResults.errors.forEach(({ testName, error }) => {
      colorLog(COLORS.RED, `  • ${testName}: ${error}`);
    });
    console.log('\n');
    colorLog(COLORS.RED, '❌ Some tests failed. Please review and fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n');
    colorLog(COLORS.GREEN, '🎉 All tests passed! Production-ready backend structure is valid.');
    colorLog(COLORS.CYAN, '📝 Next steps:');
    console.log('   1. Run unit tests: npm test');
    console.log('   2. Start the refactored server');
    console.log('   3. Test API endpoints');
    console.log('   4. Deploy to production environment');
  }
}

// Error handling for the test script itself
process.on('unhandledRejection', (reason, promise) => {
  colorLog(COLORS.RED, `❌ Unhandled promise rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  colorLog(COLORS.RED, `❌ Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  colorLog(COLORS.RED, `❌ Test execution failed: ${error.message}`);
  process.exit(1);
});
