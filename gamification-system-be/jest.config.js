module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  verbose: true,
  silent: true,
};
