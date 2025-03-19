import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { GetOneRules } from './api-get-one';

export const ApiUpdate = (
  entityName: string,
  input: any,
  output: any,
  rules?: GetOneRules,
) => {
  const rulesResponses = [];
  if (rules?.uuid)
    rulesResponses.push(
      ApiBadRequestResponse({
        status: 400,
        description: `The id is not a valid MongoID.`,
      }),
    );
  return applyDecorators(
    ApiParam({ name: 'id', type: String }),
    ApiBody({ type: input }),
    ApiOkResponse({
      status: 200,
      description: `The ${entityName} has been successfully updated.`,
      type: output,
    }),
    ApiNotFoundResponse({
      status: 404,
      description: `The ${entityName} not exist.`,
    }),
    ...rulesResponses,
  );
};
