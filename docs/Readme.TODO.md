### BIO_backend

#### Done

- ✅ Init project
- ✅ Swagger descriptions
- ✅ Tests
- ⌛ Ci/CD github.yaml

#### Plans for the future

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

### BIO_mobile

- ⌛ Add Rect Query
- ⌛ Zod for validations