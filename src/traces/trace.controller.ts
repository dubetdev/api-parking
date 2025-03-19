import { Controller, Get } from '@nestjs/common';
import { TraceService } from './trace.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('trace')
@ApiTags('Traces')
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Get()
  async findAll() {
    return await this.traceService.findAll();
  }
}
