import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { JobsDTO } from './dto/jobs.dto' // Importe o seu DTO aqui

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
    let where = ''

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

      where = 'where tu.function_id in (' + userFunctions.map((item) => item.function_id).join(',') + ')'
    }

    const sql = `
      SELECT 
          count(*) as quantity,
          (select count(*) from teams_users tu2 where tu2.teams_id = tu.teams_id and tu2.function_id = tu.function_id  and tu2.user_id is not null) as occupied,
          tu.id, tu.user_id, tu.teams_id, tu.function_id, tu.date_start, tu.date_end, tu.confirmed, tu.created, tu.modified, tu.teams_users_status_id,
          t.event_id, t.name as team_name, t.date_start as team_date_start, t.date_end as team_date_end, t.quantity as team_quantity, e.name as event_name
      from teams_users tu 
      join teams t on t.id = tu.teams_id 
      join events e on e.id = t.event_id 
      ${where}
      group by tu.teams_id, tu.function_id
      order by tu.date_start;
    `
    const data: any[] = await this.prismaService.$queryRawUnsafe(sql.toString())

    if (data.length > 0) {
      data.map((item) => {
        item.quantity = parseInt(item.quantity)
        item.occupied = parseInt(item.occupied)

        return item
      })
    }

    return data
  }
}
