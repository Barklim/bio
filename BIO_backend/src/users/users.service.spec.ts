import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { TestFixtures } from '../test/fixtures';

// Mock bcrypt
jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

        const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('должен создать пользователя успешно', async () => {
      const createUserDto: CreateUserDto = TestFixtures.createUserDto();
      const mockUser = TestFixtures.user(createUserDto);

      repository.findOne.mockResolvedValue(null); // Email не существует
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('должен выбросить ConflictException если email уже существует', async () => {
      const createUserDto: CreateUserDto = TestFixtures.createUserDto();
      const existingUser = TestFixtures.user({ email: createUserDto.email });

      repository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('должен пробросить ошибку при сбое создания пользователя', async () => {
      const createUserDto: CreateUserDto = TestFixtures.createUserDto();
      const error = new Error('Database error');

      repository.findOne.mockResolvedValue(null);
      repository.save.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(error);
    });
  });

  describe('createWithPassword', () => {
    it('должен создать пользователя с хешированным паролем', async () => {
      const registerDto: RegisterDto = TestFixtures.registerDto();
      const hashedPassword = 'hashed-password';
      const mockUser = TestFixtures.user({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });

      repository.findOne.mockResolvedValue(null); // Email не существует
      bcryptMock.hash.mockResolvedValue(hashedPassword as never);
      repository.create.mockReturnValue(mockUser);
      
      // Return the user WITHOUT a password (since createWithPassword removes the password)
      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;
      repository.save.mockResolvedValue(userWithoutPassword);

      const result = await service.createWithPassword(registerDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcryptMock.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(repository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
      });
      expect(result.password).toBeUndefined(); // Password должен быть удален
    });

    it('должен выбросить ConflictException если email уже существует', async () => {
      const registerDto: RegisterDto = TestFixtures.registerDto();
      const existingUser = TestFixtures.user({ email: registerDto.email });

      repository.findOne.mockResolvedValue(existingUser);

      await expect(service.createWithPassword(registerDto)).rejects.toThrow(ConflictException);
      expect(bcryptMock.hash).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('должен вернуть массив пользователей', async () => {
      const mockUsers = [
        TestFixtures.user(),
        TestFixtures.user(),
      ];

      repository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('должен выбросить BadRequestException при сбое получения пользователей', async () => {
      const error = new Error('Database error');
      repository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('findOne', () => {
    it('должен вернуть пользователя по ID', async () => {
      const mockUser = TestFixtures.user();
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockUser);
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      const userId = 999;
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt'],
      });
    });
  });

  describe('findByEmail', () => {
    it('должен вернуть пользователя по email', async () => {
      const mockUser = TestFixtures.user();
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('должен вернуть null если пользователь не найден', async () => {
      const email = 'nonexistent@example.com';
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('должен вернуть пользователя с паролем', async () => {
      const mockUser = TestFixtures.userWithPassword();
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmailWithPassword(mockUser.email);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        select: ['id', 'email', 'firstName', 'lastName', 'password', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(mockUser);
    });

    it('должен вернуть null если пользователь не найден', async () => {
      const email = 'nonexistent@example.com';
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmailWithPassword(email);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('должен обновить пользователя успешно', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { firstName: 'Updated Name' };
      const existingUser = TestFixtures.user({ id: userId });
      const updatedUser = { ...existingUser, ...updateUserDto };

      repository.findOne.mockResolvedValue(existingUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(repository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      const userId = 999;
      const updateUserDto: UpdateUserDto = { firstName: 'Updated Name' };

      // Mock findOne to throw NotFoundException when user not found
      repository.findOne.mockRejectedValue(new NotFoundException(`User with ID ${userId} not found`));

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен удалить пользователя успешно', async () => {
      const userId = 1;
      const existingUser = TestFixtures.user({ id: userId });

      repository.findOne.mockResolvedValue(existingUser);
      repository.remove.mockResolvedValue(existingUser);

      await service.remove(userId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt'],
      });
      expect(repository.remove).toHaveBeenCalledWith(existingUser);
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      const userId = 999;

      repository.findOne.mockRejectedValue(new NotFoundException(`User with ID ${userId} not found`));

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
}); 