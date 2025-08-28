#!/usr/bin/env node

/**
 * Quick Test Framework - Run before/after optimization
 * Tests core functionality to ensure nothing breaks during direct integration
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Filesystem Plus - Pre-Optimization Test');
console.log('===========================================');

// Test configuration - adjust these paths for your system
const TEST_CONFIG = {
  readWriteDir: 'C:\\temp\\fs-plus-test',
  readOnlyDir: 'C:\\temp\\fs-plus-readonly-test',
  testFileName: 'test-file.txt',
  testContent: 'Hello from Filesystem Plus test!'
};

// Create test directories if they don't exist
function setupTestDirs() {
  console.log('📁 Setting up test directories...');
  
  try {
    if (!fs.existsSync(TEST_CONFIG.readWriteDir)) {
      fs.mkdirSync(TEST_CONFIG.readWriteDir, { recursive: true });
      console.log(`✅ Created read-write test dir: ${TEST_CONFIG.readWriteDir}`);
    }
    
    if (!fs.existsSync(TEST_CONFIG.readOnlyDir)) {
      fs.mkdirSync(TEST_CONFIG.readOnlyDir, { recursive: true });
      console.log(`✅ Created read-only test dir: ${TEST_CONFIG.readOnlyDir}`);
    }

    // Create a test file in read-only directory  
    const readOnlyTestFile = path.join(TEST_CONFIG.readOnlyDir, TEST_CONFIG.testFileName);
    if (!fs.existsSync(readOnlyTestFile)) {
      fs.writeFileSync(readOnlyTestFile, TEST_CONFIG.testContent);
      console.log(`✅ Created test file in read-only dir: ${readOnlyTestFile}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up test directories:', error.message);
    return false;
  }
}

// Test server startup (without actually starting it)
function testServerConfig() {
  console.log('\\n⚙️  Testing server configuration...');
  
  try {
    const serverPath = path.join(__dirname, 'server', 'index.js');
    const serverCode = fs.readFileSync(serverPath, 'utf8');
    
    // Check for key components
    const hasArgumentParsing = serverCode.includes('parseArguments');
    const hasPermissionChecking = serverCode.includes('isReadOnlyPath');  
    const hasChildProcess = serverCode.includes('spawn');
    
    console.log(`✅ Argument parsing: ${hasArgumentParsing ? 'Found' : 'Missing'}`);
    console.log(`✅ Permission checking: ${hasPermissionChecking ? 'Found' : 'Missing'}`);
    console.log(`📝 Child process architecture: ${hasChildProcess ? 'Current' : 'Direct integration'}`);
    
    return hasArgumentParsing && hasPermissionChecking;
  } catch (error) {
    console.error('❌ Error reading server configuration:', error.message);
    return false;
  }
}

// Test manifest configuration
function testManifestConfig() {
  console.log('\\n📋 Testing manifest configuration...');
  
  try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const hasUserConfig = manifest.user_config &&
                         manifest.user_config.full_access_directories &&
                         manifest.user_config.read_only_directories;
    
    const hasServerConfig = manifest.server && 
                           manifest.server.entry_point === 'server/index.js';
    
    console.log(`✅ User configuration schema: ${hasUserConfig ? 'Valid' : 'Invalid'}`);
    console.log(`✅ Server entry point: ${hasServerConfig ? 'Valid' : 'Invalid'}`);
    console.log(`📝 Extension name: ${manifest.display_name || manifest.name}`);
    console.log(`📝 Version: ${manifest.version}`);
    
    return hasUserConfig && hasServerConfig;
  } catch (error) {
    console.error('❌ Error reading manifest:', error.message);
    return false;
  }
}

// Main test runner
function runTests() {
  console.log(`🕐 Test started: ${new Date().toLocaleTimeString()}\\n`);
  
  const results = {
    testDirs: setupTestDirs(),
    serverConfig: testServerConfig(), 
    manifestConfig: testManifestConfig()
  };
  
  console.log('\\n📊 Test Summary:');
  console.log('=================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  console.log('\\n💡 Next Steps:');
  if (allPassed) {
    console.log('   - Extension structure is valid');
    console.log('   - Ready for direct integration optimization');
    console.log('   - Test Claude Desktop extension to verify current functionality');
  } else {
    console.log('   - Fix failing tests before proceeding');
    console.log('   - Check file paths and permissions'); 
  }
  
  console.log('\\n🔧 For Claude Desktop testing:');
  console.log(`   - Configure read-write: ${TEST_CONFIG.readWriteDir}`);
  console.log(`   - Configure read-only: ${TEST_CONFIG.readOnlyDir}`);
  console.log('   - Test write operations in both directories');
  
  return allPassed;
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests, TEST_CONFIG };