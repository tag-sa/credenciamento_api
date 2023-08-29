/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User } from './entities/user.entity';
import moment from 'moment';
import * as bcrypt from 'bcryptjs';
import { jwtConstants } from 'src/auth/constants';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: UserDto & { address?: any }) {
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      jwtConstants.saltOrRounds,
    );

    const save = await this.prismaService.users.create({
      data: {
        name: createUserDto.name,
        nickname: createUserDto.nickname
          ? createUserDto.nickname
          : createUserDto.name.split(' ')[0],
        email: createUserDto.email.toLowerCase(),
        password: passwordHash,
        birthdate: moment(createUserDto.birthdate).toDate(),
        cpf:
          createUserDto.document.length === 11 ? createUserDto.document : null,
        cnpj:
          createUserDto.document.length === 14 ? createUserDto.document : null,
        type: createUserDto.document.length === 11 ? 'pf' : 'pj',
        gender: createUserDto.gender,
        rg: createUserDto?.rg,
        rg_emitted_by: createUserDto?.rg_emitted_by,
        root: false,
        status: 'a',
      },
    });

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
          type: createUserDto.address.type,
        },
      });
    }

    return save;
  }

  async update(id: number, updateUserDto: UserDto) {
    const user = await this.prismaService.users.findUnique({
      where: {
        id,
      },
    });

    const toUpdate = {
      ...user,
      name: updateUserDto?.name,
      nickname: updateUserDto?.nickname
        ? updateUserDto?.nickname
        : updateUserDto?.name?.split(' ')[0],
      email: updateUserDto?.email?.toLowerCase(),
      birthdate: updateUserDto?.birthdate,
      cpf: updateUserDto?.document,
      gender: updateUserDto?.gender,
      rg: updateUserDto?.rg,
      rg_emitted_by: updateUserDto?.rg_emitted_by,
    };

    if (updateUserDto.password && updateUserDto.password !== '') {
      const passwordHash = await bcrypt.hash(
        updateUserDto.password,
        jwtConstants.saltOrRounds,
      );

      toUpdate['password'] = passwordHash;
    }

    return await this.prismaService.users.update({
      where: {
        id,
      },
      data: toUpdate,
    });
  }

  async findAll() {
    return await this.prismaService.users.findMany();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prismaService.users.findUnique({
      where: {
        email,
      },
    });
  }

  async saveUserSession(
    userId: number,
    token: string,
    ip: string,
  ): Promise<boolean> {
    const save = await this.prismaService.usersSessions.create({
      data: {
        ip,
        token,
        user_id: userId,
        last_access: moment().toDate(),
      },
    });

    return save ? true : false;
  }
}
