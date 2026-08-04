import { registerDecorator, ValidationOptions } from 'class-validator';
import { NotEqualToConstraint } from '../constraints/not-equal-to.constraint';

export function NotEqualTo(property: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: [property],
      options,
      validator: NotEqualToConstraint,
    });
  };
}
