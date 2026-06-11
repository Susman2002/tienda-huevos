import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción')
    }

    return true
  }
}