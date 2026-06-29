# Ecom Starter API

A **monolithic** NestJS + MongoDB backend — a clean starting point for an
ecommerce application. Inspired by the conventions of COSMONYX-BE-001, but
deliberately a single service (no microservices, no gateway, no message broker).

It ships with a hello-world endpoint and a complete **Products** CRUD resource
demonstrating the patterns you'll reuse for every future domain.

## Stack

- **NestJS 11** (TypeScript)
- **MongoDB** via `@nestjs/mongoose` (Mongoose ODM)
- **class-validator** for request validation
- **Swagger** for API docs
- **Joi** for environment validation, **Helmet** for security headers

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then set MONGODB_URI in .env

# 3. Run (watch mode)
npm run start:dev
```

The API is served under the `/api` prefix:

- Hello world / health: `GET http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`

## Environment

| Variable          | Required | Description                                   |
| ----------------- | -------- | --------------------------------------------- |
| `MONGODB_URI`     | ✅       | MongoDB connection string (the database key)  |
| `PORT`            |          | HTTP port (default `3000`)                     |
| `NODE_ENV`        |          | `development` \| `production` \| `test`        |
| `CORS_ORIGINS`    |          | Comma-separated allowed origins                |

Example `MONGODB_URI` values:

```
# local
mongodb://localhost:27017/ecom_starter
# Atlas
mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/ecom_starter?retryWrites=true&w=majority
```

The app validates env at boot and **refuses to start without `MONGODB_URI`**.

## API

### Health

| Method | Path   | Description |
| ------ | ------ | ----------- |
| GET    | `/api` | Hello world |

### Products

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| POST   | `/api/products`     | Create a product                     |
| GET    | `/api/products`     | List products (paginated, filterable)|
| GET    | `/api/products/:id` | Get a product by id                  |
| PATCH  | `/api/products/:id` | Update a product                     |
| DELETE | `/api/products/:id` | Soft-delete a product                |

List query params: `page`, `limit`, `search`, `category`.

Example:

```bash
curl -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Wireless Mouse","price":29.99,"sku":"WM-001","stock":100,"category":"accessories"}'
```

Every response uses a consistent envelope:

```json
{ "success": true, "message": "Product created successfully", "data": { "...": "..." } }
```

## Project structure

```
src/
  main.ts                # bootstrap (pipes, helmet, CORS, Swagger, /api prefix)
  app.module.ts          # config + Mongoose connection + feature modules
  app.controller.ts      # hello world
  config/                # typed env + Joi validation
  common/                # ApiResponseDto, pagination, interceptor, exception filter
  modules/
    products/            # example CRUD domain (schema, dto, service, controller)
```

## Adding a new domain

Add a folder under `src/modules/`, register it in `app.module.ts`, and follow
the patterns in the Products module. See `.claude/skills/add-crud-resource.md`
for a step-by-step recipe and `.claude/rules/` for the enforced conventions.

## Scripts

```bash
npm run start:dev   # watch mode
npm run build       # compile to dist/
npm run start:prod  # run compiled build
npm test            # unit tests
npm run lint        # eslint --fix
```

## Conventions

- **Monolith** — controllers call services directly, in-process. No microservice
  transports.
- **Soft delete** — records carry `deletedAt`; deletes set the timestamp.
- **Validated input** — every body/query is a class-validator DTO.
- **Consistent responses** — success via `ApiResponseDto`, errors via a global
  exception filter.

See `CLAUDE.md` for full guidance.
