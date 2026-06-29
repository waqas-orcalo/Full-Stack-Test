import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter. Catches everything and returns a consistent,
 * leak-free error body: { statusCode, message }.
 *
 * - Validation (class-validator) errors surface as message: string[] of field
 *   errors with statusCode 400.
 * - 5xx errors never expose the underlying message or stack trace to the client
 *   (full detail is logged server-side instead).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[];
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Never leak internal error details/stack traces to clients.
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      message = 'Internal server error';
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message =
        typeof res === 'object' && res !== null
          ? ((res as Record<string, unknown>).message as string | string[])
          : (res as string);
    } else {
      message = 'Unexpected error';
    }

    response.status(status).json({ statusCode: status, message });
  }
}
