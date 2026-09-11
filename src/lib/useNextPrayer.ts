import { useEffect, useState } from 'react'
import { getNextPrayer, computePrayerTimesForDate, type Coords, type NextPrayerInfo } from './prayerTimes'

export function useNextPrayer(coords: Coords | null) {
  const [now, setNow] = useState(() => new Date())
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!coords) {
      setNextPrayer(null)
      return
    }
    setNextPrayer(getNextPrayer(coords, now))
  }, [coords, now])

  const todayTimes = coords ? computePrayerTimesForDate(coords, now) : null

  return { now, nextPrayer, todayTimes }
}
