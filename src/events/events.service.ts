import { Injectable } from '@nestjs/common';
import { StatusType } from '@prisma/client';
import moment from 'moment';
import { PrismaService } from 'src/prisma.service';
import { CreateEventTeamUserDto } from './dto/create-event-team-user.dto';
import { CreateEventTeamDto } from './dto/create-event-team.dto';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getEvent(eventId: number) {
    let event = await this.prismaService.events.findFirst({
      where: {
        id: eventId,
      },
      include: {
        place: true,
        advertiser: true,
        teams: {
          include: {
            teamStatus: true,
            teamsUsers: { include: { user: true, function: true } },
          },
        },
      },
    });

    event = await this.eventCost(event);

    return event;
  }

  async getTeam(teamId: number) {
    const geatTeam = await this.prismaService.teams.findFirst({
      where: {
        id: teamId,
      },
      include: {
        teamStatus: true,
        teamsUsers: { include: { user: true, function: true } },
      },
    });

    const [team] = this.teamCost([geatTeam]);

    return team;
  }

  async create(createEventDto: CreateEventDto) {
    let save = await this.prismaService.events.create({
      data: {
        name: createEventDto.name,
        date_start: moment(createEventDto.date_start).toDate(),
        date_end: moment(createEventDto.date_end).toDate(),
        status: StatusType[createEventDto.status],
        place_id: createEventDto.place_id,
        advertiser_id: createEventDto.advertiser_id,
      },
    });

    save = await this.eventCost(save);

    return save;
  }

  async createTeam(
    eventId: number,
    body: CreateEventTeamDto & { functions_id: number },
  ) {
    const saveTeam = await this.prismaService.teams.create({
      data: {
        event_id: eventId,
        sector_id: body.sector_id,
        team_status_id: 1,
        name: body.name,
        status: StatusType[body.status],
        quantity: body.quantity,
        date_start: moment(body.date_start).toDate(),
        date_end: moment(body.date_end).toDate(),
        extra_amount: body.extra_amount,
      },
    });

    const teamId = saveTeam.id;

    const teamsUsersToCreate = [];

    Array.from({ length: body.quantity }).map(() => {
      const newTeamUser: CreateEventTeamUserDto = {
        teams_id: teamId,
        function_id: body.functions_id,
        date_start: moment(body.date_start).toDate(),
        date_end: moment(body.date_end).toDate(),
        confirmed: 'a',
        user_id: null,
        teams_users_status_id: 1,
      };

      teamsUsersToCreate.push(newTeamUser);
    });

    await this.prismaService.teamsUsers.createMany({
      data: teamsUsersToCreate,
    });

    const teamToReturn = await this.prismaService.teams.findFirst({
      where: {
        id: teamId,
      },
      include: {
        teamStatus: true,
        teamsUsers: {
          include: {
            function: true,
          },
        },
      },
    });

    const [team] = this.teamCost([teamToReturn]);

    return team;
  }

  async eventCost(event: any) {
    if (!event.teams) {
      event.total_preview = 0;
      event.total_executed = 0;
      event.total_by_answers = 0;

      return event;
    }

    event.teams = this.teamCost(event.teams);

    const total_preview = event.teams.reduce(
      (a, b: any) => a + b.total_preview,
      0,
    );
    const total = event.teams.reduce((a, b: any) => a + b.total_executed, 0);
    const totalByAnswers = event.teams.reduce(
      (a, b: any) => a + b.total_by_answers,
      0,
    );

    event.total_preview = total_preview;
    event.total_executed = total;
    event.total_by_answers = totalByAnswers;

    return event;
  }

  teamCost(teams: any[]) {
    teams.map((team: any) => {
      team.total_preview = 0;
      team.total_by_answers = 0;
      team.total_executed = 0;

      team.teamsUsers.map((tu) => {
        let teamMemberCostPreview = 0;
        let teamMemberCostPreviewByAnswer = 0;
        let teamMemberCostExecuted = 0;

        const starWork = moment(tu.date_start);
        const endWork = moment(tu.date_end);

        const workedMinutes = endWork.diff(starWork, 'minutes');

        tu.minutes_worked = workedMinutes;

        if (tu.function.tax_type == 'period') {
          teamMemberCostPreview = tu.function.tax + tu.extra_amount;
        }

        if (tu.function.tax_type == 'hour') {
          const taxByMinute = tu.function.tax / 60;

          teamMemberCostPreview = workedMinutes * taxByMinute + tu.extra_amount;
        }

        if (tu.confirmed == 'c' && tu.user_id != null) {
          teamMemberCostPreviewByAnswer = teamMemberCostPreview;

          if (tu.teams_users_status_id == 2) {
            teamMemberCostExecuted = teamMemberCostPreview;
          }
        }

        tu.worked_amount = teamMemberCostPreview;
        tu.total_amount = teamMemberCostPreview;

        team.total_preview += teamMemberCostPreview;
        team.total_by_answers += teamMemberCostPreviewByAnswer;
        team.total_executed += teamMemberCostExecuted;

        return tu;
      });

      return team;
    });

    return teams;
  }

  async getAvailableUsers(eventId: number, teamId: number): Promise<any[]> {
    const teamsUsers = await this.prismaService.teamsUsers.findMany({
      select: {
        user_id: true,
      },
      where: {
        teams_id: teamId,
        AND: {
          NOT: {
            user_id: null,
          },
        },
      },
    });

    const availableUsers = await this.prismaService.users.findMany({
      where: {
        NOT: {
          id: {
            in: teamsUsers.map((tu) => tu.user_id),
          },
        },
      },
    });

    if (availableUsers.length) {
      availableUsers.map((user) => delete user.password);
    }

    return availableUsers;
  }

  async confirmUserInTeam(teamUserId: number) {
    return await this.prismaService.teamsUsers.update({
      where: {
        id: teamUserId,
      },
      data: {
        confirmed: 'c',
      },
    });
  }

  async addUserToTeam(teamUserId: number, userId: number) {
    await this.prismaService.teamsUsers.update({
      where: {
        id: teamUserId,
      },
      data: {
        user_id: userId,
      },
    });

    return true;
  }

  async removeUserFromTeam(teamUserId: number) {
    return await this.prismaService.teamsUsers.update({
      where: {
        id: teamUserId,
      },
      data: {
        confirmed: 'a',
        user_id: null,
      },
    });
  }
}
