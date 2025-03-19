import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';

export type GetOneRules = {
  uuid?: boolean;
};

export const ApiGetOne = (
  entityName: string,
  param: string,
  output: any,
  rules?: GetOneRules,
) => {
  const rulesResponses = [];
  if (rules?.uuid)
    rulesResponses.push(
      ApiBadRequestResponse({
        status: 400,
        description: `The ${param} is not a valid UUID.`,
      }),
    );

  return applyDecorators(
    ApiParam({ name: param, type: String }),
    ApiOkResponse({
      status: 200,
      description: `The ${entityName} value.`,
      type: output,
    }),
    ApiNotFoundResponse({
      status: 404,
      description: `The ${entityName} not exist.`,
    }),
    ...rulesResponses,
  );
};
