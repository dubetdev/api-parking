import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRole } from './contants';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a new user successfully with valid input data', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    const hashedPassword = 'hashedPassword123';
    const savedUser: User = {
      id: '1',
      ...createUserDto,
      password: hashedPassword,
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
    jest.spyOn(usersRepository, 'create').mockReturnValue(savedUser);
    jest.spyOn(usersRepository, 'save').mockResolvedValue(savedUser);

    const result = await usersService.doCreate(createUserDto);

    expect(usersService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(usersRepository.create).toHaveBeenCalledWith({
      ...createUserDto,
      password: hashedPassword,
    });
    expect(usersRepository.save).toHaveBeenCalledWith(savedUser);
    expect(result).toEqual(
      expect.objectContaining({
        id: '1',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('should throw a ConflictException when trying to create a user with an existing email', async () => {
    const createUserDto: CreateUserDto = {
      email: 'existing@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    const existingUser: User = {
      id: '1',
      email: 'existing@example.com',
      password: 'hashedPassword',
      firstName: 'Jane',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(existingUser);
    jest.spyOn(usersRepository, 'create');
    jest.spyOn(usersRepository, 'save');

    await expect(usersService.doCreate(createUserDto)).rejects.toThrow(
      ConflictException,
    );

    expect(usersService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    expect(usersRepository.create).not.toHaveBeenCalled();
    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it('should hash the password before saving a new user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    const hashedPassword = 'hashedPassword123';
    const savedUser: User = {
      id: '1',
      ...createUserDto,
      password: hashedPassword,
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
    jest.spyOn(usersRepository, 'create').mockReturnValue(savedUser);
    jest.spyOn(usersRepository, 'save').mockResolvedValue(savedUser);

    await usersService.doCreate(createUserDto);

    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(usersRepository.create).toHaveBeenCalledWith({
      ...createUserDto,
      password: hashedPassword,
    });
    expect(usersRepository.save).toHaveBeenCalledWith(savedUser);
  });

  it('should find a user by ID successfully when the user exists', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await usersService.doFindOne('1');

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CLIENT,
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('should throw a NotFoundException when trying to find a non-existent user by ID', async () => {
    const nonExistentId = 'non-existent-id';

    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

    await expect(usersService.doFindOne(nonExistentId)).rejects.toThrow(
      NotFoundException,
    );

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { id: nonExistentId },
    });
  });

  it('should find a user by email successfully when the user exists', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await usersService.findByEmail('test@example.com');

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(result).toEqual(mockUser);
  });
  it('should return null when trying to find a non-existent user by email', async () => {
    const nonExistentEmail = 'nonexistent@example.com';

    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

    const result = await usersService.findByEmail(nonExistentEmail);

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: nonExistentEmail },
    });
    expect(result).toBeNull();
  });

  it("should update a user's information successfully with valid input data", async () => {
    const userId = '1';
    const existingUser: User = {
      id: userId,
      email: 'old@example.com',
      password: 'oldHashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    const updateUserDto: UpdateUserDto = {
      email: 'new@example.com',
      firstName: 'Jane',
      password: 'newPassword',
    };

    const updatedUser: User = {
      ...existingUser,
      ...updateUserDto,
      password: 'newHashedPassword',
    };

    jest.spyOn(usersService, 'doFindOne').mockResolvedValue(existingUser);
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword' as never);
    jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

    const result = await usersService.doUpdate(userId, updateUserDto);

    expect(usersService.doFindOne).toHaveBeenCalledWith(userId);
    expect(usersService.findByEmail).toHaveBeenCalledWith(updateUserDto.email);
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    expect(usersService.update).toHaveBeenCalledWith(userId, {
      ...existingUser,
      ...updateUserDto,
      password: 'newHashedPassword',
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: userId,
        email: updateUserDto.email,
        firstName: updateUserDto.firstName,
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it("should throw a ConflictException when trying to update a user's email to an existing one", async () => {
    const userId = '1';
    const existingUser: User = {
      id: userId,
      email: 'old@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    const updateUserDto: UpdateUserDto = {
      email: 'existing@example.com',
    };

    const anotherUser: User = {
      id: '2',
      email: 'existing@example.com',
      password: 'hashedPassword',
      firstName: 'Jane',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    jest.spyOn(usersService, 'doFindOne').mockResolvedValue(existingUser);
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(anotherUser);
    jest.spyOn(usersService, 'update').mockImplementation(); // Add this line

    await expect(usersService.doUpdate(userId, updateUserDto)).rejects.toThrow(
      ConflictException,
    );

    expect(usersService.doFindOne).toHaveBeenCalledWith(userId);
    expect(usersService.findByEmail).toHaveBeenCalledWith(updateUserDto.email);
    expect(usersService.update).not.toHaveBeenCalled();
  });

  it("should hash the new password when updating a user's password", async () => {
    const userId = '1';
    const existingUser: User = {
      id: userId,
      email: 'test@example.com',
      password: 'oldHashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    };

    const updateUserDto: UpdateUserDto = {
      password: 'newPassword',
    };

    const hashedNewPassword = 'newHashedPassword';

    jest.spyOn(usersService, 'doFindOne').mockResolvedValue(existingUser);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedNewPassword as never);
    jest.spyOn(usersService, 'update').mockResolvedValue({
      ...existingUser,
      password: hashedNewPassword,
    });

    await usersService.doUpdate(userId, updateUserDto);

    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    expect(usersService.update).toHaveBeenCalledWith(userId, {
      ...existingUser,
      password: hashedNewPassword,
    });
  });
});
