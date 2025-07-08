import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  Logger,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        this.logger.warn(`Attempt to create user with existing email: ${createUserDto.email}`);
        throw new ConflictException('User with this email already exists');
      }

      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createWithPassword(registerDto: RegisterDto): Promise<User> {
    try {
      const existingUser = await this.findByEmail(registerDto.email);
      if (existingUser) {
        this.logger.warn(`Registration attempt with existing email: ${registerDto.email}`);
        throw new ConflictException('User with this email already exists');
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

      const user = this.usersRepository.create({
        ...registerDto,
        password: hashedPassword,
      });

      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`User registered successfully with ID: ${savedUser.id}`);
      
      return savedUser;
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find({
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt']
      });
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ 
        where: { id },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt']
      });
      
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding user with ID ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to find user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ 
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName', 'password', 'isActive', 'createdAt', 'updatedAt']
      });
    } catch (error) {
      this.logger.error(`Error finding user by email with password: ${error.message}`, error.stack);
      return null;
    }
  }

  async validateUserPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmailWithPassword(email);
      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${email}`);
        return null;
      }

      if (!user.isActive) {
        this.logger.warn(`Login attempt with inactive user: ${email}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for user: ${email}`);
        return null;
      }

      // Remove password from returned user object
      // TODO: create public, private data func
      delete user.password;
      return user;
    } catch (error) {
      this.logger.error(`Error validating user password: ${error.message}`, error.stack);
      return null;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOne(id);
      
      // Check email uniqueness if email is being updated
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.findByEmail(updateUserDto.email);
        if (existingUser) {
          this.logger.warn(`Update attempt with existing email: ${updateUserDto.email}`);
          throw new ConflictException('User with this email already exists');
        }
      }

      Object.assign(user, updateUserDto);
      const updatedUser = await this.usersRepository.save(user);
      
      this.logger.log(`User updated successfully with ID: ${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error updating user with ID ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.findOne(id);
      await this.usersRepository.remove(user);
      
      this.logger.log(`User deleted successfully with ID: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting user with ID ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete user');
    }
  }
} 