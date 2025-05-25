// Jest setup file
const { expect } = require('@jest/globals');
const { pool } = require('../server/db');

// Global setup
beforeAll(async () => {
  // Initialize test database or any other setup
  console.log('Running global test setup');
});

// Global teardown
afterAll(async () => {
  // Clean up resources
  await pool.end();
  console.log('Running global test teardown');
});

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});