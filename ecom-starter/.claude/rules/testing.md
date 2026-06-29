---
paths:
  - "src/**/*.spec.ts"
  - "test/**"
alwaysApply: true
---

# Testing Rules

## Unit tests

- Co-locate unit tests next to the code as `*.spec.ts`.
- Test services in isolation: provide the Mongoose model via
  `{ provide: getModelToken(Model.name), useValue: mockModel }` and stub its
  methods. Do not hit a real database in unit tests.
- Cover the contract, not the implementation: happy path, validation/conflict
  errors (`ConflictException`), and not-found cases (`NotFoundException`).
- Reset mocks in `beforeEach` with `jest.clearAllMocks()`.

## E2E tests

- Place under `test/` and run with `npm run test:e2e`.
- Use an ephemeral MongoDB (e.g. `mongodb-memory-server`) or a disposable test
  database; never run e2e against development or production data.
- Assert on the standard envelope shape (`{ success, message, data }`).

## Expectations

- New service logic ships with at least one spec.
- `npm test` must pass before a change is considered done.
