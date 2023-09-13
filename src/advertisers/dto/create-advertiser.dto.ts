import Joi from 'joi';
import { Advertiser } from '../entities/advertiser.entity';

export class CreateAdvertiserDto implements Advertiser {
  name: string;
  url: string;
  about: string;

  static createCatSchema = Joi.object({
    name: Joi.string().required(),
    url: Joi.string().allow(''),
    about: Joi.string().allow(''),
  });
}
