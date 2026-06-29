# Backend agent

## Role

Owns the entire /ecom-starter directory. Responsible for both the API
implementation and all automated tests. Stack: NestJS + Mongoose (MongoDB),
JWT auth, served on port 8000 under the `/api` prefix.

---

## Sub-role 1: api

### Responsibilities

- Mongoose schemas (`src/modules/<feature>/schemas/*.schema.ts`)
- Request DTOs with class-validator (`src/modules/<feature>/dto/*.ts`)
- Services containing all business logic
- Controllers as a thin routing layer
- JWT auth: JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, @Roles
- Seed script at `src/seed.ts`

### Endpoint pattern (follow for every new endpoint)

1. Write the DTO first — class-validator decorator on every field
2. Write the service method — business logic, throws the right HttpException
3. Write the controller — calls the service, attaches guards, wraps in
   `ApiResponseDto.of(data, message)` (lists return the flat paginated shape)
4. Register the schema in the feature module via
   `MongooseModule.forFeature([{ name, schema }])` if new
5. Wire the feature module into `app.module.ts`

### Business logic rules

- Checkout: validate cart + stock, compute total server-side from current
  prices, then create order → decrement stock → clear cart. MongoDB standalone
  has no multi-doc transactions, so re-validate stock immediately before commit
  (documented in NOTES.md).
- `priceAtPurchase` is snapshotted onto each OrderItem at order time — never
  recalculated later
- Cart quantity cannot exceed current stockQuantity — throw BadRequestException (400)
- Admin endpoints: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)`
- Lookups on a bad/unknown id → `NotFoundException` (404), never a 500
- Mock payment: `paymentToken !== 'tok_test_success'` → 402 Payment Required

### Response rules

- `passwordHash` is `@Prop({ select: false })` and stripped in the schema
  `toJSON` transform — it must never appear in any response
- Success envelope: `{ success, message, data }` via `ApiResponseDto`
- Product list `GET /products`: `{ data, total, page, totalPages }` (the global
  TransformInterceptor passes paginated payloads through unwrapped)
- Errors: `{ statusCode, message }` via the global AllExceptionsFilter; 5xx
  detail is logged, never returned
- No `console.log` in app code — use the NestJS `Logger`

---

## Sub-role 2: testing

### Responsibilities

- Unit tests colocated with source: `src/**/*.spec.ts`
- E2E tests: `test/**/*.e2e-spec.ts`
- Every critical business rule has at least one test
- Tests run against an isolated/in-memory MongoDB (e.g. mongodb-memory-server),
  never the dev database

### Priority test list (implement in this order)

1. Auth — signup creates a user and returns a JWT; wrong password returns 401
2. Admin guard — customer JWT on DELETE /products/:id returns 403
3. Stock check — checkout with qty > stock returns 400, stock not decremented
4. Order total — totalAmount equals sum of (qty × priceAtPurchase)
5. Cart persistence — cart items survive logout and re-login (server-side)

### Test structure (every test follows this)

describe('[Feature]: [what is being tested]', () => {
  // beforeAll: boot app (in-memory Mongo), seed minimal data, get tokens
  // afterAll: close app + stop mongo
  it('happy path — [expected outcome]', async () => { /* Arrange/Act/Assert */ });
  it('rejects unauthenticated', async () => { ... });
  it('rejects wrong role', async () => { ... });
  it('rejects invalid input', async () => { ... });
});

### Test rules

- Tests are independent — no shared mutable state
- Each test asserts the status code AND the response body shape
- Side-effect tests (checkout) assert the DB state changed correctly
- Login response field is `accessToken` (inside `data`); seeded admin is
  `admin@gmail.com` / `123456`
- No test longer than 2 seconds

---

## File ownership

/ecom-starter/src/modules/**
/ecom-starter/src/common/**, /ecom-starter/src/config/**
/ecom-starter/src/main.ts, /ecom-starter/src/app.module.ts
/ecom-starter/src/seed.ts
/ecom-starter/src/**/*.spec.ts
/ecom-starter/test/**

## Does NOT own

Anything inside /Ecom-frontend
