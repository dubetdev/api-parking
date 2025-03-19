import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ParkingSpot } from '../parking/entities/parking.entity';
import { CreateReservationDto } from './dto';
import { StatusReservationEnum } from './contants';
import { NotFoundException } from '@nestjs/common';

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let reservationRepository: Repository<Reservation>;
  let parkingSpotRepository: Repository<ParkingSpot>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ParkingSpot),
          useClass: Repository,
        },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    reservationRepository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
    parkingSpotRepository = module.get<Repository<ParkingSpot>>(
      getRepositoryToken(ParkingSpot),
    );
  });

  it('should successfully create a reservation when parking spot is available', async () => {
    const createReservationDto: CreateReservationDto = {
      userId: '1',
      parkingSpotId: '1',
      startTime: new Date('2023-05-01T10:00:00Z'),
      endTime: new Date('2023-05-01T12:00:00Z'),
      vehicleType: 'car',
      vehiclePlate: 'ABC123',
    };

    const mockReservation = {
      id: '1',
      userId: '1',
      parkingSpot: { id: '1' },
      startTime: createReservationDto.startTime,
      endTime: createReservationDto.endTime,
      status: 'confirmed',
      vehiclePlate: 'ABC123',
      vehicleType: 'car',
    };

    jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(reservationRepository, 'create')
      .mockReturnValue(mockReservation as Reservation);
    jest
      .spyOn(reservationRepository, 'save')
      .mockResolvedValue(mockReservation as Reservation);

    const result = await reservationService.createReservation(
      createReservationDto,
    );

    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: {
        parkingSpot: { id: '1' },
        startTime: LessThanOrEqual(createReservationDto.endTime),
        endTime: MoreThanOrEqual(createReservationDto.startTime),
      },
    });
    expect(reservationRepository.create).toHaveBeenCalledWith({
      userId: '1',
      parkingSpot: { id: '1' },
      startTime: createReservationDto.startTime,
      endTime: createReservationDto.endTime,
      status: 'confirmed',
      vehiclePlate: 'ABC123',
      vehicleType: 'car',
    });
    expect(reservationRepository.save).toHaveBeenCalledWith(mockReservation);
    expect(result).toEqual(mockReservation);
  });

  it('should throw an error when creating a reservation for an already reserved parking spot', async () => {
    const createReservationDto: CreateReservationDto = {
      userId: '1',
      parkingSpotId: '1',
      startTime: new Date('2023-05-01T10:00:00Z'),
      endTime: new Date('2023-05-01T12:00:00Z'),
      vehicleType: 'car',
      vehiclePlate: 'ABC123',
    };

    const existingReservation = {
      id: '2',
      userId: '2',
      parkingSpot: { id: '1' },
      startTime: new Date('2023-05-01T11:00:00Z'),
      endTime: new Date('2023-05-01T13:00:00Z'),
      status: 'confirmed',
      vehiclePlate: 'XYZ789',
      vehicleType: 'car',
    };

    jest
      .spyOn(reservationRepository, 'findOne')
      .mockResolvedValue(existingReservation as Reservation);

    await expect(
      reservationService.createReservation(createReservationDto),
    ).rejects.toThrow('Parking spot is not available for the selected time.');

    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: {
        parkingSpot: { id: '1' },
        startTime: LessThanOrEqual(createReservationDto.endTime),
        endTime: MoreThanOrEqual(createReservationDto.startTime),
      },
    });
  });

  it('should successfully change reservation status when reservation exists', async () => {
    const reservationId = '1';
    const newStatus = StatusReservationEnum.COMPLETED;

    const mockReservation: Partial<Reservation> = {
      id: reservationId,
      status: StatusReservationEnum.CONFIRMED,
    };

    jest
      .spyOn(reservationRepository, 'findOne')
      .mockResolvedValue(mockReservation as Reservation);
    jest.spyOn(reservationRepository, 'save').mockResolvedValue({
      ...mockReservation,
      status: newStatus,
    } as Reservation);

    const result = await reservationService.changeReservationStatus(
      reservationId,
      newStatus,
    );

    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: { id: reservationId },
    });
    expect(reservationRepository.save).toHaveBeenCalledWith({
      ...mockReservation,
      status: newStatus,
    });
    expect(result).toEqual({ ...mockReservation, status: newStatus });
  });

  it('should throw NotFoundException when changing status of non-existent reservation', async () => {
    const reservationId = 'non-existent-id';
    const newStatus = StatusReservationEnum.COMPLETED;

    jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);

    await expect(
      reservationService.changeReservationStatus(reservationId, newStatus),
    ).rejects.toThrow(NotFoundException);

    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: { id: reservationId },
    });
  });

  it('should create reservation with correct vehicle information', async () => {
    const createReservationDto: CreateReservationDto = {
      userId: '1',
      parkingSpotId: '1',
      startTime: new Date('2023-05-01T10:00:00Z'),
      endTime: new Date('2023-05-01T12:00:00Z'),
      vehicleType: 'motorcycle',
      vehiclePlate: 'XYZ789',
    };

    const mockReservation = {
      id: '1',
      userId: '1',
      parkingSpot: { id: '1' },
      startTime: createReservationDto.startTime,
      endTime: createReservationDto.endTime,
      status: 'confirmed',
      vehiclePlate: 'XYZ789',
      vehicleType: 'motorcycle',
    };

    jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(reservationRepository, 'create')
      .mockReturnValue(mockReservation as Reservation);
    jest
      .spyOn(reservationRepository, 'save')
      .mockResolvedValue(mockReservation as Reservation);

    const result = await reservationService.createReservation(
      createReservationDto,
    );

    expect(reservationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleType: 'motorcycle',
        vehiclePlate: 'XYZ789',
      }),
    );
    expect(result.vehicleType).toBe('motorcycle');
    expect(result.vehiclePlate).toBe('XYZ789');
  });

  it('should handle reservation requests spanning multiple days', async () => {
    const createReservationDto: CreateReservationDto = {
      userId: '1',
      parkingSpotId: '1',
      startTime: new Date('2023-05-01T10:00:00Z'),
      endTime: new Date('2023-05-03T14:00:00Z'),
      vehicleType: 'car',
      vehiclePlate: 'ABC123',
    };

    const mockReservation = {
      id: '1',
      userId: '1',
      parkingSpot: { id: '1' },
      startTime: createReservationDto.startTime,
      endTime: createReservationDto.endTime,
      status: 'confirmed',
      vehiclePlate: 'ABC123',
      vehicleType: 'car',
    };

    jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(reservationRepository, 'create')
      .mockReturnValue(mockReservation as Reservation);
    jest
      .spyOn(reservationRepository, 'save')
      .mockResolvedValue(mockReservation as Reservation);

    const result = await reservationService.createReservation(
      createReservationDto,
    );

    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: {
        parkingSpot: { id: '1' },
        startTime: LessThanOrEqual(createReservationDto.endTime),
        endTime: MoreThanOrEqual(createReservationDto.startTime),
      },
    });
    expect(reservationRepository.create).toHaveBeenCalledWith({
      userId: '1',
      parkingSpot: { id: '1' },
      startTime: createReservationDto.startTime,
      endTime: createReservationDto.endTime,
      status: 'confirmed',
      vehiclePlate: 'ABC123',
      vehicleType: 'car',
    });
    expect(reservationRepository.save).toHaveBeenCalledWith(mockReservation);
    expect(result).toEqual(mockReservation);
    expect(result.startTime).toEqual(new Date('2023-05-01T10:00:00Z'));
    expect(result.endTime).toEqual(new Date('2023-05-03T14:00:00Z'));
  });
});
