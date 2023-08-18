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
export class UniqueCpfPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) protected readonly request: Request & { user: User },
  ) {}

  async transform(data: any) {
    const { cpf }: { cpf: string } = data;

    if (!cpf) return data;

    const prismaservice = new PrismaService();
    const unmaskedCpf = cpf.replaceAll('.', '').replaceAll('-', '').trim();

    let where: any = {
      cpf: unmaskedCpf,
    };

    if (this.request.method === 'PUT') {
      where = {
        cpf: unmaskedCpf,
        AND: {
          NOT: {
            id: +this.request.params.id,
          },
        },
      };
    }

    const checkDatabaseCpf = await prismaservice.users.findUnique({
      where: where,
    });

    if (checkDatabaseCpf) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: ['Cpf already exists'],
      });
    }

    return data;
  }
}
