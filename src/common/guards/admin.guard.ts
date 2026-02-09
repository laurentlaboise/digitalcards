import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const isAdmin =
      user.is_admin === true ||
      (typeof user.email === 'string' &&
        user.email.endsWith('@digitalcards.io'));

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
