import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ParkingSpot } from '../parking/entities/parking.entity';
import { StatusReservationEnum } from './contants/status-reservation.enum';
import { BaseService } from '../common/services';

@Injectable()
export class ReservationService extends BaseService<Reservation> {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(ParkingSpot)
    private parkingSpotRepository: Repository<ParkingSpot>,
  ) {
    super(reservationRepository);
  }

  /**
   * Creates a new reservation for a parking spot.
   *
   * @param createReservationDto - The DTO containing reservation details.
   * @param createReservationDto.userId - The ID of the user making the reservation.
   * @param createReservationDto.parkingSpotId - The ID of the parking spot to be reserved.
   * @param createReservationDto.startTime - The start time of the reservation.
   * @param createReservationDto.endTime - The end time of the reservation.
   * @param createReservationDto.vehicleType - The type of vehicle for the reservation.
   * @param createReservationDto.vehiclePlate - The license plate of the vehicle.
   * @returns A Promise that resolves to the created Reservation entity.
   * @throws Error if the parking spot is not available for the selected time.
   */
  async createReservation(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const {
      userId,
      parkingSpotId,
      startTime,
      endTime,
      vehicleType,
      vehiclePlate,
    } = createReservationDto;

    const existingReservation = await this.reservationRepository.findOne({
      where: {
        parkingSpot: { id: parkingSpotId },
        startTime: LessThanOrEqual(endTime),
        endTime: MoreThanOrEqual(startTime),
      },
    });

    if (existingReservation) {
      throw new Error('Parking spot is not available for the selected time.');
    }

    const reservation = this.reservationRepository.create({
      userId,
      parkingSpot: { id: parkingSpotId },
      startTime,
      endTime,
      status: 'confirmed',
      vehiclePlate,
      vehicleType,
    });

    return this.reservationRepository.save(reservation);
  }

  /**
   * Changes the status of an existing reservation.
   *
   * @param id - The ID of the reservation to update.
   * @param newStatus - The new status to set for the reservation.
   * @returns A Promise that resolves to the updated Reservation entity.
   * @throws NotFoundException if the reservation with the given ID is not found.
   */
  async changeReservationStatus(
    id: string,
    newStatus: StatusReservationEnum,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    reservation.status = newStatus;
    return this.reservationRepository.save(reservation);
  }
}
