## Database management

### pgAdmin (web interface)
When running via Docker Compose, pgAdmin is available:
- **URL**: http://localhost:5050
- **Email**: admin@bio.com
- **Password**: admin

### Connecting to PostgreSQL
- **Host**: localhost (or postgres in Docker)
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: bio_db

### TypeORM Migrations

```bash
# Migration generation
npm run migration:generate -- src/migrations/MigrationName

# Launch migrations
npm run migration:run

# Migration rollback
npm run migration:revert
```