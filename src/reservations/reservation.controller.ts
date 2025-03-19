import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto, UpdateReservationStatusDto } from './dto';
import { Reservation } from './entities/reservation.entity';
import { ApiTags } from '@nestjs/swagger';
import { Trace } from '../traces/decorators';
import { TracesActions } from '../common/constants';
import { ModuleRef } from '@nestjs/core';
import { ApiCreate, ApiSearch, Auth } from '../common/decorators';
import { UserRole } from '../users/contants';
import { ApiUpdate } from '../common/decorators/api-update';

@Controller('reservations')
@ApiTags('Reservations')
@Auth()
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Post()
  @ApiCreate(Reservation, CreateReservationDto, Reservation.name)
  @Trace({ action: TracesActions.CREATE, module: 'RESERVATIONS' })
  async create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    return this.reservationService.createReservation(createReservationDto);
  }
  @Put(':id/status')
  @Auth(UserRole.ADMIN)
  @ApiUpdate(Reservation.name, UpdateReservationStatusDto, Reservation, {
    uuid: true,
  })
  @Trace({ action: TracesActions.CHANGE_STATUS, module: 'RESERVATIONS' })
  async updateReservationStatus(
    @Param('id') id: string,
    @Body() updateReservationStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationService.changeReservationStatus(
      id,
      updateReservationStatusDto.status,
    );
  }

  @Get('search')
  @ApiSearch(Reservation)
  @Auth(UserRole.EMPLOYEE)
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reservationService.findAll({
      page,
      limit,
      order: { id: 'DESC' },
    });
  }
}
