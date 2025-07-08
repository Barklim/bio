import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TestFixtures } from '../test/fixtures';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUsersService = {
    createWithPassword: jest.fn(),
    validateUserPassword: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default config values
    configService.get.mockReturnValue('1h');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('должен успешно зарегистрировать пользователя и вернуть токен', async () => {
      const registerDto: RegisterDto = TestFixtures.registerDto();
      const mockUser = TestFixtures.user({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
      const mockToken = 'mock-jwt-token';

      usersService.createWithPassword.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await authService.register(registerDto);

      expect(usersService.createWithPassword).toHaveBeenCalledWith(registerDto);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
      expect(result).toEqual({
        accessToken: mockToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: mockUser,
      });
    });

    it('должен логировать успешную регистрацию', async () => {
      const registerDto: RegisterDto = TestFixtures.registerDto();
      const mockUser = TestFixtures.user();
      const mockToken = 'mock-jwt-token';

      usersService.createWithPassword.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await authService.register(registerDto);

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe(mockToken);
    });

    it('должен пробросить ошибку при сбое регистрации', async () => {
      const registerDto: RegisterDto = TestFixtures.registerDto();
      const error = new Error('Registration failed');

      usersService.createWithPassword.mockRejectedValue(error);

      await expect(authService.register(registerDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('должен успешно авторизовать пользователя с правильными данными', async () => {
      const loginDto: LoginDto = TestFixtures.loginDto();
      const mockUser = TestFixtures.user({
        email: loginDto.email,
      });
      const mockToken = 'mock-jwt-token';

      usersService.validateUserPassword.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await authService.login(loginDto);

      expect(usersService.validateUserPassword).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
      expect(result).toEqual({
        accessToken: mockToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: mockUser,
      });
    });

    it('должен выбросить UnauthorizedException если пользователь не найден', async () => {
      const loginDto: LoginDto = TestFixtures.loginDto();

      usersService.validateUserPassword.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.validateUserPassword).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('должен пробросить ошибку при сбое авторизации', async () => {
      const loginDto: LoginDto = TestFixtures.loginDto();
      const error = new Error('Database error');

      usersService.validateUserPassword.mockRejectedValue(error);

      await expect(authService.login(loginDto)).rejects.toThrow(error);
    });
  });



  describe('validateUser', () => {
    it('должен вернуть пользователя по ID если пользователь активен', async () => {
      const userId = 1;
      const mockUser = TestFixtures.user({ id: userId, isActive: true });

      usersService.findOne.mockResolvedValue(mockUser);

      const result = await authService.validateUser(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('должен вернуть null если пользователь не найден', async () => {
      const userId = 999;

      usersService.findOne.mockResolvedValue(null);

      const result = await authService.validateUser(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('должен вернуть null если пользователь неактивен', async () => {
      const userId = 1;
      const mockUser = TestFixtures.user({ id: userId, isActive: false });

      usersService.findOne.mockResolvedValue(mockUser);

      const result = await authService.validateUser(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('должен вернуть null при ошибке поиска пользователя', async () => {
      const userId = 1;
      const error = new Error('Database error');

      usersService.findOne.mockRejectedValue(error);

      const result = await authService.validateUser(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });
}); 