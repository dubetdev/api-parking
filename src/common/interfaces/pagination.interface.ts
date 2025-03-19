import { FindOptionsOrder } from 'typeorm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  order?: FindOptionsOrder<any>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
  hasNextPage: boolean;
}
