import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed...');
      return;
    }

    console.log('Seeding users...');

    // Create admin user
    const adminPassword = await bcrypt.hash('AdminPassword123!', 12);
    const adminUser = userRepository.create({
      email: 'admin@bio.com',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      isActive: true,
    });

    // Create test users
    const testPassword = await bcrypt.hash('TestPassword123!', 12);
    const testUsers = [
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: testPassword,
        isActive: true,
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: testPassword,
        isActive: true,
      },
      {
        email: 'bob.wilson@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        password: testPassword,
        isActive: false, // Inactive user for testing
      },
      {
        email: 'alice.johnson@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        password: testPassword,
        isActive: true,
      },
      {
        email: 'charlie.brown@example.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        password: testPassword,
        isActive: true,
      },
    ];

    const users = testUsers.map(userData => userRepository.create(userData));

    try {
      // Save admin user
      await userRepository.save(adminUser);
      console.log('✅ Admin user created: admin@bio.com');

      // Save test users
      await userRepository.save(users);
      console.log(`✅ ${users.length} test users created`);

      console.log('🎉 User seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding users:', error);
      throw error;
    }
  }
} 