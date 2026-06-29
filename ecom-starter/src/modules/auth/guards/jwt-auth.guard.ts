import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Requires a valid JWT. Populates request.user from JwtStrategy.validate(). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
