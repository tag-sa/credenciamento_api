import Joi from 'joi';
export class CreateEventDto {
  name: string;
  date_start: Date;
  date_end: Date;
  status: string;
  place_id: number;
  advertiser_id: number;

  static createSchema = Joi.object({
    name: Joi.string().required(),
    date_start: Joi.date().required(),
    date_end: Joi.date().required(),
    status: Joi.string().required().valid('a', 'i'),
    place_id: Joi.number().required(),
    advertiser_id: Joi.number().required(),
  });
}
