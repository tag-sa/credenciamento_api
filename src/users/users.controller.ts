import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { UniqueEmailPipe } from 'src/pipes/UniqueEmailPipe';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

import { UniqueCpfCnpjPipe } from 'src/pipes/UniqueCpfCnpjPipe';
import { Address } from './entities/address.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();

    return { data: users };
  }

  @Post()
  @UsePipes(new JoiValidationPipe(UserDto.createCatSchema))
  async create(
    @Body(UniqueEmailPipe) UserDto: UserDto & { address?: Address },
  ) {
    return {
      data: await this.usersService.create(UserDto),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body(UniqueEmailPipe, UniqueCpfCnpjPipe)
    userDto: UserDto,
  ) {
    return { data: await this.usersService.update(+id, userDto) };
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(LoginUserDto.validationSchema))
  @HttpCode(200)
  async login(@Body() signInDto: LoginUserDto, @Req() req: Request) {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await bcrypt.compare(signInDto.password, user.password))) {
      throw new UnauthorizedException();
    }

    delete user.password;

    const payload = { sub: user.id, user };
    const token = await this.jwtService.signAsync(payload);

    await this.usersService.saveUserSession(user.id, token, req.ip);

    const ret = {
      data: {
        user,
        access_token: token,
      },
    };

    return ret;
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Req() req: Request & { user: User }) {
    return { data: req.user };
  }

  @UseGuards(AuthGuard)
  @Get(':userId/worker-profile')
  async getWorkerProfile(@Param('userId') userId: string) {
    return { data: await this.usersService.getWorkerProfile(+userId) };
  }
}
