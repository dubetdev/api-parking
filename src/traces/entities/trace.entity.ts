import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export type TraceDocument = Trace & Document;

@Schema()
export class Trace {
  @ApiProperty({
    description: 'Action performed (e.g., CREATE, UPDATE, DELETE)',
    example: 'CREATE',
  })
  @Prop({ required: true })
  action: string;

  @ApiProperty({
    description: 'Module where the action was performed',
    example: 'Users',
  })
  @Prop({ required: true })
  module: string;

  @ApiProperty({
    description: 'User who performed the action',
    type: () => User,
  })
  @Prop({ type: MongooseSchema.Types.Mixed })
  user: User;

  @ApiProperty({
    description: 'Relevant data (optional)',
    type: 'object',
    required: false,
  })
  @Prop({ type: MongooseSchema.Types.Mixed })
  data?: any;

  @ApiProperty({ description: 'Timestamp of the action', type: Date })
  @Prop({ default: Date.now })
  timestamp: Date;
}

export const TraceSchema = SchemaFactory.createForClass(Trace);