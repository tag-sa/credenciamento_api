import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { EventsService } from './events.service'
import { TaxTypes, TeamsUsersStatusType } from '@prisma/client'
import moment from 'moment'

describe('EventsService', () => {
  let service: EventsService
  let prismaService: PrismaService

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService],
      imports: [PrismaModule]
    }).compile()

    service = module.get<EventsService>(EventsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return event cost zero without sending any team', async () => {
    const mockEventCost = {
      total_executed: 0,
      total_preview: 0,
      total_by_answers: 0
    }

    const event = await prismaService.events.findFirst({
      orderBy: {
        id: 'desc'
      }
    })

    const data = await service.eventCost(event)

    expect(data.total_preview).toEqual(mockEventCost.total_preview)
  })
  it('should return event cost', async () => {
    const mockEventCost = {
      total_executed: 0,
      total_preview: 500,
      total_by_answers: 0
    }

    const event = await prismaService.events.findFirst({
      orderBy: {
        id: 'desc'
      },
      include: {
        teams: {
          include: {
            teamsUsers: {
              include: {
                function: true
              }
            }
          }
        }
      }
    })

    const data = await service.eventCost(event)

    expect(data.total_preview).toEqual(mockEventCost.total_preview)
  })

  it('should return team cost', async () => {
    const randomTeam = await prismaService.teams.findFirst({
      include: {
        teamsUsers: {
          include: {
            function: true
          }
        }
      }
    })

    const team = await service.getTeam(randomTeam.id)

    expect(team.total_preview).toBeDefined()
    expect(team.total_by_answers).toBeDefined()
    expect(team.total).toBeDefined()
  })

  it('should create 200 events with teams and teams_users', async () => {
    const events = await prismaService.events.findMany()

    events.map(async (event) => {
      const randomNumber = Math.floor(Math.random() * 4) + 1

      const newStartDate = moment(event.date_start)
        .add(Math.floor(Math.random() * 12) - 6, 'months')
        .toDate()

      const newEndDate = moment(newStartDate).add(randomNumber, 'hour').toDate()

      event.date_start = newStartDate
      event.date_end = newEndDate

      const eventTeams = await prismaService.teams.findMany({
        where: {
          event_id: event.id
        }
      })

      eventTeams.map(async (team) => {
        team.date_start = newStartDate
        team.date_end = newEndDate

        const teamsUsers = await prismaService.teamsUsers.findMany({
          where: {
            teams_id: team.id
          }
        })

        teamsUsers.map(async (teamUser) => {
          teamUser.date_start = newStartDate
          teamUser.date_end = newEndDate

          await prismaService.teamsUsers.update({
            where: {
              id: teamUser.id
            },
            data: teamUser
          })
        })

        await prismaService.teams.update({
          where: {
            id: team.id
          },
          data: team
        })
      })
    })

    // async function getRandomItem() {
    //   // Count the total number of records in the table
    //   const count = await prismaService.users.count()

    //   // Generate a random index
    //   const randomIndex = Math.floor(Math.random() * count)

    //   // Retrieve the record at the random position
    //   const randomRecord = await prismaService.users.findMany({
    //     skip: randomIndex,
    //     take: 1
    //   })

    //   return randomRecord[0].id
    // }

    // for (let i = 0; i < 120; i++) {
    //   const event = await prismaService.events.create({
    //     data: {
    //       name: `Evento ${i}`,
    //       date_start: new Date(),
    //       date_end: new Date(),
    //       place_id: 1,
    //       advertiser_id: 1
    //     }
    //   })

    //   for (let j = 0; j < 15; j++) {
    //     const team = await prismaService.teams.create({
    //       data: {
    //         name: `Equipe ${j}`,
    //         date_start: new Date(),
    //         date_end: new Date(),
    //         status: 'a',
    //         event_id: event.id,
    //         team_status_id: 1,
    //         quantity: 30
    //       }
    //     })

    // for (let k = 0; k < 30; k++) {
    //   const userId = await getRandomItem()

    //   //check if user is already in team
    //   const check = await prismaService.teamsUsers.findFirst({
    //     where: {
    //       user_id: userId,
    //       teams_id: team.id
    //     }
    //   })

    // if (!check) {

    //   const teamsUsers = await prismaService.teamsUsers.create({
    //     data: {
    //       user_id: userId,
    //       teams_id: team.id,
    //       function_id: [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5)[0],
    //       confirmed: TeamsUsersStatusType[['a', 'c', 'd'].sort(() => Math.random() - 0.5)[0]],
    //       date_start: event.date_start,
    //       date_end: event.date_end,
    //       tax: 10,
    //       tax_type: TaxTypes[new Array('period', 'hour').sort(() => Math.random() - 0.5)[0]],
    //       teams_users_status_id: [1, 2, 3].sort(() => Math.random() - 0.5)[0]
    //     }
    //   })
    // }
    // }
    //   }
    // }
  })
})
