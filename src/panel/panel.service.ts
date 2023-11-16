import { Injectable } from '@nestjs/common'
import { EventsService } from 'src/events/events.service'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class PanelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsService: EventsService
  ) {}

  async getPanelData(id: number) {
    const advertisers = await this.prismaService.usersAdvertises.findMany({
      where: {
        user_id: id
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
}
