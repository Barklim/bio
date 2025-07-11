# BIO

Simple MVP based on [Nest](https://nestjs.com/) and [React Native + Expo](https://expo.dev/)

- [Backend](https://github.com/Barklim/bio/tree/main/BIO_backend)
- [Mobile](https://github.com/Barklim/bio/tree/main/BIO_mobile)

### Docs

- [TODO](https://github.com/Barklim/bio/blob/main/docs/Readme.TODO.md)
- [Commit conventions](https://github.com/Barklim/bio/blob/main/docs/README.conventions.md)
- [Docker commands](https://github.com/Barklim/bio/blob/main/docs/README.docker.md)
- [Backend tests](https://github.com/Barklim/bio/blob/main/BIO_backend/docs/Readme.TESTING.md)
- [Backend db management](https://github.com/Barklim/bio/blob/main/BIO_backend/docs/DATABASE_MANAGMENT_IN_SHORT.md)

### Quick start

```bash
git clone https://github.com/Barklim/bio.git

cd BIO_backend

cp env.template .env

# Start all services (API + PostgreSQL + pgAdmin)
docker compose up -d

# Run in development mode with hot reload
docker compose -f docker-compose.dev.yml up -d

npm run db:setup
```

### Api

- Postman [collection](https://github.com/Barklim/bio/blob/main/assets/_Biocad.postman_collection.json)
- [Readme.api.md](https://github.com/Barklim/bio/blob/main/docs/Readme.api.md)

| Login | Register | Users | User |
| ------------- | ----------------- | ----------------- | ----------------- |
|![login](https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/screen1.png)|![register](https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/screen2.png)|![users](https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/screen3.png)|![user](https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/screen4.png)|

## React Native stack

- **React Native** - is an UI software framework
- **Expo** - is a framework and platform for universal React applications, React Native based
- **TypeScript** - typed JavaScript
- **FSD** - is an architectural methodology for scaffolding front-end applications
- **Tanstack query** - asynchronous state management
- **Async Storage** - persistent token storage
- **React Navigation** - Routing and navigation for React Native and Web apps
- **Zod** - TypeScript-first schema validation with static type inference


<div align="center">

[<img title="react native" alt="react native" height=48 src="https://raw.githubusercontent.com/Barklim/bio/ce974a5db1b25729429c5f3dd666f3f778b4ee10/assets/reactnative.svg"/>](https://reactnative.dev/)
[<img title="expo" alt="expo" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/expo.png"/>](https://expo.dev/)
[<img title="typescript" alt="typescript" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/ts.png"/>](https://www.typescriptlang.org/)
[<img title="fsd" alt="fsd" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/fsd.png"/>](https://feature-sliced.design/docs/get-started/overview)
[<img title="tanstack query" alt="tanstack query" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/query.jpeg"/>](https://tanstack.com/query/latest)
[<img title="async storage" alt="async storage" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/asyncStorage.png"/>](https://github.com/react-native-async-storage/async-storage)
[<img title="react navigation" alt="react navigation" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/reactnavigation.png"/>](https://reactnavigation.org/)
[<img title="zod" alt="zod" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/zod.svg"/>](https://github.com/colinhacks/zod)
</div>

## Backend stack

- **NestJS** - progressive Node.js framework
- **TypeScript** - typed JavaScript
- **PostgreSQL** - relational database
- **PgAdmin** - PostgreSQL Tools
- **TypeORM** - ORM for TypeScript
- **Swagger** - automatic API documentation
- **Docker** - application containerization
- **Class Validator** - data validation

<div align="center">

[<img title="nestjs" alt="nestjs" height=48 src="https://raw.githubusercontent.com/Barklim/bio/ce974a5db1b25729429c5f3dd666f3f778b4ee10/assets/nestjs.svg"/>](https://nestjs.com/)
[<img title="typescript" alt="typescript" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/ts.png"/>](https://www.typescriptlang.org/)
[<img title="postgres" alt="postgres" height=48 src="https://raw.githubusercontent.com/Barklim/bio/ce974a5db1b25729429c5f3dd666f3f778b4ee10/assets/pg.svg"/>](https://www.postgresql.org/)
[<img title="pgAdmin" alt="pgAdmin" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/pgAdmin.png"/>](https://www.pgadmin.org/)
[<img title="typeorm" alt="typeorm" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/typeorm.png"/>](https://github.com/typeorm/typeorm)
[<img title="swagger" alt="swagger" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/swagger.png"/>](https://github.com/swagger-api)
[<img title="docker" alt="docker" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/docker.png"/>](https://www.docker.com/)
[<img title="class validator" alt="class validator" height=48 src="https://raw.githubusercontent.com/Barklim/bio/refs/heads/main/assets/classValidator.png"/>](https://www.docker.com/)
</div>