import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: 'The ID of the user making the reservation',
    example: '5f9d7a3b9d3f2c0e8c8b9b5a',
  })
  userId: string;

  @ApiProperty({
    description: 'The ID of the parking spot being reserved',
    example: '5f9d7a3b9d3f2c0e8c8b9b5b',
  })
  parkingSpotId: string;

  @ApiProperty({
    description: 'The start time of the reservation',
    example: '2023-06-15T10:00:00Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'The end time of the reservation',
    example: '2023-06-15T14:00:00Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'The license plate of the vehicle',
    example: 'ABC123',
  })
  vehiclePlate: string;

  @ApiProperty({
    description: 'The type of the vehicle',
    example: 'Sedan',
  })
  vehicleType: string;
}
