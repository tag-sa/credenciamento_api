import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import moment from 'moment'
import { PrismaService } from 'src/prisma.service'
import { jwtConstants } from './constants'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
        ignoreExpiration: true
      })

      if (!payload.user) {
        throw new UnauthorizedException()
      }

      const { user } = payload

      const checkActiveUser = await this.prismaService.users.findUnique({
        where: {
          id: user.id,
          status: 'a'
        }
      })

      if (!checkActiveUser) {
        throw new UnauthorizedException()
      }

      const checkActiveToken = await this.prismaService.usersSessions.findFirst({
        where: { user_id: user.id, token }
      })

      if (!checkActiveToken) {
        throw new UnauthorizedException()
      }

      await this.prismaService.usersSessions.update({
        where: { id: checkActiveToken.id },
        data: { last_access: moment().toDate() }
      })

      request['user'] = user
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []

    return type === 'Bearer' ? token : undefined
  }
}
