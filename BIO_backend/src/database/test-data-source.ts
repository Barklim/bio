import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [User],
  synchronize: true,
  logging: false,
  dropSchema: true,
});

export const createTestDataSource = async (): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [User],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });

  await dataSource.initialize();
  return dataSource;
}; 