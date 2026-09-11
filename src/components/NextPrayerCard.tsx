import { PRAYER_LABELS, formatCountdown, formatTime, type NextPrayerInfo } from '../lib/prayerTimes'

interface Props {
  nextPrayer: NextPrayerInfo
  cityName: string | null
}

export default function NextPrayerCard({ nextPrayer, cityName }: Props) {
  const { hours, minutes } = formatCountdown(nextPrayer.msRemaining)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-8 text-center text-white shadow-card">
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-14 -right-10 h-48 w-48 rounded-full bg-white/5" />

      <div className="relative flex flex-col items-center gap-3">
        {cityName && (
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            📍 {cityName}
          </span>
        )}

        <span className="text-sm font-medium text-brand-100">الصلاة القادمة</span>
        <span className="text-3xl font-black tracking-tight">{PRAYER_LABELS[nextPrayer.key]}</span>

        <div className="mt-2 flex items-center justify-center gap-2" dir="ltr">
          <div className="flex flex-col items-center">
            <span className="min-w-[3.5rem] rounded-2xl bg-white/15 px-3 py-2 text-4xl font-black tabular-nums">
              {hours}
            </span>
            <span className="mt-1 text-xs text-brand-100">ساعة</span>
          </div>
          <span className="pb-6 text-3xl font-black text-brand-100">:</span>
          <div className="flex flex-col items-center">
            <span className="min-w-[3.5rem] rounded-2xl bg-white/15 px-3 py-2 text-4xl font-black tabular-nums">
              {minutes}
            </span>
            <span className="mt-1 text-xs text-brand-100">دقيقة</span>
          </div>
        </div>

        <span className="mt-1 text-sm text-brand-100">
          الأذان الساعة {formatTime(nextPrayer.time)}
        </span>
      </div>
    </div>
  )
}
