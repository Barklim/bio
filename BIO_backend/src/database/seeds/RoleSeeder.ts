import { DataSource } from 'typeorm';

// Example of seeder for working with roles
// Shows how to work with reference data
export class RoleSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    // Example of working with raw SQL to create reference data
    console.log('Seeding roles and permissions...');

    try {
      // Check for existence of role table (if it exists)
      const hasRolesTable = await this.checkTableExists('roles');
      
      if (hasRolesTable) {
        await this.seedRoles();
        await this.seedPermissions();
        await this.seedRolePermissions();
      } else {
        console.log('ℹ️  Roles table does not exist, skipping role seeding');
      }

      console.log('✅ Role seeding completed');
    } catch (error) {
      console.error('❌ Error seeding roles:', error);
      throw error;
    }
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      await this.dataSource.query(`SELECT 1 FROM ${tableName} LIMIT 1`);
      return true;
    } catch {
      return false;
    }
  }

  private async seedRoles(): Promise<void> {
    const existingRoles = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM roles'
    );

    if (existingRoles[0].count > 0) {
      console.log('Roles already exist, skipping...');
      return;
    }

    const roles = [
      { name: 'admin', description: 'System Administrator' },
      { name: 'user', description: 'Regular User' },
      { name: 'moderator', description: 'Content Moderator' },
      { name: 'guest', description: 'Guest User' },
    ];

    for (const role of roles) {
      await this.dataSource.query(
        'INSERT INTO roles (name, description, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        [role.name, role.description]
      );
    }

    console.log(`✅ ${roles.length} roles created`);
  }

  private async seedPermissions(): Promise<void> {
    const existingPermissions = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM permissions'
    );

    if (existingPermissions[0].count > 0) {
      console.log('Permissions already exist, skipping...');
      return;
    }

    const permissions = [
      { name: 'users:read', description: 'Read users' },
      { name: 'users:write', description: 'Create/Update users' },
      { name: 'users:delete', description: 'Delete users' },
      { name: 'admin:access', description: 'Access admin panel' },
      { name: 'content:moderate', description: 'Moderate content' },
    ];

    for (const permission of permissions) {
      await this.dataSource.query(
        'INSERT INTO permissions (name, description, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        [permission.name, permission.description]
      );
    }

    console.log(`✅ ${permissions.length} permissions created`);
  }

  private async seedRolePermissions(): Promise<void> {
    const existingRolePermissions = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM role_permissions'
    );

    if (existingRolePermissions[0].count > 0) {
      console.log('Role permissions already exist, skipping...');
      return;
    }

    // Получаем ID ролей и разрешений
    const roles = await this.dataSource.query('SELECT id, name FROM roles');
    const permissions = await this.dataSource.query('SELECT id, name FROM permissions');

    const rolePermissionMap = {
      admin: ['users:read', 'users:write', 'users:delete', 'admin:access', 'content:moderate'],
      moderator: ['users:read', 'content:moderate'],
      user: ['users:read'],
      guest: [],
    };

    let assignedCount = 0;

    for (const role of roles) {
      const permissionNames = rolePermissionMap[role.name] || [];
      
      for (const permissionName of permissionNames) {
        const permission = permissions.find(p => p.name === permissionName);
        if (permission) {
          await this.dataSource.query(
            'INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ($1, $2, NOW())',
            [role.id, permission.id]
          );
          assignedCount++;
        }
      }
    }

    console.log(`✅ ${assignedCount} role-permission assignments created`);
  }
} 