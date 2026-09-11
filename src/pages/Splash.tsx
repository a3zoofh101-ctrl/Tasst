import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Splash() {
  const navigate = useNavigate()
  const { settings } = useApp()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(settings.onboardingComplete ? '/home' : '/onboarding/location', { replace: true })
    }, 1400)
    return () => clearTimeout(timer)
  }, [navigate, settings.onboardingComplete])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-brand-700 to-brand-900 px-6 text-center">
      <img
        src="/logo.png"
        alt="شعار نستعين"
        className="h-32 w-32 animate-fade-in rounded-3xl object-contain drop-shadow-2xl"
      />
      <img
        src="/subtitle.png"
        alt="تطبيق مواقيت الصلاة"
        className="h-8 animate-fade-in object-contain opacity-90"
      />
      <div className="absolute bottom-14 flex flex-col items-center gap-2">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-full animate-pulse-soft rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  )
}
