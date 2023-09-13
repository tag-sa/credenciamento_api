import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private isConnected = false;

  async onModuleInit() {
    if (!this.isConnected) {
      await this.$connect();
      this.isConnected = true;
    }
  }
}
