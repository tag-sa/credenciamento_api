import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

import { AdvertisersModule } from './advertisers/advertisers.module'
import { EventsModule } from './events/events.module'
import { FunctionsModule } from './functions/functions.module'
import { NotificationsModule } from './notifications/notifications.module'
import { OccurrencesModule } from './occurrences/occurrences.module'
import { ZipModule } from './zip/zip.module'

@Module({
  imports: [UsersModule, ZipModule, AuthModule, AdvertisersModule, EventsModule, FunctionsModule, OccurrencesModule, NotificationsModule],
  controllers: [],
  providers: []
})
export class AppModule {}
