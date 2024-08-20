import { CanActivate, ExecutionContext, HttpException, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new HttpException('인증되지 않은 사용자입니다.', 401);
    }

    const userRoles = user?.authority || [];
    const hasRole = roles.some(role => userRoles.includes(role));
        if (!hasRole) {
            throw new HttpException('접근 권한이 없습니다.', 401);
        }

    return hasRole;
    }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);