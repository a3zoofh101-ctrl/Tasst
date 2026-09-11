import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
}

// The five daily prayers (sunrise is shown for reference but excluded from
// the "next prayer" rotation since it is not a prayer that is prayed).
export const FIVE_PRAYERS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export interface DayPrayerTimes {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export interface Coords {
  lat: number
  lng: number
}

// All supported cities are within Saudi Arabia, a single timezone with no DST.
export const APP_TIMEZONE = 'Asia/Riyadh'

const riyadhDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// adhan.js reads the *local* getFullYear/getMonth/getDate of the Date object
// it's given to decide which calendar day to compute. The device running
// this app may be in any timezone, so instead of trusting `new Date()`'s own
// local getters, we resolve the correct Riyadh calendar day for the given
// instant and build a Date whose local getters report exactly that day —
// this keeps the calculation correct regardless of the device's timezone.
function toRiyadhCalendarDate(instant: Date): Date {
  const parts = riyadhDateFormatter.formatToParts(instant)
  const lookup = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return new Date(lookup('year'), lookup('month') - 1, lookup('day'), 12, 0, 0)
}

export function computePrayerTimesForDate(coords: Coords, date: Date): DayPrayerTimes {
  const coordinates = new Coordinates(coords.lat, coords.lng)
  // Umm al-Qura is the calculation method used officially in Saudi Arabia.
  const params = CalculationMethod.UmmAlQura()
  const times = new PrayerTimes(coordinates, toRiyadhCalendarDate(date), params)
  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  }
}

export interface NextPrayerInfo {
  key: PrayerKey
  time: Date
  msRemaining: number
}

// Determines the next upcoming prayer (from the five daily prayers) relative
// to `now`, looking across today and, if needed, tomorrow.
export function getNextPrayer(coords: Coords, now: Date): NextPrayerInfo {
  const today = computePrayerTimesForDate(coords, now)
  for (const key of FIVE_PRAYERS) {
    const time = today[key]
    if (time.getTime() > now.getTime()) {
      return { key, time, msRemaining: time.getTime() - now.getTime() }
    }
  }
  // All of today's prayers have passed; use tomorrow's Fajr. Riyadh has a
  // fixed UTC+3 offset with no DST, so exactly +24h always lands on the next
  // Riyadh calendar day.
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const tomorrowTimes = computePrayerTimesForDate(coords, tomorrow)
  return {
    key: 'fajr',
    time: tomorrowTimes.fajr,
    msRemaining: tomorrowTimes.fajr.getTime() - now.getTime(),
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: APP_TIMEZONE,
  })
}

export function formatCountdown(ms: number): { hours: string; minutes: string } {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
  }
}
