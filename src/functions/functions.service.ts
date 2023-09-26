import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FunctionsService {
  constructor(private readonly prismService: PrismaService) {}

  findAll() {
    return this.prismService.functions.findMany();
  }
}
