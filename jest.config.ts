import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  collectCoverageFrom: [
    'apps/*/src/**/*.(t|j)s',
    'libs/*/src/**/*.(t|j)s',
    '!apps/*/src/main.ts',
    '!libs/*/src/index.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^@common$': '<rootDir>/libs/common/src',
    '^@database/(.*)$': '<rootDir>/libs/database/src/$1',
    '^@database$': '<rootDir>/libs/database/src',
  },
};

export default config;
