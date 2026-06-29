---
paths:
  - "src/**/*.controller.ts"
  - "src/**/dto/**"
alwaysApply: true
---

# API Rules

Applies to controllers and DTOs in this monolithic NestJS service.

## Controllers

- One controller per resource, route prefixed by the resource name:
  `@Controller('products')`. The global prefix `/api` is added in `main.ts`.
- Use the correct HTTP verb decorator: `@Get`, `@Post`, `@Patch`, `@Delete`.
- Controllers are thin: validate input (via DTO), delegate to the service,
  wrap the result in `ApiResponseDto.of(data, message)`. No business logic or
  direct database access in controllers.
- Document every handler with `@ApiOperation`, and parameters with
  `@ApiParam` / `@ApiQuery`. Group with `@ApiTags`.

## Standard CRUD shape

```typescript
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post() create(@Body() dto: CreateProductDto) { ... }      // 201
  @Get() findAll(@Query() q: QueryProductDto) { ... }        // list + pagination
  @Get(':id') findOne(@Param('id') id: string) { ... }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProductDto) { ... }
  @Delete(':id') remove(@Param('id') id: string) { ... }     // soft delete
}
```

## Validation

- Every request body and query is a DTO class with `class-validator` decorators.
- The global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform)
  strips and rejects unknown fields — do not disable it per-route.
- Reuse `PaginationQueryDto` for list endpoints; extend it for resource filters.

## Responses

- Success: `ApiResponseDto<T>` -> `{ success: true, message, data }`.
- The `TransformInterceptor` auto-wraps any plain return value, but prefer
  returning `ApiResponseDto.of(...)` explicitly so the message is meaningful.
- Errors: throw Nest `HttpException` subclasses (`NotFoundException`,
  `ConflictException`, `BadRequestException`). The `AllExceptionsFilter`
  formats them consistently.

## Monolith note

This service has **no gateway and no message patterns**. Controllers call
injected services directly. Do not add `@MessagePattern`, microservice
transports, or cross-service RPC.
