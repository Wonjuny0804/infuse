export interface EmailSummary {
  id: string;
  user_id: string;
  summary: string;
  audio_url: string;
  created_at: string;
  action_state: boolean;
}

export interface EmailSummaryResponse {
  summaries: EmailSummary[];
  hasMore: boolean;
}
