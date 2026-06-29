---
name: add-api-endpoint
description: Add a new endpoint to an existing resource controller/service
---

# Add API Endpoint Skill

Add an endpoint to an existing module in this monolith.

## Usage

```
Use the add-api-endpoint skill to add a '<action>' endpoint to '<resource>'
```

## Steps

1. **Service** (`src/modules/<resource>/<resource>.service.ts`): add a method
   with the business logic and model access. Filter `deletedAt: null`. Throw
   `NotFoundException` / `ConflictException` where appropriate.
2. **DTO** (if the endpoint takes input): add a class in
   `src/modules/<resource>/dto/` with class-validator decorators.
3. **Controller**: add a thin handler with the correct verb decorator, document
   it with `@ApiOperation`, validate input via the DTO, and return
   `ApiResponseDto.of(result, message)`.
4. **Test**: extend `<resource>.service.spec.ts` to cover the new method.

## Conventions

- No `@MessagePattern` — this is a single in-process service.
- Reuse `PaginationQueryDto` for any list/search endpoint.
- Never put data-access or business logic in the controller.
