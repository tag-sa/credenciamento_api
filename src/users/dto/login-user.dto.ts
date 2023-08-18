import Joi from 'joi';

export class LoginUserDto {
  static validationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  email: string;
  password: string;
}
