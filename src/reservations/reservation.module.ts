import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ParkingSpot } from '../parking/entities/parking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ParkingSpot])],
  providers: [ReservationService],
  controllers: [ReservationController],
})
export class ReservationModule {} 