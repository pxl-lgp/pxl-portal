const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/?(*.)+(spec).ts?(x)'],
  clearMocks: true,
};

module.exports = createJestConfig(config);
