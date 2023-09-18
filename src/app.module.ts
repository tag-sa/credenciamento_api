import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { AdvertisersModule } from './advertisers/advertisers.module';
import { ZipModule } from './zip/zip.module';

@Module({
  imports: [UsersModule, ZipModule, AuthModule, AdvertisersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
