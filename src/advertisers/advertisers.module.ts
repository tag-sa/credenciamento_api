import { Module } from '@nestjs/common';
import { EventsService } from 'src/events/events.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdvertisersController } from './advertisers.controller';
import { AdvertisersService } from './advertisers.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdvertisersController],
  providers: [AdvertisersService, EventsService],
})
export class AdvertisersModule {}
