export class JobsDTO {
    constructor(
        public id: number,
        public event_id: number,
        public start_date: Date,
        public end_date: Date,
        public description: string,
        public created_at: Date,
        public updated_at: Date,
        public team_status_id: number
    ) {}
}
