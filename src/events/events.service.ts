import { Injectable } from '@nestjs/common'
import { StatusType } from '@prisma/client'
import moment from 'moment'
import { PrismaService } from 'src/prisma.service'
import { CreateEventTeamUserDto } from './dto/create-event-team-user.dto'
import { CreateEventTeamDto } from './dto/create-event-team.dto'
import { CreateEventDto } from './dto/create-event.dto'

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getEvent(eventId: number) {
    let event = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      },
      include: {
        place: true,
        advertiser: true,
        teams: {
          include: {
            teamStatus: true,
            teamsUsers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    score: true
                  }
                },
                function: true
              }
            }
          }
        }
      }
    })

    if (event.teams.length) {
      await Promise.all(
        event.teams.map(async (team) => {
          await Promise.all(
            team.teamsUsers.map(async (tu) => {
              if (!tu.user_id) return

              const avatar = await this.prismaService.files.findFirst({
                where: {
                  entity_id: tu.user.id,
                  entity: 'user_avatar'
                },
                select: {
                  url: true
                }
              })

              tu.user['avatar'] = avatar ? avatar.url : null

              return tu
            })
          )
          return team
        })
      )
    }

    event = await this.eventCost(event)

    return event
  }

  async duplicateEvent(eventId: number) {
    const event = await this.prismaService.events.findFirst({
      where: {
        id: eventId
      }
    })

    delete event.id

    const teams = await this.prismaService.teams.findMany({
      where: {
        event_id: eventId
      },
      include: {
        teamsUsers: true
      }
    })

    const newEvent = await this.prismaService.events.create({
      data: {
        ...event,
        name: `${event.name} - duplicado`
      }
    })

    const newTeams = []

    teams.map((team) => {
      delete team.id
      delete team.event_id
      delete team.created
      delete team.modified

      team.event_id = newEvent.id

      team.name = `${team.name} - duplicado`

      newTeams.push(team)

      team.teamsUsers.map((tu) => {
        delete tu.id
        delete tu.teams_id

        tu.teams_users_status_id = 1
        tu.confirmed = 'a'
        tu.justification = null
        tu.identification = null
        tu.minutes_worked = null
        tu.worked_amount = null
        tu.total_amount = null
      })
    })

    newTeams.map(async (team) => {
      await this.prismaService.teams.create({
        data: {
          ...team,
          teamsUsers: {
            create: team.teamsUsers
          }
        }
      })
    })

    return await this.getEvent(newEvent.id)
  }

  async duplicateTeam(teamId: number) {
    const team = await this.prismaService.teams.findFirst({
      where: {
        id: teamId
      },
      include: {
        teamsUsers: true
      }
    })

    const teamsUsers = team.teamsUsers.map((tu) => {
      delete tu.id
      delete tu.teams_id

      tu.teams_users_status_id = 1
      tu.confirmed = 'a'
      tu.justification = null
      tu.identification = null
      tu.minutes_worked = null
      tu.worked_amount = null
      tu.total_amount = null

      return tu
    })

    delete team.teamsUsers
    delete team.id

    const save = await this.prismaService.teams.create({
      data: {
        ...team,
        name: `${team.name} - duplicado`,
        teamsUsers: {
          create: teamsUsers
        }
      }
    })

    return save
  }

  async deleteTeam(teamId: number) {
    return await this.prismaService.teams.delete({
      where: {
        id: teamId
      }
    })
  }

  async getTeam(teamId: number) {
    const geatTeam = await this.prismaService.teams.findFirst({
      where: {
        id: teamId
      },
      include: {
        teamStatus: true,
        teamsUsers: { include: { user: true, function: true } }
      }
    })

    if (geatTeam.teamsUsers.length) {
      await Promise.all(
        geatTeam.teamsUsers?.map(async (teamUser) => {
          if (!teamUser.user_id) return

          const avatar = await this.prismaService.files.findFirst({
            where: {
              entity_id: teamUser.user.id,
              entity: 'user_avatar'
            },
            select: {
              url: true
            }
          })

          teamUser.user['avatar'] = avatar ? avatar.url : null
          delete teamUser.user.password
        })
      )
    }

    const [team] = this.teamCost([geatTeam])

    return team
  }

  async create(createEventDto: CreateEventDto) {
    let save = await this.prismaService.events.create({
      data: {
        name: createEventDto.name,
        date_start: moment(createEventDto.date_start).toDate(),
        date_end: moment(createEventDto.date_end).toDate(),
        status: StatusType[createEventDto.status],
        place_id: createEventDto.place_id,
        advertiser_id: createEventDto.advertiser_id
      }
    })

    save = await this.eventCost(save)

    return save
  }

  async createTeam(eventId: number, body: CreateEventTeamDto & { functions_id: number }) {
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
        extra_amount: body.extra_amount
      }
    })

    const teamId = saveTeam.id

    const teamsUsersToCreate = []

    Array.from({ length: body.quantity }).map(() => {
      //TODO: CALC USER COST FOR SAVING IN INSERT
      const newTeamUser: CreateEventTeamUserDto = {
        teams_id: teamId,
        function_id: body.functions_id,
        date_start: moment(body.date_start).toDate(),
        date_end: moment(body.date_end).toDate(),
        confirmed: 'a',
        user_id: null,
        teams_users_status_id: 1,
        tax_type: body.tax_type,
        tax: body.tax
      }

      teamsUsersToCreate.push(newTeamUser)
    })

    await this.prismaService.teamsUsers.createMany({
      data: teamsUsersToCreate
    })

    const teamToReturn = await this.prismaService.teams.findFirst({
      where: {
        id: teamId
      },
      include: {
        teamStatus: true,
        teamsUsers: {
          include: {
            function: true
          }
        }
      }
    })

    const [team] = this.teamCost([teamToReturn])

    return team
  }

  eventCost(event: any) {
    if (!event.teams) {
      event.total_preview = 0
      event.total_executed = 0
      event.total_by_answers = 0

      return event
    }

    event.teams = this.teamCost(event.teams)

    const total_preview = event.teams.reduce((a, b: any) => a + b.total_preview, 0)
    const total = event.teams.reduce((a, b: any) => a + b.total_executed, 0)
    const totalByAnswers = event.teams.reduce((a, b: any) => a + b.total_by_answers, 0)

    event.total_preview = total_preview
    event.total_executed = total
    event.total_by_answers = totalByAnswers

    return event
  }

  teamUserCost(teamUser: any) {
    let teamMemberCostPreview = 0
    let teamMemberCostPreviewByAnswer = 0
    let teamMemberCostExecuted = 0

    const starWork = moment(teamUser.date_start)
    const endWork = moment(teamUser.date_end)

    const workedMinutes = endWork.diff(starWork, 'minutes')

    teamUser.minutes_worked = workedMinutes

    if (teamUser.tax_type == 'period') {
      teamMemberCostPreview = teamUser.tax
    }

    if (teamUser.tax_type == 'hour') {
      const taxByMinute = teamUser.tax / 60

      teamMemberCostPreview = workedMinutes * taxByMinute
    }

    if (teamUser.confirmed == 'c' && teamUser.user_id != null) {
      teamMemberCostPreviewByAnswer = teamMemberCostPreview

      if (teamUser.teams_users_status_id == 2) {
        teamMemberCostExecuted = teamMemberCostPreview
      }
    }

    teamUser.worked_amount = teamMemberCostPreview
    teamUser.total_amount = teamMemberCostPreview + teamUser.extra_amount

    return {
      teamUser,
      teamMemberCostPreview,
      teamMemberCostPreviewByAnswer,
      teamMemberCostExecuted
    }
  }

  teamCost(teams: any[]) {
    teams.map((team: any) => {
      team.total_preview = 0
      team.total_by_answers = 0
      team.total_executed = 0

      team.teamsUsers.map((tu) => {
        tu = this.teamUserCost(tu)

        team.total_preview += tu.teamMemberCostPreview
        team.total_by_answers += tu.teamMemberCostPreviewByAnswer
        team.total_executed += tu.teamMemberCostExecuted

        return tu
      })

      return team
    })

    return teams
  }

  async getAvailableUsers(eventId: number, teamId: number): Promise<any[]> {
    const teamsUsers = await this.prismaService.teamsUsers.findMany({
      select: {
        user_id: true
      },
      where: {
        teams_id: teamId,
        AND: {
          NOT: {
            user_id: null
          }
        }
      }
    })

    const availableUsers = await this.prismaService.users.findMany({
      where: {
        type: 'pf',
        NOT: {
          id: {
            in: teamsUsers.map((tu) => tu.user_id)
          }
        }
      }
    })

    if (availableUsers.length) {
      await Promise.all(
        availableUsers.map(async (user) => {
          const avatar = await this.prismaService.files.findFirst({
            where: {
              entity_id: user.id,
              entity: 'user_avatar'
            },
            select: {
              url: true
            }
          })

          user['avatar'] = avatar ? avatar.url : null

          delete user.password
        })
      )
    }

    return availableUsers
  }

  async confirmUserInTeam(teamUserId: number) {
    return await this.prismaService.teamsUsers.update({
      where: {
        id: teamUserId
      },
      data: {
        confirmed: 'c'
      }
    })
  }

  async addUserToTeam(teamUserId: number, userId: number) {
    await this.prismaService.teamsUsers.update({
      where: {
        id: teamUserId
      },
      data: {
        user_id: userId
      }
    })

    return true
  }

  async removeUserFromTeam(teamUserId: number) {
    return await this.prismaService.teamsUsers.update({
      where: {
        id: teamUserId
      },
      data: {
        confirmed: 'a',
        user_id: null
      }
    })
  }

  async deleteEvent(eventId: number) {
    return await this.prismaService.events.delete({
      where: {
        id: eventId
      }
    })
  }
}
