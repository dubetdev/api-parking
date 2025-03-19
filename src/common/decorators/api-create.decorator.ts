import { applyDecorators, Type } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreate<T extends Type<unknown>, C extends Type<unknown>>(
  entityType: T,
  createDtoType: C,
  entityName: string,
) {
  return applyDecorators(
    ApiOperation({ summary: `Create a new ${entityName}` }),
    ApiBody({ type: createDtoType }),
    ApiResponse({
      status: 201,
      description: `The ${entityName} has been successfully created.`,
      type: entityType,
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
  );
}
