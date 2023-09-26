import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { FunctionsService } from './functions.service';

@Controller('functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return { data: await this.functionsService.findAll() };
  }
}
