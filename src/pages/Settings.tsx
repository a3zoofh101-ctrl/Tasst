import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getNotificationPermission } from '../lib/notifications'
import type { ThemeMode } from '../lib/storage'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'فاتح', icon: '☀️' },
  { value: 'dark', label: 'داكن', icon: '🌙' },
  { value: 'system', label: 'تلقائي', icon: '⚙️' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { settings, cityName, setAutoLocation, setTheme, enableNotifications, disableNotifications } = useApp()
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  const permission = getNotificationPermission()
  const permissionBlocked = permission === 'denied'

  const handleUseAutoLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocError('المتصفح لا يدعم تحديد الموقع')
      return
    }
    setLocating(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAutoLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocating(false)
      },
      (error) => {
        setLocating(false)
        setLocError(
          error.code === error.PERMISSION_DENIED
            ? 'تم رفض إذن الوصول إلى الموقع من إعدادات المتصفح'
            : 'تعذّر تحديد موقعك، حاول مرة أخرى'
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleToggleNotifications = async () => {
    if (settings.notificationsEnabled) {
      disableNotifications()
    } else {
      await enableNotifications()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 dark:bg-slate-950">
      <header className="flex items-center gap-3 px-5 pb-2 pt-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="رجوع"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">الإعدادات</h1>
      </header>

      <main className="flex flex-col gap-6 px-5 pt-4">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="mb-1 text-base font-bold text-slate-800 dark:text-slate-100">الموقع</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            المدينة الحالية:{' '}
            <span className="font-semibold text-brand-700 dark:text-brand-300">{cityName ?? 'غير محددة'}</span>
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleUseAutoLocation}
              disabled={locating}
              className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-right transition active:scale-[0.99] ${
                settings.locationMode === 'auto'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-50 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700'
              }`}
            >
              <span className="font-semibold">
                {locating ? 'جارٍ تحديد الموقع...' : 'استخدام موقعي الحالي تلقائيًا'}
              </span>
              <span>📍</span>
            </button>
            <button
              onClick={() => navigate('/city')}
              className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-right transition active:scale-[0.99] ${
                settings.locationMode === 'manual'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-50 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700'
              }`}
            >
              <span className="font-semibold">اختيار مدينة يدويًا</span>
              <span>🏙️</span>
            </button>
          </div>

          {locError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {locError}
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">التنبيهات</h2>
              <p className="mt-1 max-w-[16rem] text-sm text-slate-500 dark:text-slate-400">
                تنبيه قبل الصلاة بعشر دقائق وعند دخول وقتها
              </p>
            </div>
            <button
              role="switch"
              aria-checked={settings.notificationsEnabled}
              onClick={handleToggleNotifications}
              disabled={permissionBlocked}
              className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50 ${
                settings.notificationsEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-[-1.75rem]' : 'translate-x-[-0.25rem]'
                } right-1`}
              />
            </button>
          </div>
          {permissionBlocked && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              الإشعارات محظورة من إعدادات المتصفح. فعّلها من إعدادات النظام لتتمكن من استخدامها هنا.
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="mb-4 text-base font-bold text-slate-800 dark:text-slate-100">المظهر</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl py-3.5 transition active:scale-[0.97] ${
                  settings.theme === opt.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
