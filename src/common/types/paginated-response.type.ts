import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseType<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  lastPage: number;

  @ApiProperty()
  hasNextPage: boolean;
}
