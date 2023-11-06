import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Req, UnauthorizedException, UseGuards, UsePipes } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import { Request } from 'express'
import { AuthGuard } from 'src/auth/auth.guard'
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe'
import { UniqueEmailPipe } from 'src/pipes/UniqueEmailPipe'
import { LoginUserDto } from './dto/login-user.dto'
import { UserDto } from './dto/user.dto'
import { User } from './entities/user.entity'

import { NotificationsService, NotificationsTypes } from 'src/notifications/notifications.service'
import { UniqueCpfCnpjPipe } from 'src/pipes/UniqueCpfCnpjPipe'
import { PrismaService } from 'src/prisma.service'
import { QualificationDto } from './dto/qualification.dto'
import { UserSettingsDto } from './dto/user-seetings.dto'
import { Address } from './entities/address.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly prismaService: PrismaService
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll()

    return { data: users }
  }

  @Post()
  @UsePipes(new JoiValidationPipe(UserDto.createCatSchema))
  async create(@Body(UniqueEmailPipe) UserDto: UserDto & { address?: Address }) {
    return {
      data: await this.usersService.create(UserDto)
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body(UniqueEmailPipe, UniqueCpfCnpjPipe)
    userDto: UserDto
  ) {
    return { data: await this.usersService.update(+id, userDto) }
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(LoginUserDto.validationSchema))
  @HttpCode(200)
  async login(@Body() signInDto: LoginUserDto, @Req() req: Request) {
    const user = await this.usersService.findByEmail(signInDto.email)
    if (!user) {
      throw new UnauthorizedException()
    }

    if (!(await bcrypt.compare(signInDto.password, user.password))) {
      throw new UnauthorizedException()
    }

    delete user.password

    user['avatar'] = await this.usersService.getUserAvatar(user.id)

    const payload = { sub: user.id, user }
    const token = await this.jwtService.signAsync(payload)

    await this.usersService.saveUserSession(user.id, token, req.ip)

    const ret = {
      data: {
        user,
        access_token: token
      }
    }

    return ret
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request & { user: User }) {
    return { data: await this.usersService.me(+req.user.id) }
  }

  @UseGuards(AuthGuard)
  @Get(':userId/worker-profile')
  async getWorkerProfile(@Param('userId') userId: string) {
    return { data: await this.usersService.getWorkerProfile(+userId) }
  }

  @UseGuards(AuthGuard)
  @Get('settings')
  async getSettings(@Req() req: Request & { user: User }) {
    const settings = await this.usersService.getUserSettings(req.user.id)
    return { data: settings }
  }

  @Patch('settings')
  @UseGuards(AuthGuard)
  async updateSettings(@Req() req: Request & { user: User }, @Body(new JoiValidationPipe(UserSettingsDto.validationSchema)) body: { field: string; value: any }) {
    const userId = req.user.id
    const { field, value } = body

    await this.usersService.updateSettings(+userId, field, value)

    return {
      data: {
        [field]: value
      }
    }
  }

  @Post('settings/functions')
  @UseGuards(AuthGuard)
  async updateFunctions(@Req() req: Request & { user: User }, @Body(new JoiValidationPipe(UserSettingsDto.validationFunctionsSchema)) body: { functions_ids: number[] }) {
    const userId = req.user.id
    const { functions_ids } = body

    await this.usersService.updateFunctions(+userId, functions_ids)

    return 'ok'
  }

  @Post('settings/jobs-notifications')
  @UseGuards(AuthGuard)
  async updateJobsNotifications(
    @Req() req: Request & { user: User },
    @Body(new JoiValidationPipe(UserSettingsDto.validationJobsNotificationSchema)) body: { types: NotificationsTypes[] }
  ) {
    const userId = req.user.id
    const { types } = body

    await this.notificationsService.updateUserNotificationsTypes(+userId, 1, types)

    return 'ok'
  }

  @Delete('terminate-account')
  @UseGuards(AuthGuard)
  async deleteUserAccount(@Req() req: Request & { user: User }) {
    const userId = req.user.id

    await this.usersService.deleteUserAccount(+userId)

    return 'ok'
  }

  @Post('qualification')
  @UseGuards(AuthGuard)
  async addQualification(@Req() req: Request & { user: User }, @Body(new JoiValidationPipe(QualificationDto.validationSchema)) body: QualificationDto) {
    const userId = req.user.id

    await this.usersService.addQualification(+userId, body)

    return 'ok'
  }

  @Delete('qualification/:id')
  @UseGuards(AuthGuard)
  async deleteQualification(@Req() req: Request & { user: User }, @Param('id') courseId: string) {
    const userId = req.user.id

    const checkOwnership = await this.prismaService.usersCourses.findFirst({
      where: {
        id: +courseId,
        user_id: +userId
      }
    })

    if (!checkOwnership) {
      throw new UnauthorizedException('Curso não encontrado')
    }

    await this.usersService.deleteQualification(+courseId)

    return 'ok'
  }
}
