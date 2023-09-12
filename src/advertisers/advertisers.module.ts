import { Module } from '@nestjs/common';
import { AdvertisersService } from './advertisers.service';
import { AdvertisersController } from './advertisers.controller';

@Module({
  controllers: [AdvertisersController],
  providers: [AdvertisersService],
})
export class AdvertisersModule {}
