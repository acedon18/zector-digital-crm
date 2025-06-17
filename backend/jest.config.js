module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
};
