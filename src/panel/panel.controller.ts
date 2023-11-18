import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { PanelService } from './panel.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { User } from 'src/users/entities/user.entity'

@Controller('panel')
export class PanelController {
  constructor(private readonly panelService: PanelService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getPanelData(@Req() req: Request & { user: User }) {
    return await this.panelService.getPanelData(req.user.id)
  }

  @UseGuards(AuthGuard)
  @Get('worker')
  async getWorkerPanelData(@Req() req: Request & { user: User }) {
    return await this.panelService.getWorkerPanelData(req.user.id)
  }
}
