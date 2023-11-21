import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { Request } from 'express'
import { AuthGuard } from 'src/auth/auth.guard'

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async getJobById(@Param('id') jobsId: string) {
    const jobsData = await this.jobsService.findJobById(+jobsId)
    return { data: jobsData }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllJobs(@Req() req: Request & { user: { id: number } }) {
    const userId = req.user.id

    return { data: await this.jobsService.findAll(userId) }
  }

  @UseGuards(AuthGuard)
  @Get(':id/details')
  async getJobDetails(@Param('id') jobId: string, @Req() req: Request & { user: { id: number } }) {
    const userId = req.user.id
    const job = await this.jobsService.jobDetails(+jobId, userId)

    return { data: job }
  }
}
