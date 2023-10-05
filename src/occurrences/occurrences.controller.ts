import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/auth.guard'
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe'
import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto'
import { OccurrencesService } from './occurrences.service'

@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return {
      data: await this.occurrencesService.findAll()
    }
  }

  @UseGuards(AuthGuard)
  @Post('eventOccurrences')
  async createEventOccurrence(
    @Body(new JoiValidationPipe(CreateEventOccurrenceDto.createSchema))
    createEventOcurrenceDto: CreateEventOccurrenceDto[]
  ) {
    return {
      data: await this.occurrencesService.createEventOcurrence(createEventOcurrenceDto)
    }
  }
}
