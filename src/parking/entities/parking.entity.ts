import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('parking_spots')
export class ParkingSpot extends BaseEntity {
  @ApiProperty({
    description: 'The unique identifier of the parking spot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The number or identifier of the parking spot',
    example: 'A-101',
  })
  @Column()
  number: string;

  @ApiProperty({
    description: 'The floor number where the parking spot is located',
    example: 1,
  })
  @Column()
  floor: number;

  @ApiProperty({
    description: 'The section of the parking area where the spot is located',
    example: 'A',
  })
  @Column()
  section: string;

  @ApiProperty({
    description: 'Indicates whether the parking spot is currently available',
    example: true,
  })
  @Column({ default: true })
  isAvailable: boolean;
}
