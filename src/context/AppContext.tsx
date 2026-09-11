import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  AppSettings,
  LocationMode,
  StoredCoords,
  ThemeMode,
  loadSettings,
  saveSettings,
} from '../lib/storage'
import { findCityById, findNearestCity } from '../lib/cities'
import {
  cancelPrayerNotifications,
  requestNotificationPermission,
  schedulePrayerNotifications,
} from '../lib/notifications'
import type { Coords } from '../lib/prayerTimes'

interface AppContextValue {
  settings: AppSettings
  coords: Coords | null
  cityName: string | null
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
  setCityManually: (cityId: string) => void
  setAutoLocation: (coords: StoredCoords) => void
  setLocationMode: (mode: LocationMode) => void
  completeOnboarding: () => void
  enableNotifications: () => Promise<boolean>
  disableNotifications: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

function getSystemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const listener = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (settings.theme === 'system') return systemPrefersDark ? 'dark' : 'light'
    return settings.theme
  }, [settings.theme, systemPrefersDark])

  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [resolvedTheme])

  const coords: Coords | null = useMemo(() => {
    if (settings.locationMode === 'auto' && settings.coords) {
      return settings.coords
    }
    const city = findCityById(settings.cityId)
    return city ? { lat: city.lat, lng: city.lng } : null
  }, [settings.locationMode, settings.coords, settings.cityId])

  const cityName: string | null = useMemo(() => {
    if (settings.locationMode === 'auto' && settings.coords) {
      return findNearestCity(settings.coords.lat, settings.coords.lng).name
    }
    return findCityById(settings.cityId)?.name ?? null
  }, [settings.locationMode, settings.coords, settings.cityId])

  useEffect(() => {
    if (!coords) return
    if (settings.notificationsEnabled) {
      schedulePrayerNotifications(coords)
    } else {
      cancelPrayerNotifications()
    }
  }, [coords, settings.notificationsEnabled])

  useEffect(() => {
    if (!coords || !settings.notificationsEnabled) return
    const onVisible = () => {
      if (document.visibilityState === 'visible') schedulePrayerNotifications(coords)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [coords, settings.notificationsEnabled])

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((s) => ({ ...s, theme }))
  }, [])

  const setCityManually = useCallback((cityId: string) => {
    setSettings((s) => ({ ...s, locationMode: 'manual', cityId }))
  }, [])

  const setAutoLocation = useCallback((newCoords: StoredCoords) => {
    setSettings((s) => ({ ...s, locationMode: 'auto', coords: newCoords }))
  }, [])

  const setLocationMode = useCallback((mode: LocationMode) => {
    setSettings((s) => ({ ...s, locationMode: mode }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setSettings((s) => ({ ...s, onboardingComplete: true }))
  }, [])

  const enableNotifications = useCallback(async () => {
    const result = await requestNotificationPermission()
    const granted = result === 'granted'
    setSettings((s) => ({ ...s, notificationsEnabled: granted }))
    return granted
  }, [])

  const disableNotifications = useCallback(() => {
    setSettings((s) => ({ ...s, notificationsEnabled: false }))
  }, [])

  const value: AppContextValue = {
    settings,
    coords,
    cityName,
    resolvedTheme,
    setTheme,
    setCityManually,
    setAutoLocation,
    setLocationMode,
    completeOnboarding,
    enableNotifications,
    disableNotifications,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
