import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { APP_TIMEZONE } from '../lib/prayerTimes'
import { useNextPrayer } from '../lib/useNextPrayer'
import NextPrayerCard from '../components/NextPrayerCard'
import PrayerTimesList from '../components/PrayerTimesList'

export default function Home() {
  const navigate = useNavigate()
  const { settings, coords, cityName } = useApp()
  const { now, nextPrayer, todayTimes } = useNextPrayer(coords)

  useEffect(() => {
    if (settings.onboardingComplete && !coords) {
      navigate('/onboarding/location', { replace: true })
    }
  }, [settings.onboardingComplete, coords, navigate])

  const gregorianDate = now.toLocaleDateString('ar-SA-u-ca-gregory', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: APP_TIMEZONE,
  })
  const hijriDate = now.toLocaleDateString('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-10 dark:bg-slate-950">
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">نستعين</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {gregorianDate} • {hijriDate} هـ
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          aria-label="الإعدادات"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-slate-200 transition active:scale-95 dark:bg-slate-900 dark:ring-slate-800"
        >
          ⚙️
        </button>
      </header>

      <main className="flex flex-col gap-5 px-5 pt-4">
        {nextPrayer ? (
          <NextPrayerCard nextPrayer={nextPrayer} cityName={cityName} />
        ) : (
          <div className="animate-pulse-soft rounded-3xl bg-slate-200 px-6 py-16 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            جارٍ تحميل مواقيت الصلاة...
          </div>
        )}

        {todayTimes && nextPrayer && (
          <section>
            <h2 className="mb-3 px-1 text-base font-bold text-slate-800 dark:text-slate-100">
              مواقيت اليوم
            </h2>
            <PrayerTimesList times={todayTimes} activeKey={nextPrayer.key} />
          </section>
        )}
      </main>
    </div>
  )
}
