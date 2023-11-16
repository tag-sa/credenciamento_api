import { Module } from '@nestjs/common'
import { PanelService } from './panel.service'
import { PanelController } from './panel.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { EventsService } from 'src/events/events.service'

@Module({
  controllers: [PanelController],
  providers: [PanelService, EventsService],
  imports: [PrismaModule]
})
export class PanelModule {}
