import Joi from 'joi'

export class AdvertiserInviteDto {
  email: string

  static validationSchema = Joi.object({
    email: Joi.string().required()
  })
}
