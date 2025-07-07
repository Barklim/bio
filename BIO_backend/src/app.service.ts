import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): string {
    return 'BIO Backend API is running!';
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'BIO Backend API',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
} 