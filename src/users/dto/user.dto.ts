import { GenderType } from '@prisma/client';
import { User } from '../entities/user.entity';
import Joi from 'joi';
import { Address } from '../entities/address.entity';

export class UserDto implements User {
  static createCatSchema = Joi.object({
    name: Joi.string().required(),
    nickname: Joi.string().allow(''),
    email: Joi.string().email().required(),
    document: Joi.string().required().min(11).max(14),
    password: Joi.string().required(),
    gender: Joi.string().valid(...Object.values(GenderType)),
    birthdate: Joi.date().required(),
    rg: Joi.string(),
    rg_emitted_by: Joi.string(),
    address: Joi.object({
      zip: Joi.string().required(),
      address: Joi.string().required(),
      neighborhood: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      number: Joi.string().required(),
      complement: Joi.string().allow(''),
      type: Joi.string().allow(''),
    }),
  });

  id?: number;
  name: string;
  nickname: string;
  email: string;
  document: string;
  rg?: string;
  rg_emitted_by?: string;
  password: string;
  gender?: GenderType;
  birthdate?: Date;
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
  type?: string;
  address?: Address[];
}
