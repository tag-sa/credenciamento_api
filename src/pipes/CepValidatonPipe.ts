import {
  PipeTransform,
  Injectable,
  Scope,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class ZipPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) protected readonly request: Request & { user: User },
  ) {}

  async transform(zip: any) {
    const unmaskedZip = zip.replaceAll('-', '').trim();

    if (unmaskedZip.length !== 8) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: ['Cep must be 8 characters long'],
      });
    }

    if (isNaN(+unmaskedZip)) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: ['Cep must contain only numbers'],
      });
    }

    return zip;
  }
}
