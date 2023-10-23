import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { QualificationsController } from './qualifications.controller'
import { QualificationsService } from './qualifications.service'

@Module({
  imports: [PrismaModule],
  controllers: [QualificationsController],
  providers: [QualificationsService]
})
export class QualificationsModule {}
