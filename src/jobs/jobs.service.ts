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

  async findAll() {
    const data = await this.prismaService.teamsUsers.findMany({
      select: {
        id: true,
        user_id: true,
        teams_id: true,
        function_id: true,
        date_start: true,
        date_end: true,
        confirmed: true,
        created: true,
        modified: true,
        teams_users_status_id: true,
        team: {
          select: {
            id: true,
            event_id: true,
            name: true,
            date_start: true,
            date_end: true,
            quantity: true,
            event: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (data.length) {
      await Promise.all(
        data.map(async (item: any) => {
          item.team.usedQuantity = await this.prismaService.teamsUsers.count({
            where: {
              teams_id: item.team.id,
              AND: {
                NOT: {
                  user_id: null
                }
              }
            }
          })
          return item
        })
      )
    }

    return data
  }
}
