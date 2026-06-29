# CLAUDE.md

Guidance for Claude (and developers) working in this repository.

## Project

**ecom-starter** — a **monolithic** NestJS + MongoDB backend, intended as the
starting point for an ecommerce application. It is inspired by the conventions
of COSMONYX-BE-001 but is deliberately a **single service**, not a set of
microservices. There is no API gateway, no message broker, and no inter-service
RPC — controllers call services directly within one process.

## Architecture

```
src/
  main.ts                  # Bootstrap: pipes, helmet, CORS, Swagger, global prefix /api
  app.module.ts            # Root module: ConfigModule + Mongoose connection + feature modules
  app.controller.ts        # GET / -> hello world / health check
  config/
    configuration.ts       # Typed env loader + Joi validation schema
  common/
    dto/                   # ApiResponseDto, PaginationQueryDto (shared contracts)
    interceptors/          # TransformInterceptor (wraps responses in ApiResponseDto)
    filters/               # AllExceptionsFilter (consistent error envelope)
  modules/
    products/              # Example CRUD domain
      schemas/             # Mongoose schema(s)
      dto/                 # create / update / query DTOs (class-validator)
      products.service.ts  # Business logic + data access
      products.controller.ts
      products.module.ts
```

New ecom domains (orders, users, cart, payments…) are added as new folders
under `src/modules/` and registered in `app.module.ts`.

## Core conventions

- **One connection.** MongoDB is configured once in `app.module.ts` from
  `MONGODB_URI`. Feature modules use `MongooseModule.forFeature([...])`.
- **Validated config.** All env vars pass through the Joi schema in
  `config/configuration.ts`. The app refuses to boot if `MONGODB_URI` is absent.
- **Consistent responses.** Successful responses are wrapped in `ApiResponseDto`
  (`{ success, message, data }`). Errors use `AllExceptionsFilter`
  (`{ success: false, statusCode, message, path, timestamp }`).
- **Validation at the edge.** Every request body/query uses a DTO with
  `class-validator` decorators. The global `ValidationPipe` whitelists and
  rejects unknown properties.
- **Soft delete.** Records carry `deletedAt` (null = active); deletes set the
  timestamp instead of removing the document. Queries always filter
  `deletedAt: null`.
- **Timestamps.** Schemas use `{ timestamps: true }` for `createdAt`/`updatedAt`.

## Commands

```bash
npm install          # install dependencies
cp .env.example .env # then set MONGODB_URI
npm run start:dev    # watch mode (http://localhost:3000/api)
npm run build        # compile to dist/
npm test             # unit tests
npm run lint         # eslint --fix
```

Swagger UI: `http://localhost:3000/docs`.

## When adding features

See `.claude/skills/` for step-by-step recipes (`add-crud-resource`,
`add-api-endpoint`) and `.claude/rules/` for the API, database, and testing
rules that apply automatically to matching paths.

## Do / Don't

- ✅ Keep it monolithic — direct service-to-service calls, no message patterns.
- ✅ Put shared contracts in `src/common`, domain logic in `src/modules/<name>`.
- ✅ Validate every input with a DTO; never trust `@Body()`/`@Query()` raw.
- ❌ Don't commit `.env` or real secrets (it is gitignored).
- ❌ Don't hard-delete documents — use the soft-delete pattern.
- ❌ Don't introduce microservice infrastructure (RabbitMQ, gateways, etc.).
