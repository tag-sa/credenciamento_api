import Joi from 'joi';

export class CreateFunctionDto {
  id: number;
  name: string;

  static createSchema = Joi.object({
    name: Joi.string().required(),
  });
}
