import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FunctionsController } from './functions.controller';
import { FunctionsService } from './functions.service';

@Module({
  controllers: [FunctionsController],
  providers: [FunctionsService],
  imports: [PrismaModule],
})
export class FunctionsModule {}
