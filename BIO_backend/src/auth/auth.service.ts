import { 
  Injectable, 
  UnauthorizedException, 
  Logger,
  BadRequestException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Registration attempt for email: ${registerDto.email}`);

      const user = await this.usersService.createWithPassword(registerDto);
      const tokens = await this.generateTokens(user);

      this.logger.log(`User registered and logged in successfully: ${user.id}`);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Login attempt for email: ${loginDto.email}`);

      const user = await this.usersService.validateUserPassword(
        loginDto.email,
        loginDto.password,
      );

      if (!user) {
        this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const tokens = await this.generateTokens(user);

      this.logger.log(`User logged in successfully: ${user.id}`);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(`Login failed for ${loginDto.email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateUser(userId: number): Promise<User | null> {
    try {
      const user = await this.usersService.findOne(userId);
      
      if (!user || !user.isActive) {
        this.logger.warn(`Token validation failed for user ID: ${userId}`);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`User validation failed for ID ${userId}: ${error.message}`, error.stack);
      return null;
    }
  }

  private async generateTokens(user: User): Promise<Omit<AuthResponseDto, 'user'>> {
    try {
      const payload = { 
        sub: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      };

      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.getExpirationInSeconds(expiresIn),
      };
    } catch (error) {
      this.logger.error(`Token generation failed for user ${user.id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate authentication token');
    }
  }

  private getExpirationInSeconds(expiresIn: string): number {
    // Parse expiration string (e.g., "1h", "30m", "3600s")
    const match = expiresIn.match(/^(\d+)([hms])$/);
    if (!match) {
      return 3600; // Default 1 hour
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h':
        return value * 3600;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        return 3600;
    }
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
} 