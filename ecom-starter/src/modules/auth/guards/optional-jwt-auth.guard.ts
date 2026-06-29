import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard, but does NOT reject anonymous requests. If a valid token
 * is present, request.user is populated; otherwise the request proceeds with
 * no user. Used for endpoints whose behaviour is enhanced (but not gated) by auth.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Always allow the request through; populate user when a token validates.
  handleRequest<TUser>(_err: unknown, user: TUser): TUser {
    return user as TUser;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
