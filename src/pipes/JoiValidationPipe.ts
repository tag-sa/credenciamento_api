import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value, { abortEarly: false });

    if (error) {
      const errors = [];
      error.details.forEach((err) => {
        errors.push(err.message);
      });

      throw new BadRequestException({
        message: 'Validation failed',
        errors: errors,
      });
    }
    return value;
  }
}
