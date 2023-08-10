import { Controller, Get } from '@nestjs/common';
import { Users } from '@prisma/client';
import { UsersService } from './users/services/users.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getHello(): Promise<Users[]> {
    return this.userService.users();
  }
}
