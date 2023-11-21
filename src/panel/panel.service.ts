import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { EventsService } from 'src/events/events.service'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class PanelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsService: EventsService
  ) {}

  async getPanelData(userId: number) {
    const advertisers = await this.prismaService.usersAdvertises.findMany({
      where: {
        user_id: userId
      },
      include: {
        advertiser: {
          include: {
            Events: {
              include: {
                advertiser: true,
                teams: {
                  include: {
                    teamsUsers: {
                      include: {
                        TeamsUsersStatus: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const advertisersIds = advertisers.map((advertiser) => advertiser.advertiser.id)
    const usersThatHasAdvertisersAsFavorite = await this.prismaService.usersFavorites.findMany({
      where: {
        entity: 'advertiser',
        entity_id: {
          in: advertisersIds
        }
      }
    })

    const currentYearEvents = advertisers.map((advertiser) => {
      return advertiser.advertiser.Events.filter((event) => {
        return event.date_start.getFullYear() === new Date().getFullYear()
      })
    })

    const pastEvents = advertisers.map((advertiser) => {
      return advertiser.advertiser.Events.filter((event) => {
        return event.date_end < new Date()
      })
    })

    const futureEvents = advertisers.map((advertiser) => {
      return advertiser.advertiser.Events.filter((event) => {
        if (event.date_end > new Date()) {
          event = this.eventsService.eventCost(event)
          return event
        }
      })
    })

    const futureEventsCosts = futureEvents.flat().reduce((acc, event: any) => {
      return acc + event.total_preview
    }, 0)

    const totalUsersInEvents = advertisers.reduce((acc, advertiser) => {
      return (
        acc +
        advertiser.advertiser.Events.reduce((acc, event) => {
          return (
            acc +
            event.teams.reduce((acc, team) => {
              return acc + team.teamsUsers.filter((user) => user.user_id).length
            }, 0)
          )
        }, 0)
      )
    }, 0)

    return {
      usersThatHasAdvertisersAsFavorite: usersThatHasAdvertisersAsFavorite.length,
      pastEvents: pastEvents.flat().length,
      futureEventsCostsPreview: futureEventsCosts,
      totalUsersInEvents: totalUsersInEvents,
      totalEventsInCurrentYear: currentYearEvents.flat().length,
      futureEvents: futureEvents.flat()
    }
  }

  async getWorkerPanelData(userId: number) {
    const getPastSixMonthsSql = `
      WITH RECURSIVE DateSeries (date) AS (
          SELECT CURDATE() - INTERVAL 6 MONTH
          UNION ALL
          SELECT date + INTERVAL 1 MONTH FROM DateSeries WHERE date < CURDATE() - INTERVAL 1 MONTH
      )
      SELECT 
          ds.date AS date,
          tu.user_id,
          COALESCE(SUM(tu.total_amount), 0) AS total_earnings,
          u.name
      FROM 
          DateSeries ds
      LEFT JOIN 
          teams_users tu ON YEAR(tu.date_start) = YEAR(ds.date) AND MONTH(tu.date_start) = MONTH(ds.date) and tu.teams_users_status_id = 2 and tu.confirmed = 'c'
          join users u on u.id = tu.user_id and u.id = ${userId}
      WHERE 
          tu.date_start >= CURDATE() - INTERVAL 6 MONTH
      GROUP BY 
          YEAR(ds.date), MONTH(ds.date), tu.user_id
      ORDER BY 
          tu.user_id, date; 
    `
    const getPastSixMonths = await this.prismaService.$queryRaw(Prisma.raw(getPastSixMonthsSql))

    const nextSixMonthsPreviewSql = `
      WITH RECURSIVE DateSeries (date) AS (
          SELECT CURDATE() + INTERVAL 1 MONTH
          UNION ALL
          SELECT date + INTERVAL 1 MONTH FROM DateSeries WHERE date < CURDATE() + INTERVAL 6 MONTH
      )
      SELECT
          ds.date AS date,
          COALESCE(SUM(tu.total_amount), 0) AS total_earnings
      FROM 
          DateSeries ds
      LEFT JOIN 
          teams_users tu ON YEAR(tu.date_start) = YEAR(ds.date) AND MONTH(tu.date_start) = MONTH(ds.date) and tu.teams_users_status_id <> 3 and tu.confirmed <> 'd'
      JOIN 
          users u ON u.id = tu.user_id and u.id = ${userId}
      WHERE 
          tu.date_start < CURDATE() + INTERVAL 6 MONTH AND tu.date_start >= CURDATE()
      GROUP BY 
          YEAR(ds.date), MONTH(ds.date), tu.user_id
      ORDER BY 
          tu.user_id, date;
    `
    const nextSixMonthsPreview = await this.prismaService.$queryRaw(Prisma.raw(nextSixMonthsPreviewSql))

    const earningsByFunctionsFromPastSixMonthsSql = `
      SELECT 
        f.id,
          f.name AS function_name,
          COALESCE(SUM(tu.total_amount), 0) AS total_earnings
      FROM 
          teams_users tu 
      LEFT JOIN 
          functions f ON tu.function_id = f.id
      WHERE 
          tu.date_start BETWEEN CURDATE() - INTERVAL 6 MONTH AND CURDATE()
          AND tu.user_id = ${userId}
          AND tu.teams_users_status_id = 2
          AND tu.confirmed = 'c'
      GROUP BY 
          tu.function_id
      ORDER BY 
      f.name;
    `
    const earningsByFunctions = await this.prismaService.$queryRaw(Prisma.raw(earningsByFunctionsFromPastSixMonthsSql))

    const userJobs = await this.prismaService.teamsUsers.findMany({
      where: {
        user_id: userId,
        teams_users_status_id: 2,
        confirmed: 'c'
      },
      include: {
        function: true,
        team: {
          include: {
            event: {
              include: {
                place: true,
                advertiser: true
              }
            }
          }
        }
      }
    })

    const uJ = userJobs.map((job) => {
      return {
        advertiser: job.team.event.advertiser.name,
        function: job.function.name,
        date_start: job.date_start,
        date_end: job.date_end,
        place: job.team.event.place.name,
        total_earnings: job.total_amount
      }
    })

    return {
      pastSixMonths: getPastSixMonths,
      nextSixMonthsPreview: nextSixMonthsPreview,
      earningsByFunctionsFromPastSixMonths: earningsByFunctions,
      userJobs: uJ
    }
  }
}
