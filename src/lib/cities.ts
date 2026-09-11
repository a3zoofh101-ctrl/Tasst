export interface City {
  id: string
  name: string
  nameEn: string
  region: string
  lat: number
  lng: number
  timezone: string
}

// Major Saudi cities with their approximate coordinates.
export const SAUDI_CITIES: City[] = [
  { id: 'riyadh', name: 'الرياض', nameEn: 'Riyadh', region: 'منطقة الرياض', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
  { id: 'jeddah', name: 'جدة', nameEn: 'Jeddah', region: 'منطقة مكة المكرمة', lat: 21.4858, lng: 39.1925, timezone: 'Asia/Riyadh' },
  { id: 'makkah', name: 'مكة المكرمة', nameEn: 'Makkah', region: 'منطقة مكة المكرمة', lat: 21.3891, lng: 39.8579, timezone: 'Asia/Riyadh' },
  { id: 'madinah', name: 'المدينة المنورة', nameEn: 'Madinah', region: 'منطقة المدينة المنورة', lat: 24.5247, lng: 39.5692, timezone: 'Asia/Riyadh' },
  { id: 'dammam', name: 'الدمام', nameEn: 'Dammam', region: 'المنطقة الشرقية', lat: 26.4207, lng: 50.0888, timezone: 'Asia/Riyadh' },
  { id: 'khobar', name: 'الخبر', nameEn: 'Khobar', region: 'المنطقة الشرقية', lat: 26.2172, lng: 50.1971, timezone: 'Asia/Riyadh' },
  { id: 'dhahran', name: 'الظهران', nameEn: 'Dhahran', region: 'المنطقة الشرقية', lat: 26.2361, lng: 50.0393, timezone: 'Asia/Riyadh' },
  { id: 'ahsa', name: 'الأحساء', nameEn: 'Al Ahsa', region: 'المنطقة الشرقية', lat: 25.3833, lng: 49.5867, timezone: 'Asia/Riyadh' },
  { id: 'jubail', name: 'الجبيل', nameEn: 'Jubail', region: 'المنطقة الشرقية', lat: 27.0046, lng: 49.6607, timezone: 'Asia/Riyadh' },
  { id: 'taif', name: 'الطائف', nameEn: 'Taif', region: 'منطقة مكة المكرمة', lat: 21.2703, lng: 40.4158, timezone: 'Asia/Riyadh' },
  { id: 'yanbu', name: 'ينبع', nameEn: 'Yanbu', region: 'منطقة المدينة المنورة', lat: 24.0895, lng: 38.0618, timezone: 'Asia/Riyadh' },
  { id: 'tabuk', name: 'تبوك', nameEn: 'Tabuk', region: 'منطقة تبوك', lat: 28.3838, lng: 36.5550, timezone: 'Asia/Riyadh' },
  { id: 'abha', name: 'أبها', nameEn: 'Abha', region: 'منطقة عسير', lat: 18.2164, lng: 42.5053, timezone: 'Asia/Riyadh' },
  { id: 'khamis-mushait', name: 'خميس مشيط', nameEn: 'Khamis Mushait', region: 'منطقة عسير', lat: 18.3000, lng: 42.7333, timezone: 'Asia/Riyadh' },
  { id: 'najran', name: 'نجران', nameEn: 'Najran', region: 'منطقة نجران', lat: 17.4924, lng: 44.1277, timezone: 'Asia/Riyadh' },
  { id: 'jazan', name: 'جازان', nameEn: 'Jazan', region: 'منطقة جازان', lat: 16.8892, lng: 42.5611, timezone: 'Asia/Riyadh' },
  { id: 'hail', name: 'حائل', nameEn: 'Hail', region: 'منطقة حائل', lat: 27.5219, lng: 41.6907, timezone: 'Asia/Riyadh' },
  { id: 'buraidah', name: 'بريدة', nameEn: 'Buraidah', region: 'منطقة القصيم', lat: 26.3260, lng: 43.9750, timezone: 'Asia/Riyadh' },
  { id: 'unaizah', name: 'عنيزة', nameEn: 'Unaizah', region: 'منطقة القصيم', lat: 26.0844, lng: 43.9935, timezone: 'Asia/Riyadh' },
  { id: 'arar', name: 'عرعر', nameEn: 'Arar', region: 'منطقة الحدود الشمالية', lat: 30.9753, lng: 41.0381, timezone: 'Asia/Riyadh' },
  { id: 'sakaka', name: 'سكاكا', nameEn: 'Sakaka', region: 'منطقة الجوف', lat: 29.9697, lng: 40.2064, timezone: 'Asia/Riyadh' },
  { id: 'al-baha', name: 'الباحة', nameEn: 'Al Baha', region: 'منطقة الباحة', lat: 20.0129, lng: 41.4677, timezone: 'Asia/Riyadh' },
  { id: 'qatif', name: 'القطيف', nameEn: 'Qatif', region: 'المنطقة الشرقية', lat: 26.5196, lng: 50.0079, timezone: 'Asia/Riyadh' },
  { id: 'hafr-al-batin', name: 'حفر الباطن', nameEn: 'Hafar Al-Batin', region: 'المنطقة الشرقية', lat: 28.4342, lng: 45.9601, timezone: 'Asia/Riyadh' },
  { id: 'rabigh', name: 'رابغ', nameEn: 'Rabigh', region: 'منطقة مكة المكرمة', lat: 22.7986, lng: 39.0349, timezone: 'Asia/Riyadh' },
  { id: 'al-kharj', name: 'الخرج', nameEn: 'Al Kharj', region: 'منطقة الرياض', lat: 24.1556, lng: 47.3350, timezone: 'Asia/Riyadh' },
  { id: 'qurayyat', name: 'القريات', nameEn: 'Qurayyat', region: 'منطقة الجوف', lat: 31.3311, lng: 37.3428, timezone: 'Asia/Riyadh' },
  { id: 'duba', name: 'ضباء', nameEn: 'Duba', region: 'منطقة تبوك', lat: 27.3517, lng: 35.6939, timezone: 'Asia/Riyadh' },
  { id: 'al-qunfudhah', name: 'القنفذة', nameEn: 'Al Qunfudhah', region: 'منطقة مكة المكرمة', lat: 19.1264, lng: 41.0783, timezone: 'Asia/Riyadh' },
  { id: 'bisha', name: 'بيشة', nameEn: 'Bisha', region: 'منطقة عسير', lat: 19.9821, lng: 42.6021, timezone: 'Asia/Riyadh' },
]

export function findCityById(id: string | null | undefined): City | undefined {
  if (!id) return undefined
  return SAUDI_CITIES.find((c) => c.id === id)
}

export function searchCities(query: string): City[] {
  const q = query.trim().toLowerCase()
  if (!q) return SAUDI_CITIES
  return SAUDI_CITIES.filter(
    (c) => c.name.includes(query.trim()) || c.nameEn.toLowerCase().includes(q) || c.region.includes(query.trim())
  )
}

// Find the closest supported city to a given coordinate (fallback display name
// for auto-detected locations that aren't exactly one of our listed cities).
export function findNearestCity(lat: number, lng: number): City {
  let nearest = SAUDI_CITIES[0]
  let minDist = Infinity
  for (const city of SAUDI_CITIES) {
    const dist = Math.hypot(city.lat - lat, city.lng - lng)
    if (dist < minDist) {
      minDist = dist
      nearest = city
    }
  }
  return nearest
}
