import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ParkingSpot } from '../../parking/entities/parking.entity';
import { StatusReservationEnum } from '../contants';
import { ApiProperty } from '@nestjs/swagger';

@Entity('reservations')
export class Reservation extends BaseEntity {
  @ApiProperty({
    description: 'The unique identifier of the reservation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The ID of the user who made the reservation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'The parking spot associated with this reservation',
    type: () => ParkingSpot,
  })
  @ManyToOne(() => ParkingSpot)
  parkingSpot: ParkingSpot;

  @ApiProperty({
    description: 'The start time of the reservation',
    example: '2023-06-15T10:00:00Z',
  })
  @Column()
  startTime: Date;

  @ApiProperty({
    description: 'The end time of the reservation',
    example: '2023-06-15T14:00:00Z',
  })
  @Column()
  endTime: Date;

  @ApiProperty({
    description: 'The license plate of the vehicle',
    example: 'ABC123',
  })
  @Column()
  vehiclePlate: string;

  @ApiProperty({
    description: 'The type of the vehicle',
    example: 'Sedan',
  })
  @Column()
  vehicleType: string;

  @ApiProperty({
    description: 'The current status of the reservation',
    enum: StatusReservationEnum,
    example: StatusReservationEnum.CONFIRMED,
  })
  @Column({
    type: 'enum',
    enum: StatusReservationEnum,
    default: StatusReservationEnum.CONFIRMED,
  })
  status: string;
}
