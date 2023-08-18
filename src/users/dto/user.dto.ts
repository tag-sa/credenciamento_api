import { GenderType } from '@prisma/client';
import { User } from '../entities/user.entity';
import Joi from 'joi';

export class UserDto implements User {
  static createCatSchema = Joi.object({
    name: Joi.string().required(),
    nickname: Joi.string(),
    email: Joi.string().email().required(),
    cpf: Joi.string().required(),
    password: Joi.string().required(),
    gender: Joi.string()
      .required()
      .valid(...Object.values(GenderType)),
    birthdate: Joi.date().required(),
    rg: Joi.string(),
    rg_emitted_by: Joi.string(),
  });

  id?: number;
  name: string;
  nickname: string;
  email: string;
  cpf: string;
  rg: string;
  rg_emitted_by: string;
  password: string;
  gender: GenderType;
  birthdate: Date;
  status?: string;
  root?: boolean;
  created?: Date;
  modified?: Date;
  recovery_code?: string;
  recovery_code_expires?: Date;
  change_password?: boolean;
  last_login?: Date;
  last_ip?: string;
  last_access?: Date;
}
