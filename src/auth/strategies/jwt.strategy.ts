import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

/**
 * JWT authentication strategy for Passport.
 * This class extends PassportStrategy to implement JWT-based authentication.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Creates an instance of JwtStrategy.
   *
   * @param usersService - The UsersService for user-related operations.
   */
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  /**
   * Validates the JWT payload and retrieves the user information.
   * This method is called by Passport to verify and decode the JWT token.
   *
   * @param payload - The decoded JWT payload containing user information.
   * @param payload.sub - The subject of the JWT, typically the user's unique identifier.
   *
   * @returns An object containing the user's id, email, and role if validation is successful.
   * @throws {UnauthorizedException} If no user is found with the given payload subject.
   */
  async validate(payload: any) {
    const user = await this.usersService.doFindOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
