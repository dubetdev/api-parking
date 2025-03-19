import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TraceService } from './trace.service';
import { TraceController } from './trace.controller';
import { Trace, TraceSchema } from './entities/trace.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trace.name, schema: TraceSchema }]),
  ],
  providers: [TraceService],
  controllers: [TraceController],
  exports: [TraceService],
})
export class TraceModule {}
