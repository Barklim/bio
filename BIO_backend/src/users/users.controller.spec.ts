import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestFixtures } from '../test/fixtures';
import { TestUtils } from '../test/test-utils';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let dataSource: DataSource;

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
      imports: [
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
      ],
    });

    // Override the JWT guard for testing
    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(mockJwtAuthGuard);

    const module = await moduleBuilder.compile();

    app = module.createNestApplication();
    await app.init();

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

  describe('POST /users', () => {
    it('должен создать нового пользователя', async () => {
      const createUserDto = TestFixtures.createUserDto();

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(response.body.password).toBeUndefined();
    });

    it('должен вернуть 409 при попытке создать пользователя с существующим email', async () => {
      const createUserDto = TestFixtures.createUserDto();
      
      // Create a user for the first time
      await usersService.create(createUserDto);

      // Trying to create a user with the same email
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409);

      expect(response.body.message).toBe('User with this email already exists');
    });

    it('должен вернуть 400 при невалидных данных', async () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('должен вернуть список всех пользователей', async () => {
      const users = [
        await usersService.create(TestFixtures.createUserDto()),
        await usersService.create(TestFixtures.createUserDto()),
      ];

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: users[0].id,
        email: users[0].email,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
      });
    });

    it('должен вернуть пустой массив если пользователей нет', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('должен требовать авторизацию', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      await request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('должен вернуть пользователя по ID', async () => {
      const user = await usersService.create(TestFixtures.createUserDto());

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    });

    it('должен вернуть 404 если пользователь не найден', async () => {
      await request(app.getHttpServer())
        .get('/users/999')
        .expect(404);
    });

    it('должен вернуть 400 для невалидного ID', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid')
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('должен обновить пользователя', async () => {
      const user = await usersService.create(TestFixtures.createUserDto());
      const updateData = { firstName: 'Updated Name' };

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe('Updated Name');
      expect(response.body.id).toBe(user.id);
    });

    it('должен вернуть 404 если пользователь не найден', async () => {
      const updateData = { firstName: 'Updated Name' };

      await request(app.getHttpServer())
        .patch('/users/999')
        .send(updateData)
        .expect(404);
    });

    it('должен вернуть 409 при попытке обновить email на существующий', async () => {
      const user1 = await usersService.create(TestFixtures.createUserDto());
      const user2 = await usersService.create(TestFixtures.createUserDto());

      await request(app.getHttpServer())
        .patch(`/users/${user1.id}`)
        .send({ email: user2.email })
        .expect(409);
    });
  });

  describe('DELETE /users/:id', () => {
    it('должен удалить пользователя', async () => {
      const user = await usersService.create(TestFixtures.createUserDto());

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(200);

      // Check that the user is actually deleted
      await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(404);
    });

    it('должен вернуть 404 если пользователь не найден', async () => {
      await request(app.getHttpServer())
        .delete('/users/999')
        .expect(404);
    });
  });

  describe('Authorization', () => {
    beforeEach(() => {
      // Reset mock to require authorization
      mockJwtAuthGuard.canActivate.mockReturnValue(true);
    });

    it('все endpoint должны требовать авторизацию', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      await request(app.getHttpServer()).get('/users').expect(401);
      await request(app.getHttpServer()).post('/users').expect(401);
      await request(app.getHttpServer()).get('/users/1').expect(401);
      await request(app.getHttpServer()).patch('/users/1').expect(401);
      await request(app.getHttpServer()).delete('/users/1').expect(401);
    });

    it('должен пропускать запросы с валидной авторизацией', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(true);

      // These requests must pass guard (but may return other errors)
      await request(app.getHttpServer()).get('/users').expect(200);
      await request(app.getHttpServer()).get('/users/999').expect(404); // Not found, but passed auth
    });
  });
}); 