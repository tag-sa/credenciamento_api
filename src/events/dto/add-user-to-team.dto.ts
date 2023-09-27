import Joi from 'joi';
export class AddUserToTeamDto {
  static validationSchema = Joi.object({
    user_id: Joi.number().required(),
  });
}
