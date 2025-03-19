import { ParkingSpot } from '../entities/parking.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ParkingSpotAvailabilityDto {
  @ApiProperty({
    description: 'The floor number of the parking area',
    example: 1,
  })
  floor: number;

  @ApiProperty({
    description: 'The section of the parking area',
    example: 'A',
  })
  section: string;

  @ApiProperty({
    description: 'List of available parking spots',
    type: [ParkingSpot],
  })
  availableSpots: ParkingSpot[];
}
