import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { ZipController } from './zip.controller';

@Module({
  controllers: [ZipController],
  imports: [HttpModule],
})
export class ZipModule {}
