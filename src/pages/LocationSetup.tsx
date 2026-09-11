import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

type Status = 'idle' | 'locating' | 'denied' | 'error'

export default function LocationSetup() {
  const navigate = useNavigate()
  const { setAutoLocation, completeOnboarding } = useApp()
  const [status, setStatus] = useState<Status>('idle')

  const handleAutoLocate = () => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAutoLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        completeOnboarding()
        navigate('/home', { replace: true })
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleManual = () => {
    navigate('/onboarding/city')
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 px-6 py-10 dark:bg-slate-950">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-5xl dark:bg-brand-900/40">
          📍
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">تحديد موقعك</h1>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-slate-600 dark:text-slate-300">
            نستخدم موقعك الجغرافي لحساب مواقيت الصلاة بدقة حسب مدينتك. يمكنك بدلًا من ذلك اختيار مدينتك
            يدويًا، ويمكنك تغيير هذا الخيار لاحقًا من الإعدادات.
          </p>
        </div>

        {status === 'denied' && (
          <div className="w-full max-w-sm rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            تم رفض إذن الوصول إلى الموقع. يمكنك اختيار مدينتك يدويًا بدلًا من ذلك.
          </div>
        )}
        {status === 'error' && (
          <div className="w-full max-w-sm rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            تعذّر تحديد موقعك. حاول مرة أخرى أو اختر مدينتك يدويًا.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleAutoLocate}
          disabled={status === 'locating'}
          className="w-full rounded-2xl bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-card transition active:scale-[0.98] disabled:opacity-70"
        >
          {status === 'locating' ? 'جارٍ تحديد الموقع...' : 'السماح بتحديد الموقع تلقائيًا'}
        </button>
        <button
          onClick={handleManual}
          className="w-full rounded-2xl bg-white px-6 py-4 text-base font-bold text-brand-700 shadow-sm ring-1 ring-slate-200 transition active:scale-[0.98] dark:bg-slate-900 dark:text-brand-300 dark:ring-slate-800"
        >
          اختيار المدينة يدويًا
        </button>
      </div>
    </div>
  )
}
