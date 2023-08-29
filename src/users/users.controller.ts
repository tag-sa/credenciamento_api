import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  UsePipes,
  HttpCode,
  Put,
  Param,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { User } from './entities/user.entity';
import { UniqueEmailPipe } from 'src/pipes/UniqueEmailPipe';
import { UniqueCpfPipe } from 'src/pipes/UniqueCpfPipe';
import { Address } from './entities/address.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UsePipes(new JoiValidationPipe(UserDto.createCatSchema))
  create(@Body(UniqueEmailPipe) UserDto: UserDto & { address?: Address }) {
    return this.usersService.create(UserDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body(UniqueEmailPipe, UniqueCpfPipe) userDto: UserDto,
  ) {
    return this.usersService.update(+id, userDto);
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(LoginUserDto.validationSchema))
  @HttpCode(200)
  async login(@Body() signInDto: LoginUserDto, @Req() req: Request) {
    console.log(signInDto);
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
      status: true,
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
    return req.user;
  }
}
