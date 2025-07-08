# Управление БД

## Первый запуск проекта

```bash
# 1. Настройте .env файл
cp env.template .env
# Отредактируйте DB_* переменные

# 2. Запустите базу данных
docker-compose up -d postgres

# 3. Настройте БД
npm run db:setup
```

## 📋 Основные команды

### Миграции
```bash
npm run migration:run        # Применить миграции
npm run migration:show       # Показать статус
npm run migration:revert     # Откатить последнюю
```

### Seeds (Начальные данные)
```bash
npm run seed:run            # Заполнить БД данными
```

### Комбинированные
```bash
npm run db:setup            # migration:run + seed:run
npm run db:reset            # Сброс + настройка
```

## 🛠️ Разработка

### Создание миграции
```bash
# Автоматическая генерация
npm run migration:generate -- src/database/migrations/AddNewFeature

# Пустая миграция
npm run migration:create -- src/database/migrations/CustomChanges
```

### Работа с данными
```bash
# Заполнить тестовыми данными
npm run seed:run

# Сбросить и пересоздать
npm run db:reset
```

## Созданные пользователи

После выполнения `npm run seed:run`:

| Email | Пароль | Статус |
|-------|--------|--------|
| admin@bio.com | AdminPassword123! | Активный |
| john.doe@example.com | TestPassword123! | Активный |
| jane.smith@example.com | TestPassword123! | Активный |
| bob.wilson@example.com | TestPassword123! | Неактивный |
| alice.johnson@example.com | TestPassword123! | Активный |
| charlie.brown@example.com | TestPassword123! | Активный |

## ⚠️ Важно

- **НЕ используйте** `npm run db:reset` в продакшене!
- Всегда делайте бэкап перед миграциями в продакшене
- Тестируйте миграции на копии данных

## 📖 Подробная документация

См. [DATABASE_MANAGEMENT.md](./DATABASE_MANAGEMENT.md) для полной документации. 