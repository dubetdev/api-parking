import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trace, TraceDocument } from './entities/trace.entity';

@Injectable()
export class TraceService {
  constructor(
    @InjectModel(Trace.name) private traceModel: Model<TraceDocument>,
  ) {}

  /**
   * Logs a trace entry with the provided information.
   *
   * @param action - The action being performed.
   * @param module - The module where the action is taking place.
   * @param user - The user performing the action.
   * @param data - Optional additional data related to the action.
   * @returns A promise that resolves when the trace is saved.
   */
  async log(
    action: string,
    module: string,
    user: string,
    data?: any,
  ): Promise<void> {
    const trace = new this.traceModel({
      action,
      module,
      data,
      user,
    });
    await trace.save();
  }

  /**
   * Retrieves all trace entries from the database.
   *
   * @returns A promise that resolves to an array of Trace objects.
   */
  async findAll(): Promise<Trace[]> {
    return this.traceModel.find().exec();
  }
}
