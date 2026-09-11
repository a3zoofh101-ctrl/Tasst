import { Navigate, Route, Routes } from 'react-router-dom'
import Splash from './pages/Splash'
import LocationSetup from './pages/LocationSetup'
import CitySelect from './pages/CitySelect'
import Home from './pages/Home'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding/location" element={<LocationSetup />} />
      <Route path="/onboarding/city" element={<CitySelect mode="onboarding" />} />
      <Route path="/city" element={<CitySelect mode="settings" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
