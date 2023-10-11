import Joi from 'joi'

export class UserSettingsDto {
  static validationSchema = Joi.object({
    field: Joi.valid(
      'enable_convocation',
      'jobs_types',
      'distance',
      'show_score',
      'show_jobs_worked',
      'convocations_needs_approval',
      'disabled_notifications',
      'disabled_jobs_notifications'
    ).required(),
    value: Joi.any()
      .when('field', {
        is: 'jobs_types',
        then: Joi.valid('general', 'by_function')
      })
      .when('field', {
        is: 'distance',
        then: Joi.number().min(1).max(100)
      })
      .when('field', {
        is: 'show_score',
        then: Joi.boolean().truthy('true').falsy('false')
      })
      .when('field', {
        is: 'show_jobs_worked',
        then: Joi.boolean().truthy('true').falsy('false')
      })
      .when('field', {
        is: 'convocations_needs_approval',
        then: Joi.boolean().truthy('true').falsy('false')
      })
      .when('field', {
        is: 'disabled_notifications',
        then: Joi.boolean().truthy('true').falsy('false')
      })
      .when('field', {
        is: 'disabled_jobs_notifications',
        then: Joi.boolean().truthy('true').falsy('false')
      })
      .when('field', {
        is: 'enable_convocation',
        then: Joi.boolean().truthy('true').falsy('false')
      })
      .required()
  })

  static validationFunctionsSchema = Joi.object({
    functions_ids: Joi.array().items(Joi.number().min(1).max(5)).required()
  })

  static validationJobsNotificationSchema = Joi.object({
    types: Joi.array()
      .items(Joi.string().valid('all', 'system', 'email', 'push', 'sms', 'whatsapp'))
      .required()
  })
}
