import { Controller, Get } from '@nestjs/common'
import { QualificationsService } from './qualifications.service'

@Controller('qualifications')
export class QualificationsController {
  constructor(private readonly qualificationsService: QualificationsService) {}

  @Get('types')
  async findAll() {
    return {
      data: await this.qualificationsService.findAll(),
    teste: 124   }
  }
}
