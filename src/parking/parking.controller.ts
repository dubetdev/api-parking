import { Controller, Get, Query } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { ParkingSpotAvailabilityDto } from './dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiSearch, Auth } from '../common/decorators';
import { UserRole } from '../users/contants';
import { ParkingSpot } from './entities/parking.entity';

@Controller('parking')
@ApiTags('Parking')
@Auth(UserRole.EMPLOYEE)
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Get('search')
  @ApiSearch(ParkingSpot)
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.parkingService.findAll({
      page,
      limit,
      order: { id: 'DESC' },
    });
  }

  @Get('availability')
  @ApiResponse({ type: ParkingSpotAvailabilityDto, isArray: true })
  async getAvailability(): Promise<ParkingSpotAvailabilityDto[]> {
    return this.parkingService.getAvailableParkingSpots();
  }
}
