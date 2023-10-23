import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

import { BullModule } from '@nestjs/bull'
import { AdvertisersModule } from './advertisers/advertisers.module'
import { EventsModule } from './events/events.module'
import { FilesModule } from './files/files.module'
import { FunctionsModule } from './functions/functions.module'
import { JobsModule } from './jobs/jobs.module'
import { NotificationsModule } from './notifications/notifications.module'
import { OccurrencesModule } from './occurrences/occurrences.module'
import { QualificationsModule } from './qualifications/qualifications.module'
import { ZipModule } from './zip/zip.module'

@Module({
  imports: [
    UsersModule,
    ZipModule,
    AuthModule,
    JobsModule,
    AdvertisersModule,
    EventsModule,
    FunctionsModule,
    OccurrencesModule,
    NotificationsModule,
    FilesModule,
    QualificationsModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379
      }
    }),
    BullModule.registerQueue({
      name: 'audio',
      redis: {
        port: 6380
      }
    })
  ],
  controllers: []
})
export class AppModule {}
