import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
export type NotificationsTypes = 'all' | 'system' | 'email' | 'push' | 'sms' | 'whatsapp'

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUserNotificationsTypes(userId: number, notificationTypeId: number, notificationsTypes: NotificationsTypes[]) {
    await this.prismaService.notificationsTypesUsers.deleteMany({
      where: {
        user_id: userId,
        notifications_types_id: notificationTypeId
      }
    })

    const newNotificationsTypes = notificationsTypes.map((type) => {
      return { user_id: userId, notifications_types_id: notificationTypeId, type }
    })

    await this.prismaService.notificationsTypesUsers.createMany({
      data: newNotificationsTypes
    })
  }
}
