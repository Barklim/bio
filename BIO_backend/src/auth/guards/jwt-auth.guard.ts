import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      this.logger.warn(`JWT authentication failed: ${err?.message || info?.message || 'No token provided'}`);
      throw new UnauthorizedException('Access denied. Valid JWT token required.');
    }
    
    this.logger.debug(`JWT authentication successful for user: ${user.email}`);
    return user;
  }
} 