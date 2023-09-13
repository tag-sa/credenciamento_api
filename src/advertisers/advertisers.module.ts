import { Module } from '@nestjs/common';
import { AdvertisersService } from './advertisers.service';
import { AdvertisersController } from './advertisers.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AdvertisersController],
  providers: [AdvertisersService, PrismaService],
})
export class AdvertisersModule {}
