export type StepType =
  | "info"
  | "list"
  | "multi_line"
  | "actions_list"
  | "action_complete";

export interface Step {
  id: string;
  step_number: number;
  step_type: StepType;
  prompt: string;
  helper_text: string | null;
  body: string | null;
  field_key: string | null;
  config: Record<string, unknown>;
}

export interface Day {
  id: string;
  day_number: number;
  title: string;
  steps: Step[];
}

export interface Program {
  id: string;
  name: string;
  version: number;
  days: Day[];
}

export interface Progress {
  current_day_number: number;
  current_step_number: number;
  completed_days: number[];
  program_completed_at: string | null;
}

export interface Action {
  id: string;
  day_id: string;
  text: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface DayData {
  day: Day;
  steps: Step[];
  answers: Record<string, Record<string, unknown>>;
  actions: Action[];
}

export interface User {
  id: string;
  email: string;
}

export interface DayCompleteResult {
  ok: boolean;
  next_day_number: number | null;
  program_completed_at: string | null;
  missing: string[] | null;
}

export type JournalEntryOut = {
  id: string;
  date: string;
  mood: number;
  content: string;
  created_at: string;
};

export type SleepBand = "lt5" | "5to6" | "6to7" | "7to8" | "gt8";
export type MovementType = "walk" | "workout" | "sport" | "other";

export type PhysicalOut = {
  id: string;
  date: string;
  sleep_band: SleepBand | null;
  energy: number | null;
  moved: boolean | null;
  movement_type: MovementType | null;
  duration_minutes: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type PhysicalIn = {
  date?: string;
  sleep_band?: SleepBand | null;
  energy?: number | null;
  moved?: boolean | null;
  movement_type?: MovementType | null;
  duration_minutes?: number | null;
  note?: string | null;
};

export type NudgeOut = {
  id: string;
  category: "breath" | "reframe" | "grounding";
  name: string;
  prompt: string;
  why: string;
  acknowledgement: string;
};

export type ThoughtOut = { text: string; attribution: string | null };

export type WeeklyReflectionOut = {
  id: string | null;
  week_start: string;
  answers: Record<string, string>;
  created_at: string | null;
  updated_at: string | null;
};

export type ProgressSummaryOut = {
  program: {
    total_days: number;
    completed_days: number;
    actions_completed: number;
    identity_statement: string | null;
  };
  journal: {
    entries_this_week: number;
    avg_mood_this_week: number | null;
    mood_strip: (number | null)[];
  };
  physical: {
    checkins_this_week: number;
    avg_sleep_band: string | null;
    movement_days: number;
    total_minutes_this_week: number;
  };
  streak: number;
};
