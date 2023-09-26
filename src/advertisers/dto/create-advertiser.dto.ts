import Joi from 'joi';

export class CreateAdvertiserDto {
  name: string;
  url: string;
  about: string;

  static createCatSchema = Joi.object({
    name: Joi.string().required(),
    url: Joi.string().allow(''),
    about: Joi.string().allow(''),
  });
}
