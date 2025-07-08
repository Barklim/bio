import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createTestDataSource } from '../database/test-data-source';
import { User } from '../users/entities/user.entity';

export class TestUtils {
  static async createTestModule(providers: any[] = [], imports: any[] = []): Promise<TestingModule> {
    const testDataSource = await createTestDataSource();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [User],
            synchronize: true,
            logging: false,
            dropSchema: true,
          }),
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        ...imports,
      ],
      providers: [
        {
          provide: DataSource,
          useValue: testDataSource,
        },
        ...providers,
      ],
    }).compile();

    return module;
  }

  static async clearDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  static async closeDatabase(dataSource: DataSource): Promise<void> {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
} 