## BIO_backend

#### Done

- ✅ Init project
- ✅ Swagger descriptions
- ✅ Tests
- ⌛ Ci/CD github.yaml

#### Todo

- Roles Guard
- Extract api to npm for Bff 🤔
- Redis for tokens
- Refresh token, 2fa
- Pagination format:

```bash
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

## BIO_mobile

#### Done

- Install additional dependencies (React Query, AsyncStorage)
- Configure environment variables for API
- Create project structure according to FSD principles
- Create TypeScript types for API
- Implement API services
- Create Context for authentication
- Create reusable UI components
- Create registration and authorization screens
- Create a user list screen
- Configure navigation with protected routes
- Zod for validations
- ⌛ Zod for envs

#### Todo

- Fix java version and node issue on Android
- Еrror handling from backend
- Update packages which one alerting in Metro Bundler
- Theme Provider, Composed provider for flat providers
- Splash screen
- Configure steiger for FSD 🤔