import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Scope,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UniqueEmailPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) protected readonly request: Request & { user: User },
  ) {}

  async transform(data: any) {
    const { email }: { email: string } = data;

    if (!email) return data;

    const prismaservice = new PrismaService();

    let where: any = {
      email: email.toLocaleLowerCase(),
    };

    if (this.request.method === 'PUT') {
      where = {
        email: email.toLocaleLowerCase(),
        AND: {
          NOT: {
            id: +this.request.params.id,
          },
        },
      };
    }

    const checkDatabaseEmail = await prismaservice.users.findUnique({
      where: where,
    });

    // console.log(where, checkDatabaseEmail);

    if (checkDatabaseEmail) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: ['Email already exists'],
      });
    }

    return data;
  }
}
