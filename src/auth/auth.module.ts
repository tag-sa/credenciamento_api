import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      privateKey: jwtConstants.secret,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '600s' },
    }),
    PrismaModule,
  ],
  providers: [UsersService],
  controllers: [],
  exports: [],
})
export class AuthModule {}
