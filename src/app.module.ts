import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { AdvertisersModule } from './advertisers/advertisers.module';
import { ZipModule } from './zip/zip.module';
import { EventsModule } from './events/events.module';
import { FunctionsModule } from './functions/functions.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    UsersModule,
    ZipModule,
    AuthModule,
    AdvertisersModule,
    EventsModule,
    FunctionsModule,
    JobsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
