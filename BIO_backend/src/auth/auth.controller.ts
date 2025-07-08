import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account with email and password. Returns JWT token for immediate authentication.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: AuthResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: ['Email is required', 'Password must be at least 8 characters long'],
        error: 'Bad Request'
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'User with this email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registration request received for email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: AuthResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: ['Email is required', 'Password is required'],
        error: 'Bad Request'
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized'
      }
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login request received for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }
} 