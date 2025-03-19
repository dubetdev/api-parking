import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaginatedResult, PaginationOptions } from '../interfaces';

export abstract class BaseService<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const order = options.order || { id: 'DESC' };

    const [data, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order,
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      lastPage,
      hasNextPage: page < lastPage,
    };
  }

  async findOne(conditions: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.repository.findOne({ where: conditions });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne({ id } as unknown as FindOptionsWhere<T>);
    const updated = this.repository.merge(entity, data);
    return await this.repository.save(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Entity not found');
    }
  }
}
