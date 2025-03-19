import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards';

/**
 * Authentication decorator that combines role-based access control with JWT authentication.
 * This decorator applies metadata for role and sets up guards for JWT authentication and role verification.
 *
 * @param role - Optional. The role required to access the decorated route or method.
 *               If not provided, only JWT authentication will be applied without role checking.
 *
 * @returns A decorator function that can be applied to routes or methods to enforce authentication and authorization.
 */
export function Auth(role?: string) {
  return applyDecorators(
    SetMetadata('role', role),
    UseGuards(AuthGuard('jwt'), RolesGuard),
  );
}
