import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { UserSeeder } from './UserSeeder';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      // Run User seeder
      const userSeeder = new UserSeeder(this.dataSource);
      await userSeeder.run();

      // Add more seeders here as needed
      // const roleSeeder = new RoleSeeder(this.dataSource);
      // await roleSeeder.run();

      console.log('🎉 All seeders completed successfully!');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }
}

// Script to run seeds from command line
async function runSeeds() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const seeder = new DatabaseSeeder(AppDataSource);
    await seeder.run();

    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
} 