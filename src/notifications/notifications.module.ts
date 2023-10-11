import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [NotificationsService]
})
export class NotificationsModule {}
