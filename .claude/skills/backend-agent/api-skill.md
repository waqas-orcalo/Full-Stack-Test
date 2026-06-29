# API skill

Use this when implementing any new backend feature (NestJS + Mongoose).

## The files a feature needs

1. schemas/[feature].schema.ts — Mongoose @Schema/@Prop (timestamps + deletedAt)
2. dto/create-[feature].dto.ts — request validation (class-validator)
3. dto/update-[feature].dto.ts — usually `PartialType(Create...Dto)`
4. [feature].service.ts — business logic + model access
5. [feature].controller.ts — routing + guards, returns ApiResponseDto
6. [feature].module.ts — MongooseModule.forFeature([...]); wire into app.module.ts

## Schema checklist

- `@Schema({ timestamps: true })` + a `deletedAt: Date | null` soft-delete field
- `toJSON` transform exposes `id`, drops `__v` (and any secret like passwordHash)
- `unique`/`index` on natural keys; `select: false` on sensitive fields

## DTO checklist

Every request DTO field has a type decorator + a constraint:

- @IsString() / @IsNumber() / @IsInt() / @IsEnum() / @IsMongoId() / @IsEmail()
- @IsNotEmpty() / @Min(0) / @IsPositive() / @MaxLength(255)
- @IsOptional() only when genuinely optional

## Service checklist

- Bad/unknown id (use `isValidObjectId`) or not found → `NotFoundException` (404)
- Validate business rules before persisting (e.g. unique SKU → ConflictException 409)
- Checkout: validate stock, compute total from current prices, create order →
  decrement stock → clear cart; re-validate stock just before commit (no
  multi-doc transactions on standalone Mongo)
- `priceAtPurchase` snapshotted at order time — never recalculated
- Never return passwordHash (schema handles it via select:false + toJSON)

## Controller checklist

- Read paths are public where intended; protected routes: `@UseGuards(JwtAuthGuard)`
- Admin routes: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)`
- The global ValidationPipe (whitelist, forbidNonWhitelisted, transform) is set
  in main.ts — bad input → 400 with field errors automatically
- Wrap results in `ApiResponseDto.of(data, message)`; product list returns the
  flat `{ data, total, page, totalPages }` shape
- Multipart upload: FileInterceptor + diskStorage to `images/`

## Wire-up checklist

- Register the schema in the feature module's `MongooseModule.forFeature`
- Import the feature module in `app.module.ts`
- New env vars: add to `.env.example` and validate in config/configuration.ts (Joi)
