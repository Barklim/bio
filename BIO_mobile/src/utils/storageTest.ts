import { storageService } from '../services/storageService';

export const testStorage = async () => {
  try {
    console.log('Testing storage service...');
    
    // Test storing a value
    await storageService.setItem('test_key', 'test_value');
    console.log('✅ Storage set test passed');
    
    // Test retrieving a value
    const value = await storageService.getItem('test_key');
    console.log('Retrieved value:', value);
    
    if (value === 'test_value') {
      console.log('✅ Storage get test passed');
    } else {
      console.log('❌ Storage get test failed');
    }
    
    // Test removing a value
    await storageService.removeItem('test_key');
    console.log('✅ Storage remove test passed');
    
    // Test retrieving removed value
    const removedValue = await storageService.getItem('test_key');
    if (removedValue === null) {
      console.log('✅ Storage remove verification passed');
    } else {
      console.log('❌ Storage remove verification failed');
    }
    
    console.log('Storage service test completed');
  } catch (error) {
    console.error('❌ Storage service test failed:', error);
  }
};

// Run test in development
if (__DEV__) {
  // testStorage();
} 