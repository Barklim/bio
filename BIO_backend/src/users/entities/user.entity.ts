import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @Column()
  lastName: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  password: string;

  @ApiProperty({ description: 'User status', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'User creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
} 