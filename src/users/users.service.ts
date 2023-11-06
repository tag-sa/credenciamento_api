import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import moment from 'moment'
import { jwtConstants } from 'src/auth/constants'
import { PrismaService } from 'src/prisma.service'
import { QualificationDto } from './dto/qualification.dto'
import { UserDto } from './dto/user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: UserDto & { address?: any }) {
    const passwordHash = await bcrypt.hash(createUserDto.password, jwtConstants.saltOrRounds)

    const save = await this.prismaService.users.create({
      data: {
        name: createUserDto.name,
        nickname: createUserDto.nickname ? createUserDto.nickname : createUserDto.name.split(' ')[0],
        email: createUserDto.email.toLowerCase(),
        password: passwordHash,
        birthdate: moment(createUserDto.birthdate).toDate(),
        cpf: createUserDto.document.length === 11 ? createUserDto.document : null,
        cnpj: createUserDto.document.length === 14 ? createUserDto.document : null,
        type: createUserDto.document.length === 11 ? 'pf' : 'pj',
        gender: createUserDto.gender,
        rg: createUserDto?.rg,
        rg_emitted_by: createUserDto?.rg_emitted_by,
        root: false,
        status: 'a'
      }
    })

    if (createUserDto.address) {
      await this.prismaService.address.create({
        data: {
          entity: 'users',
          entity_id: save.id,
          zip: createUserDto.address.zip,
          address: createUserDto.address.address,
          neighborhood: createUserDto.address.neighborhood,
          city: createUserDto.address.city,
          state: createUserDto.address.state,
          number: createUserDto.address.number,
          complement: createUserDto.address.complement,
          type: createUserDto.address.type
        }
      })
    }

    await this.prismaService.usersSettings.create({
      data: {
        user_id: save.id
      }
    })

    return save
  }

  async update(id: number, updateUserDto: UserDto) {
    const user = await this.prismaService.users.findUnique({
      where: {
        id
      }
    })

    const toUpdate = {
      ...user,
      name: updateUserDto?.name,
      nickname: updateUserDto?.nickname ? updateUserDto?.nickname : updateUserDto?.name?.split(' ')[0],
      email: updateUserDto?.email?.toLowerCase(),
      birthdate: updateUserDto?.birthdate,
      gender: updateUserDto?.gender,
      rg: updateUserDto?.rg,
      rg_emitted_by: updateUserDto?.rg_emitted_by,
      about: updateUserDto?.about
    }

    if (user.type == 'pf') {
      toUpdate['cpf'] = updateUserDto?.document
    }

    if (user.type == 'pj') {
      toUpdate['cnpj'] = updateUserDto?.document
    }

    if (updateUserDto.password && updateUserDto.password !== '') {
      const passwordHash = await bcrypt.hash(updateUserDto.password, jwtConstants.saltOrRounds)

      toUpdate['password'] = passwordHash
    }

    if (updateUserDto.avatar) {
      await this.prismaService.files.deleteMany({
        where: {
          entity: 'user_avatar',
          entity_id: id
        }
      })

      await this.prismaService.files.create({
        data: {
          entity: 'user_avatar',
          entity_id: id,
          url: updateUserDto.avatar
        }
      })
    }

    return await this.prismaService.users.update({
      where: {
        id
      },
      data: toUpdate
    })
  }

  async findAll() {
    return await this.prismaService.users.findMany()
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prismaService.users.findUnique({
      where: {
        email
      }
    })
  }

  async saveUserSession(userId: number, token: string, ip: string): Promise<boolean> {
    const save = await this.prismaService.usersSessions.create({
      data: {
        ip,
        token,
        user_id: userId,
        last_access: moment().toDate()
      }
    })

    return save ? true : false
  }

  async getWorkerProfile(id: number) {
    const user = await this.prismaService.users.findUnique({
      where: {
        id
      },
      include: {
        addresses: true,
        UsersFunctions: {
          include: {
            function: true
          }
        }
      }
    })

    const courses = await this.prismaService.usersCourses.findMany({
      where: {
        user_id: id,
        user_course_status_id: 2
      },
      include: {
        course: true
      }
    })

    user['courses'] = courses

    const avatar = await this.prismaService.files.findFirst({
      where: {
        entity_id: user.id,
        entity: 'user_avatar'
      },
      select: {
        url: true
      }
    })

    user['avatar'] = avatar ? avatar.url : null

    user.type = user.type === 'pf' ? (user['document'] = user.cpf) : (user['document'] = user.cnpj)

    delete user.password
    delete user.cpf
    delete user.cnpj

    const worked_events = await this.prismaService.teamsUsers.findMany({
      where: {
        user_id: id
      },
      include: {
        function: true,
        team: {
          include: {
            event: true
          }
        }
      }
    })

    user['worked_events'] = worked_events.map((item) => {
      return {
        name: item.team.event.name,
        date_start: item.team.event.date_start,
        date_end: item.team.event.date_end,
        function_name: item.function.name
      }
    })

    return user
  }

  async updateSettings(userId: any, field: string, value: any) {
    const checkSetting = await this.prismaService.usersSettings.findFirst({
      where: {
        user_id: userId
      }
    })

    if (checkSetting) {
      return await this.prismaService.usersSettings.update({
        where: {
          id: checkSetting.id
        },
        data: {
          [field]: value
        }
      })
    } else {
      return await this.prismaService.usersSettings.create({
        data: {
          user_id: userId,
          [field]: value
        }
      })
    }
  }

  async getUserSettings(userId: number) {
    const settings = await this.prismaService.usersSettings.findFirst({
      where: {
        user_id: userId
      }
    })

    delete settings.id
    delete settings.user_id
    delete settings.modified

    const jobsNotifications = await this.prismaService.notificationsTypesUsers.findMany({
      where: {
        user_id: userId,
        notifications_types_id: 1
      },
      select: {
        type: true
      }
    })

    const usersFunctions = await this.prismaService.usersFunctions.findMany({
      where: {
        user_id: userId
      },
      select: {
        function_id: true
      }
    })

    return { settings, jobs_notifications: jobsNotifications, functions: usersFunctions }
  }

  async updateFunctions(userId: number, functions_ids: number[]) {
    const check = await this.prismaService.usersFunctions.findMany({
      where: {
        user_id: userId
      }
    })

    if (check.length > 0) {
      await this.prismaService.usersFunctions.deleteMany({
        where: {
          user_id: userId
        }
      })
    }

    const save = await this.prismaService.usersFunctions.createMany({
      data: functions_ids.map((item) => {
        return {
          user_id: userId,
          function_id: item
        }
      })
    })

    return save
  }

  async deleteUserAccount(userId: number) {
    return await this.prismaService.users.delete({
      where: {
        id: userId
      }
    })
  }

  async me(id: number) {
    const user = await this.prismaService.users.findUnique({
      where: {
        id
      },
      include: {
        addresses: true,
        UsersFunctions: {
          include: {
            function: true
          }
        }
      }
    })

    user['document'] = user.type === 'pf' ? user.cpf : user.cnpj

    delete user.password
    delete user.cpf
    delete user.cnpj

    const usersCoursesStatus = await this.prismaService.usersCoursesStatus.findMany({})

    usersCoursesStatus.map(async (item) => {
      item['courses'] = []

      const courses = await this.prismaService.usersCourses.findMany({
        where: {
          user_id: id,
          user_course_status_id: item.id
        }
      })

      if (courses.length > 0) {
        item['courses'] = courses
      }
    })

    user['courses'] = usersCoursesStatus

    const worked_events = await this.prismaService.teamsUsers.findMany({
      where: {
        user_id: id
      },
      include: {
        function: true,
        team: {
          include: {
            event: true
          }
        }
      }
    })

    user['worked_events'] = worked_events.map((item) => {
      return {
        name: item.team.event.name,
        date_start: item.team.event.date_start,
        date_end: item.team.event.date_end,
        function_name: item.function.name
      }
    })

    const relatedAdvertisers = await this.prismaService.usersAdvertises.findMany({
      where: {
        user_id: id
      },
      include: {
        advertiser: true
      }
    })

    user['related_advertisers'] = relatedAdvertisers.map((item) => {
      return {
        id: item.advertiser.id,
        name: item.advertiser.name
      }
    })

    return user
  }

  async addQualification(userId: number, qualification: QualificationDto) {
    const save = await this.prismaService.usersCourses.create({
      data: {
        user_id: userId,
        conclusion_date: qualification.conclusion_date ? moment(qualification.conclusion_date).toDate() : null,
        course_type_id: qualification.certificate_type_id,
        name: qualification.name,
        valid_until: qualification.valid_until ? moment(qualification.valid_until).toDate() : null,
        certified: qualification.file_url ? true : false,
        certified_url: qualification.file_url,
        place: qualification.place,
        user_course_status_id: 1
      }
    })

    return save
  }

  async deleteQualification(courseId: number) {
    await this.prismaService.usersCourses.delete({
      where: {
        id: courseId
      }
    })
  }

  async getUserAvatar(userId: number): Promise<string> {
    const avatar = await this.prismaService.files.findFirst({
      where: {
        entity: 'user_avatar',
        entity_id: userId
      }
    })

    return avatar ? avatar.url : null
  }
}
