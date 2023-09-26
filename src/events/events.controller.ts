import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

import { AuthGuard } from 'src/auth/auth.guard';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { PrismaService } from 'src/prisma.service';
import { CreateEventTeamDto } from './dto/create-event-team.dto';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body(new JoiValidationPipe(CreateEventDto.createSchema))
    createEventDto: CreateEventDto,
  ) {
    const userId = req['user'].id;

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: createEventDto.advertiser_id,
      },
    });

    if (!checkAdvertiser) {
      throw new NotFoundException('Advertiser not found');
    }

    const checkPlace = await this.prismaService.places.findFirst({
      where: {
        id: createEventDto.place_id,
        advertiser_id: createEventDto.advertiser_id,
      },
    });

    if (!checkPlace) {
      throw new NotFoundException('Place not found');
    }

    return { data: await this.eventsService.create(createEventDto) };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id;
    const eventId = +id;

    const checkEventOnwer = await this.prismaService.events.findFirst({
      where: {
        id: eventId,
      },
      select: {
        advertiser_id: true,
      },
    });

    if (!checkEventOnwer) {
      throw new NotFoundException('Event not found');
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: checkEventOnwer.advertiser_id,
      },
    });

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.eventsService.getEvent(eventId);

    return { data: event };
  }

  @UseGuards(AuthGuard)
  @Post(':id/teams')
  async createTeam(
    @Req() req,
    @Param('id') id: string,
    @Body(new JoiValidationPipe(CreateEventTeamDto.createSchema)) body,
  ) {
    const userId = req['user'].id;
    const eventId = +id;

    const event = await this.prismaService.events.findFirst({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id,
      },
    });

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found');
    }

    return { data: await this.eventsService.createTeam(eventId, body) };
  }
}
