import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchCities } from '../lib/cities'
import { useApp } from '../context/AppContext'

interface Props {
  mode: 'onboarding' | 'settings'
}

export default function CitySelect({ mode }: Props) {
  const navigate = useNavigate()
  const { settings, setCityManually, completeOnboarding } = useApp()
  const [query, setQuery] = useState('')

  const cities = useMemo(() => searchCities(query), [query])

  const handleSelect = (cityId: string) => {
    setCityManually(cityId)
    if (mode === 'onboarding') {
      completeOnboarding()
      navigate('/home', { replace: true })
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center gap-3 px-5 pb-2 pt-6">
        {mode === 'settings' && (
          <button
            onClick={() => navigate(-1)}
            aria-label="رجوع"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800"
          >
            ←
          </button>
        )}
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">اختر مدينتك</h1>
      </header>

      <div className="px-5 pb-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مدينتك..."
            autoFocus
            className="w-full rounded-2xl border-none bg-white px-4 py-3 pr-11 text-base text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-900 dark:text-white dark:ring-slate-800"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {cities.length === 0 ? (
          <p className="mt-10 text-center text-slate-500 dark:text-slate-400">لا توجد نتائج مطابقة</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {cities.map((city) => {
              const isSelected = settings.locationMode === 'manual' && settings.cityId === city.id
              return (
                <li key={city.id}>
                  <button
                    onClick={() => handleSelect(city.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-right shadow-sm ring-1 transition active:scale-[0.99] ${
                      isSelected
                        ? 'bg-brand-600 text-white ring-brand-600'
                        : 'bg-white text-slate-900 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-800'
                    }`}
                  >
                    <span className="flex flex-col items-start">
                      <span className="text-base font-semibold">{city.name}</span>
                      <span className={`text-xs ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                        {city.region}
                      </span>
                    </span>
                    {isSelected && <span className="text-lg">✓</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
