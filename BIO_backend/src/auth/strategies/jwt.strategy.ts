import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      this.logger.debug(`Validating JWT token for user ID: ${payload.sub}`);

      // Critical: Always check if user exists in database
      const user = await this.authService.validateUser(payload.sub);
      
      if (!user) {
        this.logger.warn(`JWT validation failed: User not found or inactive for ID: ${payload.sub}`);
        throw new UnauthorizedException('Invalid token: User not found or inactive');
      }

      // Verify token payload matches current user data
      if (user.email !== payload.email) {
        this.logger.warn(`JWT validation failed: Email mismatch for user ID: ${payload.sub}`);
        throw new UnauthorizedException('Invalid token: User data mismatch');
      }

      this.logger.debug(`JWT validation successful for user: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }
} 