import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../contants';

export class CreateUserDto {
  @ApiProperty({
    description: 'El email del usuario',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'La contraseña del usuario',
    example: '********',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Jonson', description: 'User last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    example: UserRole.CLIENT,
    description: 'User roles',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
