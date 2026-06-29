import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

/** A paginated list payload: { data, total, page, totalPages }. */
function isPaginated(value: unknown): boolean {
  return (
    !!value &&
    typeof value === 'object' &&
    'data' in value &&
    'total' in value &&
    'totalPages' in value
  );
}

/**
 * Wraps raw controller return values in the standard ApiResponseDto envelope,
 * EXCEPT when the handler already returned an ApiResponseDto or a paginated
 * payload (e.g. GET /products → { data, total, page, totalPages }), which is
 * passed through unchanged so list endpoints can match their documented shape.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) =>
        data instanceof ApiResponseDto || isPaginated(data)
          ? data
          : new ApiResponseDto(data),
      ),
    );
  }
}
