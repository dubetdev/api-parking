import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatusReservationEnum } from '../contants';

export class UpdateReservationStatusDto {
  @ApiProperty({
    enum: StatusReservationEnum,
    description: 'The new status of the reservation',
  })
  @IsEnum(StatusReservationEnum)
  status: StatusReservationEnum;
}
