import { Module } from '@nestjs/common'
import { NotificationsService } from 'src/notifications/notifications.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersService } from './UsersService'
import { UsersController } from './users.controller'

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, NotificationsService]
})
export class UsersModule {}
