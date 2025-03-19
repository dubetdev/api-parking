import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user's credentials.
   *
   * @param email - The email address of the user to validate.
   * @param password - The password of the user to validate.
   * @returns A Promise that resolves to the user object without the password if validation is successful, or null if validation fails.
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return plainToClass(User, user);
    }
    return null;
  }

  /**
   * Generates a JWT token for a authenticated user.
   *
   * @param user - The user object containing id, email, and role.
   * @returns An object containing the access token and user information.
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
