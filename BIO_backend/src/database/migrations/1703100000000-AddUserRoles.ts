import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserRoles1703100000000 implements MigrationInterface {
  name = 'AddUserRoles1703100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        length: '50',
        default: "'user'",
        isNullable: false,
        comment: 'User role: admin, user, moderator',
      }),
    );

    // Add last login tracking
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'lastLoginAt',
        type: 'timestamp',
        isNullable: true,
        comment: 'Last login timestamp',
      }),
    );

    // Add email verification
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'emailVerified',
        type: 'boolean',
        default: false,
        isNullable: false,
        comment: 'Email verification status',
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'emailVerifiedAt',
        type: 'timestamp',
        isNullable: true,
        comment: 'Email verification timestamp',
      }),
    );

    console.log('✅ Added user roles and verification columns');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'emailVerifiedAt');
    await queryRunner.dropColumn('users', 'emailVerified');
    await queryRunner.dropColumn('users', 'lastLoginAt');
    await queryRunner.dropColumn('users', 'role');

    console.log('✅ Removed user roles and verification columns');
  }
} 