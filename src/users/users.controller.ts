import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiCreate, ApiDeleteOne, ApiSearch, Auth } from '../common/decorators';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { Trace } from '../traces/decorators';
import { ModuleRef } from '@nestjs/core';
import { TracesActions } from '../common/constants';
import { UserRole } from './contants';
import { ApiUpdate } from '../common/decorators/api-update';

@Controller('users')
@ApiTags('Users')
@Auth(UserRole.EMPLOYEE)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Post()
  @ApiCreate(User, CreateUserDto, 'user')
  @Trace({ action: TracesActions.CREATE, module: 'USERS' })
  create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<Partial<User>> {
    return this.usersService.doCreate(createUserDto);
  }

  @Get('search')
  @ApiSearch(User)
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll({
      page,
      limit,
      order: { id: 'DESC' },
    });
  }

  @Get(':id')
  @ApiDeleteOne(User.name, 'id', null, { uuid: true })
  findOne(@Param('id') id: string): Promise<Partial<User>> {
    return this.usersService.doFindOne(id);
  }

  @Patch(':id')
  @ApiUpdate(User.name, UpdateUserDto, User, { uuid: true })
  @Trace({ action: TracesActions.UPDATE, module: 'USERS' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    return this.usersService.doUpdate(id, updateUserDto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @ApiDeleteOne(User.name, 'id', null, { uuid: true })
  @Trace({ action: TracesActions.DELETE, module: 'USERS' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}
