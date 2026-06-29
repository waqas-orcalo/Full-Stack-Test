import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../jwt.strategy';

/** Inject the authenticated user (or one of its fields) into a handler. */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return data ? request.user?.[data] : request.user;
  },
);
