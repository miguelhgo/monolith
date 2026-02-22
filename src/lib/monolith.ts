export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
export const DEFAULT_WAITING = 284019;
export const DEFAULT_LAUNCH_DATE = "2026-03-31";
export const TITLE_MIN = 16;
export const BODY_MIN = 280;

export type OAuthProvider = "google" | "github";

export interface ChosenInfo {
  day: string;
  user_id: string;
  username: string | null;
}

export interface DailyPost {
  day: string;
  author_user_id: string;
  title: string;
  body: string;
  updated_at: string | null;
}

export function formatCount(value: number | null) {
  if (value === null || Number.isNaN(value)) return "…";
  return value.toLocaleString("en-US");
}

export function formatLaunchDate(launchDateIso: string) {
  const date = new Date(`${launchDateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return launchDateIso;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

export function usernameValidationMessage(username: string) {
  if (!username) return "Pick a username to continue.";
  if (!USERNAME_REGEX.test(username)) {
    return "Use 3-20 chars: lowercase letters, numbers, and underscores.";
  }
  return null;
}

export function getUtcDayIso(date: Date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function formatUtcDay(isoDay: string) {
  const date = new Date(`${isoDay}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDay;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatUtcTimestamp(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}
