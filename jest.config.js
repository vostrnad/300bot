module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/$1',
    '@commands/(.*)': '<rootDir>/src/modules/commands/$1',
    '@discord/(.*)': '<rootDir>/src/modules/discord/$1',
    '@planetside/(.*)': '<rootDir>/src/modules/planetside/$1',

    '@test/(.*)': '<rootDir>/test/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts', 'jest-extended'],
}
