import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

/**
 * Wraps any raw controller return value in the standard ApiResponseDto envelope,
 * unless the controller already returned one. Keeps responses consistent without
 * forcing every handler to construct the wrapper manually.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) =>
        data instanceof ApiResponseDto ? data : new ApiResponseDto(data),
      ),
    );
  }
}
