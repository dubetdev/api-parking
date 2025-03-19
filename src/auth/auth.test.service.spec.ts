import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/contants';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return null for empty email or password', async () => {
    const emptyEmailResult = await authService.validateUser('', 'password');
    const emptyPasswordResult = await authService.validateUser(
      'test@example.com',
      '',
    );
    const emptyBothResult = await authService.validateUser('', '');

    expect(emptyEmailResult).toBeNull();
    expect(emptyPasswordResult).toBeNull();
    expect(emptyBothResult).toBeNull();
  });
  it('should return null when user is not found in the database', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

    const result = await authService.validateUser(
      'nonexistent@example.com',
      'password',
    );

    expect(usersService.findByEmail).toHaveBeenCalledWith(
      'nonexistent@example.com',
    );
    expect(result).toBeNull();
  });

  it("should return null when password doesn't match", async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      password: await bcrypt.hash('correctpassword', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    const result = await authService.validateUser(
      'test@example.com',
      'wrongpassword',
    );

    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrongpassword',
      mockUser.password,
    );
    expect(result).toBeNull();
  });

  it('should return user object without password on successful validation', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: await bcrypt.hash('correctpassword', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    };
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as User);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await authService.validateUser(
      'test@example.com',
      'correctpassword',
    );

    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'correctpassword',
      mockUser.password,
    );
    expect(result).toBeInstanceOf(User);
    expect(result).not.toHaveProperty('password');
    expect(result).toEqual(
      expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      }),
    );
  });

  it('should generate a valid JWT token on successful login', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'user',
    };
    const mockToken = 'mock.jwt.token';
    jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

    const result = await authService.login(mockUser);

    expect(jwtService.sign).toHaveBeenCalledWith({
      email: mockUser.email,
      sub: mockUser.id,
      role: mockUser.role,
    });
    expect(result).toEqual({
      access_token: mockToken,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  });

  it('should include correct user information in the login response', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'user',
    };
    const mockToken = 'mock.jwt.token';
    jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

    const result = await authService.login(mockUser);

    expect(jwtService.sign).toHaveBeenCalledWith({
      email: mockUser.email,
      sub: mockUser.id,
      role: mockUser.role,
    });
    expect(result).toEqual({
      access_token: mockToken,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  });

  it('should properly handle special characters in email and password', async () => {
    const specialEmail = 'test+special@example.com';
    const specialPassword = 'p@ssw0rd!';
    const hashedPassword = await bcrypt.hash(specialPassword, 10);
    const mockUser: User = {
      id: '1', // Change to string to match User entity
      email: specialEmail,
      password: hashedPassword,
      firstName: 'John', // Add firstName
      lastName: 'Doe', // Add lastName
      role: UserRole.CLIENT, // Use UserRole enum
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation((plain, hashed) =>
        Promise.resolve(plain === specialPassword),
      );

    const result = await authService.validateUser(
      specialEmail,
      specialPassword,
    );

    expect(usersService.findByEmail).toHaveBeenCalledWith(specialEmail);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      specialPassword,
      hashedPassword,
    );
    expect(result).toBeInstanceOf(User);
    expect(result).toEqual(
      expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('should return appropriate error when usersService.findByEmail fails', async () => {
    const errorMessage = 'Database connection error';
    jest
      .spyOn(usersService, 'findByEmail')
      .mockRejectedValue(new Error(errorMessage));

    await expect(
      authService.validateUser('test@example.com', 'password'),
    ).rejects.toThrow(errorMessage);

    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should ensure JWT payload contains correct user id, email, and role', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'user',
    };
    const mockToken = 'mock.jwt.token';
    jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

    const result = await authService.login(mockUser);

    expect(jwtService.sign).toHaveBeenCalledWith({
      email: mockUser.email,
      sub: mockUser.id,
      role: mockUser.role,
    });
    expect(result).toEqual({
      access_token: mockToken,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  });
});
