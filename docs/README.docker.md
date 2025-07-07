## 🐳 Docker commands

```bash
# Build image
docker build -t bio-backend .

# Stop all containers
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs of a specific service
docker-compose logs -f api
docker-compose logs -f postgres

# Clean volumes (WARNING: will delete all data)
docker-compose down -v
```