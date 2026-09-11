export type LocationMode = 'auto' | 'manual'
export type ThemeMode = 'light' | 'dark' | 'system'

export interface StoredCoords {
  lat: number
  lng: number
}

export interface AppSettings {
  onboardingComplete: boolean
  locationMode: LocationMode
  cityId: string | null
  coords: StoredCoords | null
  notificationsEnabled: boolean
  theme: ThemeMode
}

const STORAGE_KEY = 'nastaeen.settings.v1'

export const DEFAULT_SETTINGS: AppSettings = {
  onboardingComplete: false,
  locationMode: 'manual',
  cityId: null,
  coords: null,
  notificationsEnabled: false,
  theme: 'system',
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage may be unavailable (e.g. private mode); fail silently.
  }
}
