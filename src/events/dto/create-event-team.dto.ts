import { TaxTypes } from '@prisma/client'
import Joi from 'joi'
export class CreateEventTeamDto {
  event_id: number
  sector_id?: number
  team_status_id: number
  name: string
  status: string
  quantity: number
  date_start: Date
  date_end: Date
  created?: Date
  modified?: Date
  extra_amount?: number
  tax_type: string
  tax: number

  static createSchema = Joi.object({
    sector_id: Joi.number().optional().allow(null),
    functions_id: Joi.number().required(),
    team_status_id: Joi.number().optional().allow(null),
    name: Joi.string().required(),
    status: Joi.string().required().valid('a', 'i'),
    quantity: Joi.number().required(),
    date_start: Joi.date().required(),
    date_end: Joi.date().required(),
    extra_amount: Joi.number().optional().allow(null),
    tax_type: Joi.string()
      .valid(...Object.values(TaxTypes))
      .required(),
    tax: Joi.number().required().greater(0)
  })
}
