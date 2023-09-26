import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private isConnected = false;

  async onModuleInit() {
    await this.connect();
  }

  async onApplicationShutdown(signal?: string) {
    await this.disconnect();
  }

  private async connect() {
    if (!this.isConnected) {
      await this.$connect();
      this.isConnected = true;
    }
  }

  private async disconnect() {
    if (this.isConnected) {
      await this.$disconnect();
      this.isConnected = false;
    }
  }
}
