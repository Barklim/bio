// Global setup for E2E tests
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(() => {
  // Set NODE_ENV for tests
  process.env.NODE_ENV = 'test';
  
  // Set JWT secret for tests
  process.env.JWT_SECRET = 'test-secret-key-for-e2e';
  process.env.JWT_EXPIRES_IN = '1h';
});

// Clean up after all tests
afterAll(async () => {
  // Allow time for cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
}); 