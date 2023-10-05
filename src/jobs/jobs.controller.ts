import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsDTO } from './dto/jobs.dto'
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}
    // @UseGuards(AuthGuard)
    @Get(':id')
    async getJobById(@Param('id') jobsId: string) {
        const jobsData = await this.jobsService.findJobById(+jobsId);
        console.log(jobsData)
        return { data: jobsData };
    }

    @Get()
    async getAllJobs(){
        return{data: await this.jobsService.findAll()}
    }
    
}
