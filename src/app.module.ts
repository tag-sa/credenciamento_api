import { Module } from '@nestjs/common'
import { AdvertisersModule } from './advertisers/advertisers.module'
import { AuthModule } from './auth/auth.module'
import { EventsModule } from './events/events.module'
import { FilesModule } from './files/files.module'
import { FunctionsModule } from './functions/functions.module'
import { JobsModule } from './jobs/jobs.module'
import { NotificationsModule } from './notifications/notifications.module'
import { OccurrencesModule } from './occurrences/occurrences.module'
import { QualificationsModule } from './qualifications/qualifications.module'
import { UsersModule } from './users/users.module'
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
    QualificationsModule
  ],
  controllers: []
})
export class AppModule {}
