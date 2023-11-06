import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { CreateEventDto } from './dto/create-event.dto'
import { EventsService } from './events.service'

import { AuthGuard } from 'src/auth/auth.guard'
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe'
import { PrismaService } from 'src/prisma.service'
import { AddUserToTeamDto } from './dto/add-user-to-team.dto'
import { CreateEventTeamDto } from './dto/create-event-team.dto'
import { User } from 'src/users/entities/user.entity'

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly prismaService: PrismaService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body(new JoiValidationPipe(CreateEventDto.createSchema))
    createEventDto: CreateEventDto
  ) {
    const userId = req['user'].id

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: createEventDto.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Advertiser not found')
    }

    const checkPlace = await this.prismaService.places.findFirst({
      where: {
        id: createEventDto.place_id,
        advertiser_id: createEventDto.advertiser_id
      }
    })

    if (!checkPlace) {
      throw new NotFoundException('Place not found')
    }

    return { data: await this.eventsService.create(createEventDto) }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id
    const eventId = +id

    const checkEventOnwer = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      },
      select: {
        advertiser_id: true
      }
    })

    if (!checkEventOnwer) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: checkEventOnwer.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    const event = await this.eventsService.getEvent(eventId)

    return { data: event }
  }

  @UseGuards(AuthGuard)
  @Post(':id/teams')
  async createTeam(@Req() req, @Param('id') id: string, @Body(new JoiValidationPipe(CreateEventTeamDto.createSchema)) body) {
    const userId = req['user'].id
    const eventId = +id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    return { data: await this.eventsService.createTeam(eventId, body) }
  }

  @UseGuards(AuthGuard)
  @Post(':id/teams/:teamId/duplicate')
  async duplicateTeam(@Req() req, @Param('id') id: string, @Param('teamId') teamId: string) {
    const userId = req['user'].id
    const eventId = +id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found1')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found2')
    }

    const team = await this.prismaService.teams.findFirst({
      where: {
        id: +teamId,
        event_id: +eventId
      }
    })

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    return { data: await this.eventsService.duplicateTeam(+teamId) }
  }

  @UseGuards(AuthGuard)
  @Post(':id/duplicate')
  async duplicate(@Req() req, @Param('id') id: string) {
    const userId = req['user'].id
    const eventId = +id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    return { data: await this.eventsService.duplicateEvent(+eventId) }
  }

  @UseGuards(AuthGuard)
  @Delete(':id/teams/:teamId/delete')
  async deleteTeam(@Req() req, @Param('id') id: string, @Param('teamId') teamId: string) {
    const userId = req['user'].id
    const eventId = +id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found1')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found2')
    }

    const team = await this.prismaService.teams.findFirst({
      where: {
        id: +teamId,
        event_id: +eventId
      }
    })

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    return {
      data: await this.eventsService.deleteTeam(+teamId)
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id/teams/:teamId')
  async getTeam(@Req() req, @Param('id') id: string, @Param('teamId') teamId) {
    const userId = req['user'].id
    const eventId = +id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    const team = await this.eventsService.getTeam(+teamId)

    return { data: team }
  }

  @UseGuards(AuthGuard)
  @Get('/:eventId/teams/:teamId/available-users')
  async getAvailableUsers(@Req() req, @Param('eventId') eventId: string, @Param('teamId') teamId: string) {
    const userId = req['user'].id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: +eventId
      },
      select: {
        advertiser_id: true
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    const team = await this.prismaService.teams.findFirst({
      where: {
        id: +teamId,
        event_id: +eventId
      }
    })

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    return {
      data: await this.eventsService.getAvailableUsers(+eventId, +teamId)
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:eventId/teams/:teamId/:teamUserId/:userId')
  async removeUserFromTeam(
    @Req() req,
    @Param('eventId') eventId: string,
    @Param('teamId') teamId: string,
    @Param('teamUserId') teamUserId: string,
    @Param('userId') userId: string
  ) {
    const userIdLogged = req['user'].id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: +eventId
      },
      select: {
        advertiser_id: true
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userIdLogged,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    const team = await this.prismaService.teams.findFirst({
      where: {
        id: +teamId,
        event_id: +eventId
      }
    })

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    const teamUser = await this.prismaService.teamsUsers.findFirst({
      where: {
        id: +teamUserId,
        teams_id: +teamId,
        user_id: +userId
      }
    })

    if (!teamUser) {
      throw new NotFoundException('Team user not found')
    }

    return {
      data: await this.eventsService.removeUserFromTeam(+teamUserId)
    }
  }

  @UseGuards(AuthGuard)
  @Post('/:eventId/teams/:teamId/add')
  async addUserToTeam(@Req() req, @Param('eventId') eventId: string, @Param('teamId') teamId: string, @Body(new JoiValidationPipe(AddUserToTeamDto.validationSchema)) body) {
    const { user_id: userId } = body
    const userIdLogged = req['user'].id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: +eventId
      },
      select: {
        advertiser_id: true
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userIdLogged,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    const team = await this.prismaService.teams.findFirst({
      where: {
        id: +teamId,
        event_id: +eventId
      }
    })

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    const teamHasAvailability = await this.prismaService.teamsUsers.findFirst({
      where: {
        teams_id: +teamId,
        user_id: null
      }
    })

    if (!teamHasAvailability) {
      throw new NotFoundException('Team is full')
    }

    return {
      data: await this.eventsService.addUserToTeam(teamHasAvailability.id, +userId)
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:eventId')
  async deleteEvent(@Req() req: Request & { user: User }, @Param('eventId') eventId: string) {
    const userId = req.user.id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: +eventId
      },
      select: {
        advertiser_id: true
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userId,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    return {
      data: await this.eventsService.deleteEvent(+eventId)
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:eventId/teams/:teamId/:teamUserId')
  async removeUserFromTeamByUserId(@Req() req, @Param('eventId') eventId: string, @Param('teamId') teamId: string, @Param('teamUserId') teamUserId: string) {
    const userIdLogged = req['user'].id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: +eventId
      },
      select: {
        advertiser_id: true
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userIdLogged,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    const team = await this.prismaService.teams.findFirst({
      where: {
        id: +teamId,
        event_id: +eventId
      }
    })

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    const teamUser = await this.prismaService.teamsUsers.findFirst({
      where: {
        id: +teamUserId
      }
    })

    if (!teamUser) {
      throw new NotFoundException('Team user not found')
    }

    return {
      data: await this.eventsService.removeUserFromTeam(+teamUser.id)
    }
  }

  @UseGuards(AuthGuard)
  @Put('/:eventId/teams/:teamId/:teamUserId/confirm')
  async confirmUserInTeam(@Req() req, @Param('eventId') eventId: string, @Param('teamId') teamId: string, @Param('teamUserId') teamUserId: string) {
    const userIdLogged = req['user'].id

    const event = await this.prismaService.events.findFirst({
      where: {
        id: +eventId
      },
      select: {
        advertiser_id: true
      }
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const checkAdvertiser = await this.prismaService.usersAdvertises.findFirst({
      where: {
        user_id: userIdLogged,
        advertiser_id: event.advertiser_id
      }
    })

    if (!checkAdvertiser) {
      throw new NotFoundException('Event not found')
    }

    const team = await this.prismaService.teams.findFirst({
      where: {
        id: +teamId,
        event_id: +eventId
      }
    })

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    const teamUser = await this.prismaService.teamsUsers.findFirst({
      where: {
        id: +teamUserId,
        teams_id: +teamId
      }
    })

    if (!teamUser) {
      throw new NotFoundException('Team user not found')
    }

    return {
      data: await this.eventsService.confirmUserInTeam(+teamUserId)
    }
  }
}
