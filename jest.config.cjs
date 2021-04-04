const pack = require('./package');

module.exports = {
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests',
  ],
  testRegex: '(/tests/.*.(test|spec)).(jsx?|tsx?)$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '(tests/.*.mock).(jsx?|tsx?)$',
  ],
  verbose: true,
  displayName: pack.name,
  name: pack.name,
  transform: {
    '\\.[jt]sx?$': ['babel-jest', {
      configFile: './babel.config.cjs',
    }],
  },
  coverageDirectory: './coverage',
  setupFilesAfterEnv: ['./setup.js']
};
