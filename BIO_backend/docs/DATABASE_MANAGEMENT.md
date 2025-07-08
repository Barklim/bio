# Управление Базой Данных - Миграции и Сидирование

## Содержание
- [Обзор](#обзор)
- [Настройка](#настройка)
- [Миграции](#миграции)
- [Сидирование (Seeds)](#сидирование-seeds)
- [Команды npm](#команды-npm)
- [Примеры использования](#примеры-использования)
- [Лучшие практики](#лучшие-практики)
- [Решение проблем](#решение-проблем)

## Обзор

Проект использует **TypeORM** для управления схемой базы данных через миграции и заполнения начальными данными через seeds. Это обеспечивает:
- Версионный контроль схемы БД
- Автоматическое развертывание изменений
- Консистентное состояние данных
- Простое тестирование и разработку

## Настройка

### Конфигурация окружения

Убедитесь, что в `.env` файле настроены переменные базы данных:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=bio_db

# Environment
NODE_ENV=development
```

### Структура файлов

```
src/database/
├── data-source.ts          # Конфигурация TypeORM
├── test-data-source.ts     # Конфигурация для тестов
├── migrations/             # Папка миграций
│   ├── 1703000000000-CreateUsersTable.ts
│   └── 1703100000000-AddUserRoles.ts
└── seeds/                  # Папка seeds
    ├── index.ts            # Главный файл seeds
    └── UserSeeder.ts       # Seeder пользователей
```

## Миграции

### Что такое миграции?

Миграции - это скрипты для изменения структуры базы данных, которые:
- Создают/удаляют таблицы
- Добавляют/удаляют колонки
- Изменяют индексы
- Модифицируют ограничения

### Создание новой миграции

#### Автоматическая генерация
```bash
# Генерирует миграцию на основе изменений в entities
npm run migration:generate -- src/database/migrations/DescriptionOfChange
```

#### Создание пустой миграции
```bash
# Создает пустую миграцию для ручного заполнения
npm run migration:create -- src/database/migrations/DescriptionOfChange
```

### Структура миграции

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1703000000000 implements MigrationInterface {
  name = 'CreateUsersTable1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Логика применения изменений
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          // Определение колонок
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Логика отката изменений
    await queryRunner.dropTable('users');
  }
}
```

### Управление миграциями

```bash
# Показать статус миграций
npm run migration:show

# Применить все неприменённые миграции
npm run migration:run

# Откатить последнюю миграцию
npm run migration:revert
```

## Сидирование (Seeds)

Seeds - это скрипты для заполнения базы данных начальными данными:
- Создание админ-пользователей
- Тестовые данные для разработки
- Справочная информация
- Настройки по умолчанию

### Структура seeder'а

```typescript
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(User);
    
    // Проверка существования данных
    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log('Data already exists, skipping...');
      return;
    }

    // Создание данных
    const users = repository.create([
      // Данные пользователей
    ]);

    await repository.save(users);
    console.log('✅ Users seeded successfully');
  }
}
```

### Добавление нового seeder'а

1. Создайте файл в `src/database/seeds/`:
```typescript
// src/database/seeds/RoleSeeder.ts
export class RoleSeeder {
  constructor(private dataSource: DataSource) {}
  
  async run(): Promise<void> {
    // Логика создания ролей
  }
}
```

2. Добавьте в `src/database/seeds/index.ts`:
```typescript
import { RoleSeeder } from './RoleSeeder';

export class DatabaseSeeder {
  async run(): Promise<void> {
    // Existing seeders...
    
    const roleSeeder = new RoleSeeder(this.dataSource);
    await roleSeeder.run();
  }
}
```

## Команды npm

### Миграции
```bash
# Создание миграций
npm run migration:generate -- src/database/migrations/MigrationName  # Автогенерация
npm run migration:create -- src/database/migrations/MigrationName    # Пустая миграция

# Управление миграциями
npm run migration:show     # Показать статус
npm run migration:run      # Применить миграции
npm run migration:revert   # Откатить последнюю

# Управление схемой (ОСТОРОЖНО!)
npm run schema:drop        # Удалить всю схему
npm run schema:sync        # Синхронизировать схему с entities
```

### Seeds
```bash
npm run seed:run          # Запустить все seeds
```

### Комбинированные команды
```bash
npm run db:setup          # migration:run + seed:run
npm run db:reset          # schema:drop + migration:run + seed:run
```

## Примеры использования

### 1. Первоначальная настройка БД
```bash
# Для новой базы данных
npm run migration:run
npm run seed:run

# Или одной командой
npm run db:setup
```

### 2. Добавление новой таблицы

1. Создайте entity:
```typescript
// src/entities/Product.entity.ts
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

2. Добавьте в data-source.ts:
```typescript
entities: [User, Product],
```

3. Сгенерируйте миграцию:
```bash
npm run migration:generate -- src/database/migrations/CreateProductsTable
```

4. Примените миграцию:
```bash
npm run migration:run
```

### 3. Полный сброс БД (для разработки)
```bash
npm run db:reset
```

### 4. Добавление тестовых данных

Создайте seeder и запустите:
```bash
npm run seed:run
```

## Лучшие практики

### Именование миграций
- Используйте описательные имена: `CreateUsersTable`, `AddEmailVerification`
- Формат: `YYYYMMDDHHMMSS-DescriptiveName.ts`
- Не изменяйте уже примененные миграции

### Написание миграций
- ✅ Всегда пишите методы `up` и `down`
- ✅ Тестируйте откат миграций
- ✅ Используйте транзакции для сложных операций
- ❌ Не удаляйте данные без резервного копирования
- ❌ Не изменяйте уже примененные миграции

### Seeds
- ✅ Проверяйте существование данных перед созданием
- ✅ Используйте идемпотентные операции
- ✅ Логируйте результаты выполнения
- ❌ Не полагайтесь на порядок выполнения seeds

### Работа в команде
- ✅ Координируйтесь при создании миграций
- ✅ Применяйте миграции перед пуллом изменений
- ✅ Тестируйте миграции на копии продакшн данных
- ❌ Не коммитьте неработающие миграции

## Решение проблем

### Ошибка подключения к БД
```
Error: connect ECONNREFUSED
```
**Решение:** Проверьте настройки БД в `.env` и убедитесь, что PostgreSQL запущен.

### Миграция не применяется
```
No migrations found
```
**Решение:** 
1. Проверьте путь к миграциям в `data-source.ts`
2. Убедитесь, что файлы миграций скомпилированы

### Ошибка в seeds
```
Cannot read property 'getRepository'
```
**Решение:** Убедитесь, что DataSource инициализирован перед выполнением seeds.

### Конфликт миграций
**Решение:**
1. Проверьте статус: `npm run migration:show`
2. Откатите конфликтную миграцию: `npm run migration:revert`
3. Исправьте конфликт и повторите применение

### Данные уже существуют в seeds
**Нормальное поведение** - seeds проверяют существование данных и пропускают создание.

## Переменные окружения

```env
# Обязательные
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=bio_db

# Опциональные
NODE_ENV=development          # development/production/test
TYPEORM_SYNCHRONIZE=false     # Автосинхронизация (только для dev!)
TYPEORM_LOGGING=true          # Логирование SQL запросов
```

⚠️ **Важно:** Никогда не используйте `synchronize: true` в продакшене!

## Дополнительные ресурсы

- [TypeORM Migrations](https://typeorm.io/migrations)
- [TypeORM CLI](https://typeorm.io/using-cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Примечание:** Всегда делайте резервную копию данных перед применением миграций в продакшене! 