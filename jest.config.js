module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    testMatch: ['**/?(*.)+(unit|spec|test).ts'],
    moduleNameMapper: {
        '^@dtos(.*)$': '<rootDir>/src/application/dtos$1',
        '^@use-cases(.*)$': '<rootDir>/src/application/use-cases$1',
        '^@entities(.*)$': '<rootDir>/src/domain/entities$1',
        '^@strategies(.*)$': '<rootDir>/src/domain/strategies$1',
        '^@tax(.*)$': '<rootDir>/src/domain/tax$1',
        '^@value-objects(.*)$': '<rootDir>/src/domain/value-objects$1',
        '^@utils(.*)$': '<rootDir>/src/infrastructure/utils$1',
        '^@domain-constants(.*)$': '<rootDir>/src/domain/constants$1',
    },
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/index.ts',
        '!src/infrastructure/utils/logger.utils.ts',
        '!src/infrastructure/utils/number.utils.ts',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
