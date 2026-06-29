---
paths:
  - "src/**/schemas/**"
  - "src/**/*.service.ts"
alwaysApply: true
---

# Database Rules

Applies to Mongoose schemas and data-access code. This project uses **MongoDB
via @nestjs/mongoose** (Mongoose ODM). There is a single database connection,
configured once in `app.module.ts` from `MONGODB_URI`.

## Schema pattern

- Define schemas with the `@Schema()` / `@Prop()` decorators and export both the
  class and `SchemaFactory.createForClass(...)`.
- Always enable `{ timestamps: true }` (gives `createdAt` / `updatedAt`).
- Include a soft-delete field: `@Prop({ type: Date, default: null, index: true }) deletedAt: Date | null;`
- Use a `toJSON` transform to expose `id` instead of `_id` and hide `__v`.
- Add `index: true` to fields you filter or sort on; `unique: true` for natural
  keys (e.g. `sku`).

```typescript
@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ required: true, index: true }) name: string;
  @Prop({ required: true, min: 0 }) price: number;
  @Prop({ required: true, unique: true, uppercase: true }) sku: string;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
}
```

## Data access

- Inject models with `@InjectModel(Model.name)`; never new up a connection.
- **Soft delete only.** Read queries filter `deletedAt: null`. "Deleting" sets
  `deletedAt = new Date()`. Never call `deleteOne` / `deleteMany` for domain data.
- Paginate list queries with `.skip()` / `.limit()` and return total counts;
  run the find + count with `Promise.all`.
- Enforce uniqueness in the service (check `exists(...)`) and rely on the unique
  index as a backstop; translate clashes to `ConflictException`.
- Keep all query logic in the service layer — controllers never touch the model.

## Registration

- Register each schema in its feature module via
  `MongooseModule.forFeature([{ name, schema }])`.
- Do not add a second `forRoot` connection; the monolith uses one database.
