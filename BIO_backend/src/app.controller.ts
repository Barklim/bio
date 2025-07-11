import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): string {
    return this.appService.getHealth();
  }

  @Get('version')
  @ApiOperation({ summary: 'Get application version' })
  @ApiResponse({ status: 200, description: 'Application version' })
  getVersion() {
    return this.appService.getVersion();
  }
} 