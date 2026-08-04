import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'NotEqualTo', async: false })
export class NotEqualToConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, validationArguments: ValidationArguments): boolean {
    const relatedPropertyName = validationArguments.constraints[0] as string;

    const relatedValue = (
      validationArguments.object as Record<string, unknown>
    )[relatedPropertyName];

    return value !== relatedValue;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const relatedPropertyName = validationArguments.constraints[0] as string;

    return `${validationArguments.property} must be different from ${relatedPropertyName}`;
  }
}
