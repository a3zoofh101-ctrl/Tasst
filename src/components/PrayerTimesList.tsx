import { FIVE_PRAYERS, PRAYER_LABELS, formatTime, type DayPrayerTimes, type PrayerKey } from '../lib/prayerTimes'

const PRAYER_ICONS: Record<PrayerKey, string> = {
  fajr: '🌙',
  sunrise: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌇',
  isha: '✨',
}

interface Props {
  times: DayPrayerTimes
  activeKey: PrayerKey
}

export default function PrayerTimesList({ times, activeKey }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {FIVE_PRAYERS.map((key) => {
          const isActive = key === activeKey
          return (
            <li
              key={key}
              className={`flex items-center justify-between px-5 py-4 ${
                isActive ? 'bg-brand-50 dark:bg-brand-900/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{PRAYER_ICONS[key]}</span>
                <span
                  className={`text-base font-semibold ${
                    isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {PRAYER_LABELS[key]}
                </span>
              </div>
              <span
                className={`text-base font-bold tabular-nums ${
                  isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 dark:text-slate-300'
                }`}
                dir="ltr"
              >
                {formatTime(times[key])}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
