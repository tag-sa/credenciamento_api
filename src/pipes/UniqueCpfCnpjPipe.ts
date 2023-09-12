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
export class UniqueCpfCnpjPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) protected readonly request: Request & { user: User },
  ) {}

  async transform(data: any) {
    const { document }: { document: string } = data;

    if (!document) return data;

    const prismaservice = new PrismaService();
    const unmaskedCpfCnpj = document
      .replaceAll('.', '')
      .replaceAll('-', '')
      .trim();

    let where: any = {
      cpf: unmaskedCpfCnpj,
    };

    if (this.request.method === 'PUT') {
      where = {
        AND: {
          OR: [
            {
              cpf: unmaskedCpfCnpj,
            },
            {
              cnpj: unmaskedCpfCnpj,
            },
          ],
          NOT: {
            id: +this.request.params.id,
          },
        },
      };
    }

    const checkDatabaseCpf = await prismaservice.users.findMany({
      where: where,
    });

    if (checkDatabaseCpf) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: ['Document already exists'],
      });
    }

    return data;
  }
}
