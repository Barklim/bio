import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { TestFixtures } from '../test/fixtures';
import { TestUtils } from '../test/test-utils';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [User],
            synchronize: true,
            logging: false,
            dropSchema: true,
          }),
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    dataSource = module.get<DataSource>(DataSource);

    // Clear database before each test
    await TestUtils.clearDatabase(dataSource);
  });

  afterEach(async () => {
    await TestUtils.clearDatabase(dataSource);
    await app.close();
  });

  afterAll(async () => {
    await TestUtils.closeDatabase(dataSource);
  });

  describe('POST /auth/register', () => {
    it('должен успешно зарегистрировать нового пользователя', async () => {
      const registerDto = TestFixtures.registerDto();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: expect.any(Number),
        user: {
          id: expect.any(Number),
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          isActive: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
      expect(response.body.user.password).toBeUndefined();
    });

    it('должен вернуть 409 при попытке регистрации с существующим email', async () => {
      const registerDto = TestFixtures.registerDto();
      
      // Registering a user for the first time
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Trying to register a user with the same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);

      expect(response.body.message).toBe('User with this email already exists');
    });

    it('должен вернуть 400 при невалидных данных регистрации', async () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
        password: '123', // password is too short
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('должен вернуть 400 при отсутствии обязательных полей', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // firstName, lastName, password are missing
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await usersService.createWithPassword(TestFixtures.VALID_USER_DATA);
    });

    it('должен успешно авторизовать пользователя с правильными данными', async () => {
      const loginDto = {
        email: TestFixtures.VALID_USER_DATA.email,
        password: TestFixtures.VALID_USER_DATA.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: expect.any(Number),
        user: {
          id: expect.any(Number),
          email: loginDto.email,
          firstName: TestFixtures.VALID_USER_DATA.firstName,
          lastName: TestFixtures.VALID_USER_DATA.lastName,
          isActive: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
      expect(response.body.user.password).toBeUndefined();
    });

    it('должен вернуть 401 при неверном email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: TestFixtures.VALID_USER_DATA.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('должен вернуть 401 при неверном пароле', async () => {
      const loginDto = {
        email: TestFixtures.VALID_USER_DATA.email,
        password: 'wrong-password',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('должен вернуть 400 при невалидных данных', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidData)
        .expect(400);
    });

    it('должен вернуть 400 при отсутствии обязательных полей', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // password missing
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('JWT Token validation', () => {
    it('сгенерированный токен должен быть валидным', async () => {
      const registerDto = TestFixtures.registerDto();

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const token = registerResponse.body.accessToken;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(100); // JWT tokens are quite long
    });

    it('должен вернуть один и тот же пользователь при логине после регистрации', async () => {
      const registerDto = TestFixtures.registerDto();

      // Registration
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Login with the same data
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(200);

      expect(registerResponse.body.user.id).toBe(loginResponse.body.user.id);
      expect(registerResponse.body.user.email).toBe(loginResponse.body.user.email);
    });
  });

  describe('Password security', () => {
    it('пароли должны хешироваться при регистрации', async () => {
      const registerDto = TestFixtures.registerDto();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Check that the password is not stored in the database in clear text
      const user = await usersService.findByEmailWithPassword(registerDto.email);
      expect(user?.password).toBeDefined();
      expect(user?.password).not.toBe(registerDto.password);
      expect(user?.password.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('должен отклонять простые пароли', async () => {
      const weakPasswords = TestFixtures.INVALID_PASSWORDS;

      for (const weakPassword of weakPasswords) {
        const registerDto = TestFixtures.registerDto({ password: weakPassword });

        await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(400);
      }
    });
  });

  describe('Email validation', () => {
    it('должен отклонять невалидные email адреса', async () => {
      const invalidEmails = TestFixtures.INVALID_EMAILS;

      for (const invalidEmail of invalidEmails) {
        const registerDto = TestFixtures.registerDto({ email: invalidEmail });

        await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(400);
      }
    });

    it('email должен быть нечувствителен к регистру', async () => {
      const registerDto = TestFixtures.registerDto({ 
        email: 'Test@Example.Com' 
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Email should be saved in lowercase
      expect(response.body.user.email).toBe('test@example.com');

      // Login should work with any case
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: registerDto.password,
        })
        .expect(200);
    });
  });
}); 