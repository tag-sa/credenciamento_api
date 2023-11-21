import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { JobsDTO } from './dto/jobs.dto' // Importe o seu DTO aqui
import { EventsService } from 'src/events/events.service'

@Injectable()
export class JobsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findJobById(jobsId: number): Promise<JobsDTO> {
    const jobs = await this.prismaService.teams.findUnique({
      where: {
        id: jobsId
      }
    })

    if (!jobs) {
      throw new NotFoundException('Nenhuma vaga encontrada')
    }

    return new JobsDTO(jobs.id, jobs.event_id, jobs.date_start, jobs.date_end, jobs.status, jobs.created, jobs.modified, jobs.team_status_id)
  }

  async findAll(userId?: number) {
    let where = 'where tu.user_id is null and tu.date_end >= now()'

    const userSettings = await this.prismaService.usersSettings.findFirst({
      where: {
        user_id: userId
      }
    })

    if (userSettings.jobs_types == 'by_function') {
      const userFunctions = await this.prismaService.usersFunctions.findMany({
        where: {
          user_id: userId
        }
      })

      where += ' and tu.function_id in (' + userFunctions.map((item) => item.function_id).join(',') + ')'
    }

    const sql = `
      SELECT 
          (select count(*) from teams_users tu2 where tu2.teams_id = tu.teams_id and tu2.function_id = tu.function_id  and tu2.user_id is null) as quantity_available,
          (select count(*) from teams_users tu2 where tu2.teams_id = tu.teams_id and tu2.function_id = tu.function_id  and tu2.user_id is not null) as occupied,
          tu.id, tu.user_id, tu.teams_id, tu.function_id, tu.date_start, tu.date_end, tu.confirmed, tu.created, tu.modified, tu.teams_users_status_id,
          t.event_id, t.name as team_name, t.date_start as team_date_start, t.date_end as team_date_end, t.quantity as team_quantity, e.name as event_name, f.name as function_name, 
          ad.name as advertiser_name
      from teams_users tu 
      join teams t on t.id = tu.teams_id 
      join events e on e.id = t.event_id 
      join functions f on f.id = tu.function_id
      join advertisers ad on ad.id = e.advertiser_id
      ${where}
      group by tu.teams_id, tu.function_id
      order by tu.date_start;
    `

    let data: any[] = await this.prismaService.$queryRawUnsafe(sql.toString())

    if (data.length > 0) {
      data.map((item) => {
        item.quantity_available = parseInt(item.quantity_available)
        item.occupied = parseInt(item.occupied)

        return item
      })

      data = data.filter((item) => {
        return item.quantity_available > 0
      })
    }

    return data
  }

  async jobDetails(teamsUserId: number, userId: number) {
    const teamUser = await this.prismaService.teamsUsers.findUnique({
      where: {
        id: teamsUserId
      },
      include: {
        team: {
          include: {
            event: {
              include: {
                place: true,
                advertiser: true
              }
            }
          }
        },
        function: true
      }
    })

    const checkJobIsUserFavorite = await this.prismaService.usersFavorites.findFirst({
      where: {
        user_id: userId,
        entity: 'teams_users',
        entity_id: teamsUserId
      }
    })

    const advertiser: any = teamUser.team.event.advertiser
    const checkAdvertiserFavorite = await this.prismaService.usersFavorites.findFirst({
      where: {
        user_id: userId,
        entity: 'advertiser',
        entity_id: advertiser.id
      }
    })

    advertiser.favorite = checkAdvertiserFavorite ? true : false

    const sql = `
      SELECT 
          (select count(*) from teams_users tu2 where tu2.teams_id = tu.teams_id and tu2.function_id = tu.function_id  and tu2.user_id is null) as quantity_available,
          (select count(*) from teams_users tu2 where tu2.teams_id = tu.teams_id and tu2.function_id = tu.function_id  and tu2.user_id is not null) as occupied,
          tu.id, tu.user_id, tu.teams_id, tu.function_id, tu.date_start, tu.date_end, tu.confirmed, tu.created, tu.modified, tu.teams_users_status_id,
          t.event_id, t.name as team_name, t.date_start as team_date_start, t.date_end as team_date_end, t.quantity as team_quantity, e.name as event_name, f.name as function_name
      from teams_users tu 
      join functions f on f.id - tu.function_id
      join teams t on t.id = tu.teams_id 
      join events e on e.id = t.event_id 
      where tu.user_id is null and tu.date_end >= now() and e.advertiser_id = ${advertiser.id}
      group by tu.teams_id, tu.function_id
      order by tu.date_start;
    `

    let data: any[] = await this.prismaService.$queryRawUnsafe(sql.toString())

    if (data.length > 0) {
      await Promise.all(
        data.map(async (item) => {
          item.quantity_available = parseInt(item.quantity_available)
          item.occupied = parseInt(item.occupied)
          const checkTeamsUsersFavorite = await this.prismaService.usersFavorites.findFirst({
            where: {
              user_id: userId,
              entity: 'teams_users',
              entity_id: item.id
            }
          })

          item.favorite = checkTeamsUsersFavorite ? true : false

          return item
        })
      )

      data = data.filter((item) => {
        return item.quantity_available > 0
      })
    }

    advertiser.available_teams_users = data

    return {
      job: {
        favorite: checkJobIsUserFavorite ? true : false,
        date_start: teamUser.date_start,
        date_end: teamUser.date_end,
        function: teamUser.function.name,
        tax: teamUser.tax,
        tax_type: teamUser.tax_type,
        worked_minutes: teamUser.minutes_worked,
        extra_amount: teamUser.extra_amount,
        worked_amount: teamUser.worked_amount,
        total_amount: teamUser.total_amount,
        place: {
          name: teamUser.team.event.place.name,
          address: teamUser.team.event.place.address,
          number: teamUser.team.event.place.number,
          neighborhood: teamUser.team.event.place.neighborhood,
          city: teamUser.team.event.place.city,
          state: teamUser.team.event.place.state,
          zip: teamUser.team.event.place.zip
        },
        event: teamUser.team.event.name,
        advertiser: teamUser.team.event.advertiser.name
      },
      advertiser
    }
  }
}
