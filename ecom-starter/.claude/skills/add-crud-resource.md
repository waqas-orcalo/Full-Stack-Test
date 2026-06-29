---
name: add-crud-resource
description: Scaffold a new CRUD resource module (schema, DTOs, service, controller) in this monolith
---

# Add CRUD Resource Skill

Create a new ecom domain (e.g. orders, customers, categories) following this
project's monolithic NestJS + MongoDB conventions.

## Usage

```
Use the add-crud-resource skill to add a '<resource>' resource
```

## Steps

1. Create `src/modules/<resource>/` with this layout:
   - `schemas/<resource>.schema.ts` — `@Schema({ timestamps: true })`, a
     `deletedAt` soft-delete field, indexes, and a `toJSON` `id` transform.
   - `dto/create-<resource>.dto.ts` — class-validator decorated fields.
   - `dto/update-<resource>.dto.ts` — `PartialType(Create...Dto)`.
   - `dto/query-<resource>.dto.ts` — `extends PaginationQueryDto` plus filters.
   - `<resource>.service.ts` — CRUD with soft delete, pagination, uniqueness
     checks (`ConflictException`) and `NotFoundException`.
   - `<resource>.controller.ts` — thin handlers returning `ApiResponseDto.of(...)`.
   - `<resource>.module.ts` — `MongooseModule.forFeature([...])`, declares the
     controller and service.

2. Register the new module in `src/app.module.ts` `imports`.

3. Add a `<resource>.service.spec.ts` with a mocked model.

## Conventions to follow

- Soft delete (`deletedAt`), never hard delete.
- Filter `deletedAt: null` on every read.
- Validate all input via DTOs; wrap output in `ApiResponseDto`.
- Keep it in-process — no message patterns, no gateway.
