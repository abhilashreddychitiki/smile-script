/**
 * Represents a transcript summary from the API
 */
export interface Summary {
  /** Unique identifier for the summary */
  id: number;

  /** Original transcript text */
  transcript: string;

  /** Generated summary of the transcript */
  summary: string;

  /** When the summary was first created (ISO date string) */
  created_at: string;

  /** When the summary was last updated (ISO date string) */
  updated_at: string;
}
