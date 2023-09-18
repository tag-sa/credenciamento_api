import Joi from 'joi';

export class CreatePlaceDto {
  static createSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().required(),
    neighborhood: Joi.string().required(),
    number: Joi.string().required(),
  });
}
