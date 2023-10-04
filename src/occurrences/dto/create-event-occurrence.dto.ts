import Joi from 'joi'

export class CreateEventOccurrenceDto {
  id?: number
  event_id: number
  user_id: number
  team_user_id: number
  occurrence_id: number
  observation?: string

  static createSchema = Joi.array().items(
    Joi.object({
      event_id: Joi.number().required(),
      user_id: Joi.number().required(),
      team_user_id: Joi.number().required(),
      occurrence_id: Joi.number().required(),
      observation: Joi.string().optional().allow(null).allow('')
    })
  )
}
