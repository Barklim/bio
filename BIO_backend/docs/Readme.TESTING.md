# BIO Backend Testing Framework

This document describes a comprehensive testing framework for the BIO Backend API on NestJS.

| npm run test:unit | npm run test:e2e |
| ------------- | ----------------- |
|![terminal.test.unit](https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/terminal.test.unit.png)|![terminal.test.e2e](https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/terminal.test.e2e.png)|

| npm run test:all:cov |
| ----------------- |
|![terminal.test.all.cov](https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/terminal.test.all.cov.png)|


## Overview

The testing framework includes:

- **Unit tests** - testing individual services in isolation
- **Integration tests** - testing controllers with a real database
- **E2E tests** - testing full API usage scenarios

## Test structure

```
src/
├── test/                         # Test utilities
│   ├── fixtures.ts               # Generating test data
│   ├── test-utils.ts             # Utilities for creating test modules
│   └── test-data-source.ts       # Test DB Configuration
├── auth/
│   ├── auth.service.spec.ts      # AuthService unit tests
│   └── auth.controller.spec.ts   # AuthController Integration Tests
├── users/
│   ├── users.service.spec.ts     # Unit tests UsersService
│   └── users.controller.spec.ts  # UsersController Integration Tests
└── database/
    └── test-data-source.ts       # SQLite Configuration for Tests

test/
├── app.e2e-spec.ts              # E2E tests of full scenarios
├── jest-e2e.json                # Jest Configuration for E2E
└── jest.e2e.setup.ts            # Global E2E Testing Configuration
```

## Configuration

### Test database

- **Unit tests**: Use mock repositories
- **Integration and E2E tests**: Use in-memory SQLite (`:memory:`)

### Environment variables

Tests use `.env.test` file:

```env
NODE_ENV=test
PORT=3001
DB_TYPE=sqlite
DB_DATABASE=:memory:
JWT_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=1h
CORS_ORIGIN=*
```

## Running tests

### Available commands

```bash
# All unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests in a row
npm run test:all

# Standard Jest (unit tests)
npm test

# Tests with coverage
npm run test:cov
npm run test:e2e:cov

# Tests in watch mode
npm run test:watch
npm run test:e2e:watch

# All tests with coverage
npm run test:all:cov
```

## Test data

### TestFixtures

The `TestFixtures` class provides methods for generating test data:

```typescript
// Create DTO
const userDto = TestFixtures.createUserDto();
const registerDto = TestFixtures.registerDto();
const loginDto = TestFixtures.loginDto();

// Creating entities
const user = TestFixtures.user();
const userWithPassword = TestFixtures.userWithPassword();

// Ready data
TestFixtures.VALID_USER_DATA
TestFixtures.ADMIN_USER_DATA
TestFixtures.INVALID_PASSWORDS
TestFixtures.INVALID_EMAILS
```

### TestUtils

Utilities for creating test modules:

```typescript
// Creating a test module
const module = await TestUtils.createTestModule(
  [UsersService], 
  [TypeOrmModule.forFeature([User])]
);

// Clear the database
await TestUtils.clearDatabase(dataSource);

// Close the connection
await TestUtils.closeDatabase(dataSource);
```

## Test types

### Unit tests

**Location**: `src/**/*.service.spec.ts`

**Purpose**: Testing business logic of services in isolation

**Features**:
- Use mocks for all dependencies
- Test every service method
- Check error handling
- Fast and isolated

**Example**:
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository }
      ],
    }).compile();
    
    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('должен создать пользователя', async () => {
    // test...
  });
});
```

### Integration tests

**Location**: `src/**/*.controller.spec.ts`

**Purpose**: Test HTTP endpoints with a real database

**Features**:
- Uses a real SQLite in-memory database
- Tests HTTP requests and responses
- Checks authorization and validation
- Tests integration between layers

**Example**:
```typescript
describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
      imports: [/* real modules */],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('должен создать пользователя', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(userData)
      .expect(201);
  });
});
```

### E2E tests

**Location**: `test/app.e2e-spec.ts`

**Purpose**: Testing full user scenarios

**Features**:
- Uses full application with all modules
- Tests complete user journey
- Checks integration of all components
- Slowest, but most complete

**Example**:
```typescript
describe('BIO Backend API (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('полный сценарий: регистрация → логин → управление', async () => {
    // 1. Registration
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(registerData)
      .expect(201);

    // 2. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginData)
      .expect(200);

    // 3. Using protected endpoints
    // ...
  });
});
```

## Code coverage

The testing system includes collection of code coverage metrics:

```bash
# Unit тесты с coverage
npm run test:cov

# E2E тесты с coverage  
npm run test:e2e:cov

# Все тесты с coverage
npm run test:all:cov
```

Reports are saved in:
- `coverage/` - for unit tests
- `coverage-e2e/` - for E2E tests

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Clean the database between tests
- Use separate test data for each test

### 2. Test Data

- Use faker to generate realistic data
- Create the minimum required data for each test
- Group common test data in TestFixtures

### 3. Test Naming

- Use descriptive names
- Follow the pattern "must [action] when [condition]"
- Write tests in Russian for convenience

### 4. Mocking

- Mock only external dependencies
- Use a real database for integration tests
- Don't mock what you are testing

### 5. Performance

- Unit tests should run fast (< 100ms per test)
- Integration tests can be slower (< 1s per test)
- E2E tests are the slowest (< 5s per test)

## Current status

### ✅ Implemented

- Unit tests for UsersService and AuthService
- Integration tests for controllers
- E2E tests for main scenarios
- Test utilities and fixtures
- Jest configuration for different types of tests
- NPM scripts for running tests

### ⚠️ Known issues

1. **Validation in integration tests**: Some validation pipes do not work
2. **Authorization**: Returns 403 instead of 401 in some cases
3. **Email case sensitivity**: Email is not automatically converted to lowercase

### 🔄 Development plans

- Adding tests for new modules
- Setting up a CI/CD pipeline with automatic test launch
- Adding performance tests
- Integration with code quality analysis tools

## Debugging tests

### Launching a separate test

```bash
# Specific file
npm test -- users.service.spec.ts

# Specific test
npm test -- --testNamePattern="should create user"

# With debugging
npm run test:debug
```

### Logging in tests

```typescript
// Disable logging in tests
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

### Viewing the database

In integration tests, you can temporarily use a file-based SQLite database for debugging:

```typescript
// Вместо ':memory:'
database: './test.db',
```

## Conclusion

The testing system ensures the reliability and quality of the BIO Backend API. It covers all application levels from individual functions to complete user scenarios.

When adding new functionality, be sure to create appropriate tests at all necessary levels.