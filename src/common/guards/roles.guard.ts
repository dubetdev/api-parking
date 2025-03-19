import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/contants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current user has the required role to access a route.
   * This method is part of NestJS's guard system for role-based access control.
   *
   * @param context - The execution context, which provides access to the current request and more.
   * @returns A boolean indicating whether the user is authorized to access the route.
   *          Returns true if no role is required or if the user's role matches the required role.
   *          Returns false if the user's role does not match the required role.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>(
      'role',
      context.getHandler(),
    );
    if (!requiredRole) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    return user?.role === requiredRole;
  }
}
