import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { GetOneRules } from './api-get-one';

export class DeleteResult {
  @ApiProperty()
  raw: any;
  /** The number of documents that were deleted */
  @ApiProperty()
  affected?: number | null;
}
export const ApiDeleteOne = (
  entityName: string,
  param?: string,
  output?: any,
  rules?: GetOneRules,
) => {
  const rulesResponses = [];
  if (rules?.uuid)
    rulesResponses.push(
      ApiBadRequestResponse({
        status: 400,
        description: `The ${param} is not a valid MongoID.`,
      }),
    );
  return applyDecorators(
    ApiParam({ name: param || 'id', type: String }),
    ApiOkResponse({
      status: 200,
      description: `The ${entityName} has been successfully deleted.`,
      type: output || DeleteResult,
    }),
    ApiNotFoundResponse({
      status: 404,
      description: `The ${entityName} not exist.`,
    }),
    ...rulesResponses,
  );
};
