import { FIVE_PRAYERS, PRAYER_LABELS, computePrayerTimesForDate, type Coords } from './prayerTimes'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

interface ScheduledTimer {
  id: ReturnType<typeof setTimeout>
}

let scheduledTimers: ScheduledTimer[] = []

function clearScheduled(): void {
  for (const t of scheduledTimers) clearTimeout(t.id)
  scheduledTimers = []
}

function scheduleAt(fireDate: Date, title: string, body: string): void {
  const delay = fireDate.getTime() - Date.now()
  // setTimeout only reliably fires within ~24 days and while the tab is
  // alive; that is sufficient for same/next-day prayer reminders.
  if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return
  const id = setTimeout(() => {
    if (getNotificationPermission() === 'granted') {
      try {
        new Notification(title, { body, icon: '/logo.png', tag: title + fireDate.toISOString() })
      } catch {
        // Ignore failures constructing the notification (e.g. unsupported context).
      }
    }
  }, delay)
  scheduledTimers.push({ id })
}

// Schedules "10 minutes before" and "at prayer time" notifications for every
// remaining prayer today, and tomorrow's as a safety net. Call again whenever
// the app becomes active/visible to keep the schedule fresh.
export function schedulePrayerNotifications(coords: Coords): void {
  clearScheduled()
  if (getNotificationPermission() !== 'granted') return

  const now = new Date()
  const days = [now, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)]

  for (const day of days) {
    const times = computePrayerTimesForDate(coords, day)
    for (const key of FIVE_PRAYERS) {
      const prayerTime = times[key]
      const label = PRAYER_LABELS[key]
      const reminderTime = new Date(prayerTime.getTime() - 10 * 60 * 1000)

      scheduleAt(reminderTime, 'تذكير بموعد الصلاة', `تبقّى 10 دقائق على أذان ${label}`)
      scheduleAt(prayerTime, 'حان وقت الصلاة', `حان الآن موعد أذان ${label}`)
    }
  }
}

export function cancelPrayerNotifications(): void {
  clearScheduled()
}
