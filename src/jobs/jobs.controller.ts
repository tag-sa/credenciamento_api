import { Controller, Get, Param } from '@nestjs/common'
import { JobsService } from './jobs.service'

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  // @UseGuards(AuthGuard)
  @Get(':id')
  async getJobById(@Param('id') jobsId: string) {
    const jobsData = await this.jobsService.findJobById(+jobsId)
    return { data: jobsData }
  }

  @Get()
  async getAllJobs() {
    return { data: await this.jobsService.findAll() }
  }
}
