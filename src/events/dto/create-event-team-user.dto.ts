export class CreateEventTeamUserDto {
  teams_id: number
  function_id: number
  date_start: Date
  date_end: Date
  confirmed: string
  justification?: string
  identification?: string
  minutes_worked?: number
  user_id: number
  extra_amount?: number
  total_amount?: number
  worked_amount?: number
  created?: Date
  modified?: Date
  teams_users_status_id: number
  tax_type: string
  tax: number
}
