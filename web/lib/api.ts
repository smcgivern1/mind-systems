import type {
  Action,
  DayCompleteResult,
  DayData,
  JournalEntryOut,
  NudgeOut,
  PhysicalIn,
  PhysicalOut,
  Program,
  Progress,
  ProgressSummaryOut,
  ThoughtOut,
  User,
  WeeklyReflectionOut,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const api = {
  login: (email: string) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
  getProgram: () => request<Program>("/program/active"),
  getProgress: () => request<Progress>("/progress"),
  putProgress: (current_day_number: number, current_step_number: number) =>
    request<Progress>("/progress", {
      method: "PUT",
      body: JSON.stringify({ current_day_number, current_step_number }),
    }),
  getDay: (dayNumber: number) => request<DayData>(`/day/${dayNumber}`),
  completeDay: (dayNumber: number) =>
    request<DayCompleteResult>(`/day/${dayNumber}/complete`, { method: "POST" }),
  putAnswer: (step_id: string, field_key: string, value: unknown) =>
    request<{ id: string; value: unknown }>("/answers", {
      method: "PUT",
      body: JSON.stringify({ step_id, field_key, value }),
    }),
  createAction: (day_id: string, text: string) =>
    request<Action>("/actions", {
      method: "POST",
      body: JSON.stringify({ day_id, text }),
    }),
  patchAction: (id: string, patch: { text?: string; completed?: boolean }) =>
    request<Action>(`/actions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteAction: (id: string) =>
    request<{ ok: boolean }>(`/actions/${id}`, { method: "DELETE" }),
  getJournalEntries: () => request<JournalEntryOut[]>("/journal"),
  createJournalEntry: (body: { mood: number; content: string; date?: string }) =>
    request<JournalEntryOut>("/journal", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const me = () => api.me();
export const logout = () => api.logout();
export const getActiveProgram = () => api.getProgram();
export const getProgress = () => api.getProgress();
export const getJournalEntries = () => api.getJournalEntries();
export const createJournalEntry = api.createJournalEntry;

export const getPhysicalToday = () =>
  request<PhysicalOut>("/physical/today").catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });

export const upsertPhysical = (body: PhysicalIn) =>
  request<PhysicalOut>("/physical", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getPhysicalRange = (from: string, to: string) =>
  request<PhysicalOut[]>(`/physical?from=${from}&to=${to}`);

export const getThoughtToday = () => request<ThoughtOut>("/thought/today");

export const getProgressSummary = () =>
  request<ProgressSummaryOut>("/progress/summary");

export const getNudge = (entryId: string, excludeIds: string[] = []) =>
  request<NudgeOut>(`/journal/${entryId}/nudge`, {
    method: "POST",
    body: JSON.stringify({ exclude_ids: excludeIds }),
  });

export const submitNudgeFeedback = (
  entryId: string,
  nudgeId: string,
  helpful: boolean,
) =>
  request<void>(`/journal/${entryId}/intervention-feedback`, {
    method: "PATCH",
    body: JSON.stringify({ nudge_id: nudgeId, helpful }),
  });

export const getWeeklyCurrent = () =>
  request<WeeklyReflectionOut>("/weekly/current");

export const putWeeklyAnswer = (field_key: string, value: string) =>
  request<WeeklyReflectionOut>("/weekly/answer", {
    method: "PUT",
    body: JSON.stringify({ field_key, value }),
  });
