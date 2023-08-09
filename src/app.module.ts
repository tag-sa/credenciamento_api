import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { UsersService } from './services/users/users.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [PrismaService, UsersService],
})
export class AppModule {}
