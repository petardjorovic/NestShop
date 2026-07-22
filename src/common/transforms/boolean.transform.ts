import { BadRequestException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';

export function booleanTransform({
  value,
}: TransformFnParams): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new BadRequestException(
    'Boolean query parameter must be "true" or "false".',
  );
}
