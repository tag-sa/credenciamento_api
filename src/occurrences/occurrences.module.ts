import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { OccurrencesController } from './occurrences.controller'
import { OccurrencesService } from './occurrences.service'

@Module({
  controllers: [OccurrencesController],
  providers: [OccurrencesService],
  imports: [PrismaModule]
})
export class OccurrencesModule {}
