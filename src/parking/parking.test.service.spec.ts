import { Test, TestingModule } from '@nestjs/testing';
import { ParkingService } from './parking.service';
import { Repository } from 'typeorm';
import { ParkingSpot } from './entities/parking.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ParkingService', () => {
  let parkingService: ParkingService;
  let parkingSpotRepository: Repository<ParkingSpot>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParkingService,
        {
          provide: getRepositoryToken(ParkingSpot),
          useValue: mockRepository,
        },
      ],
    }).compile();

    parkingService = module.get<ParkingService>(ParkingService);
    parkingSpotRepository = module.get<Repository<ParkingSpot>>(
      getRepositoryToken(ParkingSpot),
    );
  });

  it('should return an empty array when no parking spots are available', async () => {
    jest.spyOn(parkingSpotRepository, 'find').mockResolvedValue([]);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });
    expect(result).toEqual([]);
  });

  it('should correctly group available parking spots by floor and section', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: 1, section: 'A', isAvailable: true },
      { id: '2', floor: 1, section: 'A', isAvailable: true },
      { id: '3', floor: 1, section: 'B', isAvailable: true },
      { id: '4', floor: 2, section: 'A', isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1,
        section: 'A',
        availableSpots: [
          { id: '1', floor: 1, section: 'A', isAvailable: true },
          { id: '2', floor: 1, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 1,
        section: 'B',
        availableSpots: [
          { id: '3', floor: 1, section: 'B', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: 'A',
        availableSpots: [
          { id: '4', floor: 2, section: 'A', isAvailable: true },
        ],
      },
    ]);
  });

  it('should handle multiple parking spots in the same floor and section', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: 1, section: 'A', isAvailable: true },
      { id: '2', floor: 1, section: 'A', isAvailable: true },
      { id: '3', floor: 1, section: 'A', isAvailable: true },
      { id: '4', floor: 2, section: 'B', isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1,
        section: 'A',
        availableSpots: [
          { id: '1', floor: 1, section: 'A', isAvailable: true },
          { id: '2', floor: 1, section: 'A', isAvailable: true },
          { id: '3', floor: 1, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: 'B',
        availableSpots: [
          { id: '4', floor: 2, section: 'B', isAvailable: true },
        ],
      },
    ]);
  });

  it('should handle parking spots from different floors but same section', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: 1, section: 'A', isAvailable: true },
      { id: '2', floor: 2, section: 'A', isAvailable: true },
      { id: '3', floor: 3, section: 'A', isAvailable: true },
      { id: '4', floor: 4, section: 'B', isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1,
        section: 'A',
        availableSpots: [
          { id: '1', floor: 1, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: 'A',
        availableSpots: [
          { id: '2', floor: 2, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 3,
        section: 'A',
        availableSpots: [
          { id: '3', floor: 3, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 4,
        section: 'B',
        availableSpots: [
          { id: '4', floor: 4, section: 'B', isAvailable: true },
        ],
      },
    ]);
  });

  it('should correctly handle parking spots with non-alphanumeric section identifiers', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: 1, section: 'A-1', isAvailable: true },
      { id: '2', floor: 1, section: 'B@2', isAvailable: true },
      { id: '3', floor: 2, section: 'C#3', isAvailable: true },
      { id: '4', floor: 2, section: 'D$4', isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1,
        section: 'A-1',
        availableSpots: [
          { id: '1', floor: 1, section: 'A-1', isAvailable: true },
        ],
      },
      {
        floor: 1,
        section: 'B@2',
        availableSpots: [
          { id: '2', floor: 1, section: 'B@2', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: 'C#3',
        availableSpots: [
          { id: '3', floor: 2, section: 'C#3', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: 'D$4',
        availableSpots: [
          { id: '4', floor: 2, section: 'D$4', isAvailable: true },
        ],
      },
    ]);
  });

  it('should handle parking spots with negative floor numbers', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: -2, section: 'A', isAvailable: true },
      { id: '2', floor: -1, section: 'B', isAvailable: true },
      { id: '3', floor: 0, section: 'C', isAvailable: true },
      { id: '4', floor: 1, section: 'D', isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: -2,
        section: 'A',
        availableSpots: [
          { id: '1', floor: -2, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: -1,
        section: 'B',
        availableSpots: [
          { id: '2', floor: -1, section: 'B', isAvailable: true },
        ],
      },
      {
        floor: 0,
        section: 'C',
        availableSpots: [
          { id: '3', floor: 0, section: 'C', isAvailable: true },
        ],
      },
      {
        floor: 1,
        section: 'D',
        availableSpots: [
          { id: '4', floor: 1, section: 'D', isAvailable: true },
        ],
      },
    ]);
  });

  it('should correctly process parking spots with very high floor numbers', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: 1000000, section: 'A', isAvailable: true },
      { id: '2', floor: 1000001, section: 'B', isAvailable: true },
      { id: '3', floor: 9999999, section: 'C', isAvailable: true },
      { id: '4', floor: 10000000, section: 'D', isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1000000,
        section: 'A',
        availableSpots: [
          { id: '1', floor: 1000000, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 1000001,
        section: 'B',
        availableSpots: [
          { id: '2', floor: 1000001, section: 'B', isAvailable: true },
        ],
      },
      {
        floor: 9999999,
        section: 'C',
        availableSpots: [
          { id: '3', floor: 9999999, section: 'C', isAvailable: true },
        ],
      },
      {
        floor: 10000000,
        section: 'D',
        availableSpots: [
          { id: '4', floor: 10000000, section: 'D', isAvailable: true },
        ],
      },
    ]);
  });

  it('should correctly process parking spots with duplicate IDs', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: 1, section: 'A', isAvailable: true },
      { id: '1', floor: 1, section: 'A', isAvailable: true }, // Duplicate ID
      { id: '2', floor: 1, section: 'B', isAvailable: true },
      { id: '3', floor: 2, section: 'A', isAvailable: true },
      { id: '3', floor: 2, section: 'A', isAvailable: true }, // Duplicate ID
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1,
        section: 'A',
        availableSpots: [
          { id: '1', floor: 1, section: 'A', isAvailable: true },
          { id: '1', floor: 1, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 1,
        section: 'B',
        availableSpots: [
          { id: '2', floor: 1, section: 'B', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: 'A',
        availableSpots: [
          { id: '3', floor: 2, section: 'A', isAvailable: true },
          { id: '3', floor: 2, section: 'A', isAvailable: true },
        ],
      },
    ]);

    // Check that all spots are included, even those with duplicate IDs
    const totalSpots = result.reduce(
      (sum, group) => sum + group.availableSpots.length,
      0,
    );
    expect(totalSpots).toBe(mockAvailableSpots.length);
  });

  it('should handle a mix of available and unavailable parking spots', async () => {
    const mockSpots = [
      { id: '1', floor: 1, section: 'A', isAvailable: true },
      { id: '2', floor: 1, section: 'A', isAvailable: false },
      { id: '3', floor: 1, section: 'B', isAvailable: true },
      { id: '4', floor: 2, section: 'A', isAvailable: true },
      { id: '5', floor: 2, section: 'B', isAvailable: false },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockSpots.filter((spot) => spot.isAvailable));

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1,
        section: 'A',
        availableSpots: [
          { id: '1', floor: 1, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 1,
        section: 'B',
        availableSpots: [
          { id: '3', floor: 1, section: 'B', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: 'A',
        availableSpots: [
          { id: '4', floor: 2, section: 'A', isAvailable: true },
        ],
      },
    ]);

    expect(result.length).toBe(3);
    expect(result.flatMap((group) => group.availableSpots).length).toBe(3);
  });

  it('should correctly process parking spots with floating-point floor numbers', async () => {
    const mockAvailableSpots = [
      { id: '1', floor: 1.5, section: 'A', isAvailable: true },
      { id: '2', floor: 2.75, section: 'B', isAvailable: true },
      { id: '3', floor: 3.25, section: 'A', isAvailable: true },
      { id: '4', floor: 1.5, section: 'C', isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1.5,
        section: 'A',
        availableSpots: [
          { id: '1', floor: 1.5, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 2.75,
        section: 'B',
        availableSpots: [
          { id: '2', floor: 2.75, section: 'B', isAvailable: true },
        ],
      },
      {
        floor: 3.25,
        section: 'A',
        availableSpots: [
          { id: '3', floor: 3.25, section: 'A', isAvailable: true },
        ],
      },
      {
        floor: 1.5,
        section: 'C',
        availableSpots: [
          { id: '4', floor: 1.5, section: 'C', isAvailable: true },
        ],
      },
    ]);
  });

  it('should handle parking spots with very long section identifiers', async () => {
    const longSectionIdentifier = 'A'.repeat(1000);
    const mockAvailableSpots = [
      { id: '1', floor: 1, section: longSectionIdentifier, isAvailable: true },
      { id: '2', floor: 1, section: longSectionIdentifier, isAvailable: true },
      { id: '3', floor: 2, section: 'B', isAvailable: true },
      { id: '4', floor: 2, section: longSectionIdentifier, isAvailable: true },
    ] as ParkingSpot[];

    jest
      .spyOn(parkingSpotRepository, 'find')
      .mockResolvedValue(mockAvailableSpots);

    const result = await parkingService.getAvailableParkingSpots();

    expect(parkingSpotRepository.find).toHaveBeenCalledWith({
      where: { isAvailable: true },
    });

    expect(result).toEqual([
      {
        floor: 1,
        section: longSectionIdentifier,
        availableSpots: [
          {
            id: '1',
            floor: 1,
            section: longSectionIdentifier,
            isAvailable: true,
          },
          {
            id: '2',
            floor: 1,
            section: longSectionIdentifier,
            isAvailable: true,
          },
        ],
      },
      {
        floor: 2,
        section: 'B',
        availableSpots: [
          { id: '3', floor: 2, section: 'B', isAvailable: true },
        ],
      },
      {
        floor: 2,
        section: longSectionIdentifier,
        availableSpots: [
          {
            id: '4',
            floor: 2,
            section: longSectionIdentifier,
            isAvailable: true,
          },
        ],
      },
    ]);

    expect(result[0].section.length).toBe(1000);
    expect(result[2].section.length).toBe(1000);
  });

  it('should correctly handle concurrent requests for available parking spots', async () => {
    const mockSpots = [
      { id: '1', floor: 1, section: 'A', isAvailable: true },
      { id: '2', floor: 1, section: 'B', isAvailable: true },
      { id: '3', floor: 2, section: 'A', isAvailable: true },
    ] as ParkingSpot[];

    jest.spyOn(parkingSpotRepository, 'find').mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockSpots), Math.random() * 100);
      });
    });

    const concurrentRequests = 5;
    const results = await Promise.all(
      Array(concurrentRequests)
        .fill(null)
        .map(() => parkingService.getAvailableParkingSpots()),
    );

    results.forEach((result) => {
      expect(result).toEqual([
        {
          floor: 1,
          section: 'A',
          availableSpots: [
            { id: '1', floor: 1, section: 'A', isAvailable: true },
          ],
        },
        {
          floor: 1,
          section: 'B',
          availableSpots: [
            { id: '2', floor: 1, section: 'B', isAvailable: true },
          ],
        },
        {
          floor: 2,
          section: 'A',
          availableSpots: [
            { id: '3', floor: 2, section: 'A', isAvailable: true },
          ],
        },
      ]);
    });

    expect(parkingSpotRepository.find).toHaveBeenCalledTimes(
      concurrentRequests,
    );
  });
});
