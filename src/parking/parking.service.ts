import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingSpot } from './entities/parking.entity';
import { ParkingSpotAvailabilityDto } from './dto/parking-spot.dto';
import { BaseService } from '../common/services';

@Injectable()
export class ParkingService extends BaseService<ParkingSpot> {
  constructor(
    @InjectRepository(ParkingSpot)
    private parkingSpotRepository: Repository<ParkingSpot>,
  ) {
    super(parkingSpotRepository);
  }

  /**
   * Retrieves and groups available parking spots by floor and section.
   *
   * This method fetches all available parking spots from the database,
   * then groups them by floor and section. Each group contains an array
   * of available spots within that floor-section combination.
   *
   * @returns {Promise<ParkingSpotAvailabilityDto[]>} A promise that resolves to an array of
   * ParkingSpotAvailabilityDto objects. Each object represents a floor-section group
   * and contains the floor number, section identifier, and an array of available spots.
   */
  async getAvailableParkingSpots(): Promise<ParkingSpotAvailabilityDto[]> {
    const availableSpots = await this.parkingSpotRepository.find({
      where: { isAvailable: true },
    });

    const groupedSpots = availableSpots.reduce((acc, spot) => {
      const key = `${spot.floor}-${spot.section}`;
      if (!acc[key]) {
        acc[key] = {
          floor: spot.floor,
          section: spot.section,
          availableSpots: [],
        };
      }
      acc[key].availableSpots.push(spot);
      return acc;
    }, {});

    return Object.values(groupedSpots);
  }
}
