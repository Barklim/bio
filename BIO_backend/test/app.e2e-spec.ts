import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { TestFixtures } from '../src/test/fixtures';
import { TestUtils } from '../src/test/test-utils';

describe('BIO Backend API (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        // Override database for testing
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Set global API prefix like in main.ts
    app.setGlobalPrefix('api/v1');
    
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // Clear database before each test
    await TestUtils.clearDatabase(dataSource);
    authToken = '';
    testUser = null;
  });

  afterAll(async () => {
    await TestUtils.closeDatabase(dataSource);
    await app.close();
  });

  describe('Application Health', () => {
    it('GET /api/v1 должен вернуть статус приложения', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1')
        .expect(200);

      expect(response.text).toBe('BIO Backend API is running!');
    });

    it('GET /api/v1/version должен вернуть версию приложения', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/version')
        .expect(200);

      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('BIO Backend API');
    });
  });

  describe('Complete User Journey', () => {
    it('полный сценарий: регистрация → логин → управление пользователями', async () => {
      // 1. New user registration
      const registerData = TestFixtures.registerDto();
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user.email).toBe(registerData.email);

      const firstToken = registerResponse.body.accessToken;
      const firstUserId = registerResponse.body.user.id;

      // 2. Login with the same data (receiving a new token)
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerData.email,
          password: registerData.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body.user.id).toBe(firstUserId);

      authToken = loginResponse.body.accessToken;

      // 3. Getting a list of users (protected endpoint)
      const usersResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(usersResponse.body).toHaveLength(1);
      expect(usersResponse.body[0].id).toBe(firstUserId);

      // 4. Getting a specific user
      const userResponse = await request(app.getHttpServer())
        .get(`/api/v1/users/${firstUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(userResponse.body.id).toBe(firstUserId);
      expect(userResponse.body.email).toBe(registerData.email);

      // 5. User update
      const updateData = { firstName: 'Updated Name' };
      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/v1/users/${firstUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.firstName).toBe('Updated Name');

      // 6. Creating an additional user (admin function)
      const newUserData = TestFixtures.createUserDto();
      const createUserResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUserData)
        .expect(201);

      expect(createUserResponse.body.email).toBe(newUserData.email);

      // 7. Checking that there are now two users
      const finalUsersResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalUsersResponse.body).toHaveLength(2);

      // 8. Removing the second user
      const secondUserId = createUserResponse.body.id;
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${secondUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 9. Checking that the user has been deleted
      const afterDeleteResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(afterDeleteResponse.body).toHaveLength(1);
    });
  });

  describe('Authentication Flow', () => {
    it('должен блокировать доступ к защищенным endpoint без токена', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(TestFixtures.createUserDto())
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/v1/users/1')
        .expect(401);

      await request(app.getHttpServer())
        .patch('/api/v1/users/1')
        .send({ firstName: 'Test' })
        .expect(401);

      await request(app.getHttpServer())
        .delete('/api/v1/users/1')
        .expect(401);
    });

    it('должен блокировать доступ с невалидным токеном', async () => {
      const invalidToken = 'invalid-jwt-token';

      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('должен разрешать доступ к публичным endpoint без токена', async () => {
      await request(app.getHttpServer())
        .get('/api/v1')
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/version')
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(TestFixtures.registerDto())
        .expect(201);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      // Register and log in to get a token
      const registerData = TestFixtures.registerDto();
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerData.email,
          password: registerData.password,
        })
        .expect(200);

      authToken = loginResponse.body.accessToken;
    });

    it('должен правильно обрабатывать ошибки валидации', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('должен обрабатывать ошибки 404', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('должен обрабатывать конфликты email (409)', async () => {
      const userData = TestFixtures.createUserDto();
      
      // Create a user for the first time
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      // Trying to create a user with the same email
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(409);

      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('Data Consistency', () => {
    beforeEach(async () => {
      // Register to receive a token
      const registerData = TestFixtures.registerDto();
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      authToken = registerResponse.body.accessToken;
      testUser = registerResponse.body.user;
    });

    it('пароли должны быть скрыты во всех ответах API', async () => {
      // Check that the password is not returned upon registration
      expect(testUser.password).toBeUndefined();

      // Check during login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: TestFixtures.registerDto().password,
        })
        .expect(200);

      expect(loginResponse.body.user.password).toBeUndefined();

      // Check when receiving the user
      const userResponse = await request(app.getHttpServer())
        .get(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(userResponse.body.password).toBeUndefined();

      // Check in the list of users
      const usersResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      usersResponse.body.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    it('email должен быть уникальным в системе', async () => {
      const email = 'unique@example.com';

      // Create the first user
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(TestFixtures.createUserDto({ email }))
        .expect(201);

      // Trying to create a second one with the same email
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(TestFixtures.createUserDto({ email }))
        .expect(409);

      // Should also work for registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(TestFixtures.registerDto({ email }))
        .expect(409);
    });

    it('timestamps должны обновляться корректно', async () => {
      const userData = TestFixtures.createUserDto();
      
      // Create a user
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      const createdAt = new Date(createResponse.body.createdAt);
      const initialUpdatedAt = new Date(createResponse.body.updatedAt);

      // Wait a bit and update the user
      await new Promise(resolve => setTimeout(resolve, 100));

      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/v1/users/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Updated' })
        .expect(200);

      const finalUpdatedAt = new Date(updateResponse.body.updatedAt);

      // createdAt should not change
      expect(new Date(updateResponse.body.createdAt)).toEqual(createdAt);
      
      // updatedAt must be later
      expect(finalUpdatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });
  });

  describe('API Response Format', () => {
    beforeEach(async () => {
      const registerData = TestFixtures.registerDto();
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      authToken = registerResponse.body.accessToken;
    });

    it('все пользовательские объекты должны иметь одинаковую структуру', async () => {
      const expectedUserStructure = {
        id: expect.any(Number),
        email: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        isActive: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      // Create a user
      const userData = TestFixtures.createUserDto();
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(createResponse.body).toMatchObject(expectedUserStructure);

      // Get the user
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/users/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body).toMatchObject(expectedUserStructure);

      // Check in the list
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      listResponse.body.forEach(user => {
        expect(user).toMatchObject(expectedUserStructure);
      });
    });

    it('JWT ответы должны иметь правильную структуру', async () => {
      const expectedAuthStructure = {
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: expect.any(Number),
        user: expect.any(Object),
      };

      // Check the structure during registration
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(TestFixtures.registerDto())
        .expect(201);

      expect(registerResponse.body).toMatchObject(expectedAuthStructure);

      // Check the structure when logging in
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerResponse.body.user.email,
          password: TestFixtures.registerDto().password,
        })
        .expect(200);

      expect(loginResponse.body).toMatchObject(expectedAuthStructure);
    });
  });
}); 