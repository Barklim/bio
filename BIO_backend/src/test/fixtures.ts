import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { User } from '../users/entities/user.entity';

export class TestFixtures {
  static createUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
      email: faker.internet.email().toLowerCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      ...overrides,
    };
  }

  static registerDto(overrides: Partial<RegisterDto> = {}): RegisterDto {
    return {
      email: faker.internet.email().toLowerCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'TestPassword123!',
      ...overrides,
    };
  }

  static loginDto(overrides: Partial<LoginDto> = {}): LoginDto {
    return {
      email: faker.internet.email().toLowerCase(),
      password: 'TestPassword123!',
      ...overrides,
    };
  }

  static user(overrides: Partial<User> = {}): User {
    const user = new User();
    user.id = faker.number.int({ min: 1, max: 1000 });
    user.email = faker.internet.email().toLowerCase();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.isActive = true;
    user.createdAt = faker.date.past();
    user.updatedAt = faker.date.recent();
    
    return Object.assign(user, overrides);
  }

  static userWithPassword(password: string = 'TestPassword123!', overrides: Partial<User> = {}): User {
    const user = this.user(overrides);
    // Password will be hashed in tests when created
    (user as any).password = password;
    return user;
  }

  // Ready-made test data for common scenarios
  static readonly VALID_USER_DATA = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'TestPassword123!',
  };

  static readonly ADMIN_USER_DATA = {
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'AdminPassword123!',
  };

  static readonly INVALID_PASSWORDS = [
    '123',           // too short
    'password',      // no numbers or special characters
    '12345678',      // only numbers
    'PASSWORD',      // only letters
  ];

  static readonly INVALID_EMAILS = [
    'invalid-email',
    '@example.com',
    'test@',
    'test..test@example.com',
  ];
} 