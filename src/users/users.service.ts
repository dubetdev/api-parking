import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { BaseService } from '../common/services';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }

  /**
   * Creates a new user in the database.
   * @param createUserDto - The data transfer object containing user information for creation.
   * @returns A promise that resolves to a partial User object representing the created user.
   * @throws ConflictException if a user with the same email already exists.
   */

  async doCreate(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    return plainToClass(User, savedUser);
  }

  /**
   * Finds a user by their ID.
   * @param id - The unique identifier of the user to find.
   * @returns A promise that resolves to a partial User object.
   * @throws NotFoundException if no user is found with the given ID.
   */
  async doFindOne(id: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return plainToClass(User, user);
  }

  /**
   * Finds a user by their email address.
   * @param email - The email address of the user to find.
   * @returns A promise that resolves to a User object if found, or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Updates an existing user's information.
   * @param id - The unique identifier of the user to update.
   * @param updateUserDto - The data transfer object containing the updated user information.
   * @returns A promise that resolves to a partial User object representing the updated user.
   * @throws ConflictException if trying to update to an email that already exists for another user.
   */
  async doUpdate(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.doFindOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser: UpdateUserDto = await this.update(id, {
      ...user,
      ...updateUserDto,
    });

    return plainToClass(User, updatedUser);
  }
}
