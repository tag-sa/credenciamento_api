import { Controller, Get } from '@nestjs/common';
import { UsersService } from './services/users/users.service';
import { Users } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getHello(): Promise<Users[]> {
    return this.userService.users();
  }
}
