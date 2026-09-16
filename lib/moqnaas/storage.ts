import { HuntSession, Settings } from "./types";

const BEST_SCORE_KEY = "moqnaas_best_score";
const HUNT_LOG_KEY = "moqnaas_hunt_log";
const SETTINGS_KEY = "moqnaas_settings";
const LAST_CAR_KEY = "moqnaas_last_car";
const LAST_REGION_KEY = "moqnaas_last_region";

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.9,
  cameraSensitivity: 1,
  vibration: true,
  playlistName: "شيلات المقناص"
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  return safeParse<number>(localStorage.getItem(BEST_SCORE_KEY), 0);
}

export function saveBestScoreIfHigher(score: number): number {
  const current = loadBestScore();
  if (score > current) {
    localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(score));
    return score;
  }
  return current;
}

export function loadHuntLog(): HuntSession[] {
  if (typeof window === "undefined") return [];
  return safeParse<HuntSession[]>(localStorage.getItem(HUNT_LOG_KEY), []);
}

export function appendHuntSession(session: HuntSession): HuntSession[] {
  const log = loadHuntLog();
  const next = [session, ...log].slice(0, 50);
  localStorage.setItem(HUNT_LOG_KEY, JSON.stringify(next));
  return next;
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...safeParse<Partial<Settings>>(localStorage.getItem(SETTINGS_KEY), {}) };
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadLastCar(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_CAR_KEY);
}

export function saveLastCar(carId: string) {
  localStorage.setItem(LAST_CAR_KEY, carId);
}

export function loadLastRegion(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_REGION_KEY);
}

export function saveLastRegion(regionId: string) {
  localStorage.setItem(LAST_REGION_KEY, regionId);
}
