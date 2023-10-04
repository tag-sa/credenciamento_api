import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto'

@Injectable()
export class OccurrencesService {
  constructor(private readonly prismaService: PrismaService) {}

  createEventOcurrence(createEventOcurrenceDto: CreateEventOccurrenceDto[]) {
    return this.prismaService.eventsOccurrences.createMany({
      data: createEventOcurrenceDto
    })
  }

  async findAll() {
    return await this.prismaService.occurrences.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    })
  }
}
