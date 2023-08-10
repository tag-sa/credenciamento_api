import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { UsersModule } from './users/users.module';
// import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
