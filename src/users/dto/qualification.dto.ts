// {"certificate_type_id": 4, "conclusion_date": "2022-12-12", "file_url": "https://credenciamento-app.s3.sa-east-1.amazonaws.com/91ab7338-8334-4667-a034-315064860c99-2e89ca00-82d9-4d56-a5d3-ebd053898cda.pdf", "name": "nomelo", "place": "Local", "valid_until": null}

import Joi from 'joi'

export class QualificationDto {
  name: string
  place: string
  conclusion_date: Date
  certificate_type_id: number
  valid_until: Date
  file_url: string

  static validationSchema = Joi.object({
    name: Joi.string().required(),
    place: Joi.string().required(),
    conclusion_date: Joi.date().required(),
    certificate_type_id: Joi.number().required(),
    valid_until: Joi.date().allow(null).allow(''),
    file_url: Joi.string().allow(null).allow('')
  })
}
