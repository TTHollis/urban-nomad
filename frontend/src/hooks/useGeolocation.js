/**
 * Get the user's current location via browser Geolocation API
 * and reverse-geocode it to a city + state using OpenStreetMap Nominatim.
 *
 * Nominatim is free and requires no API key, but has a 1 req/sec rate limit.
 * For an app at scale, we'd want to proxy + cache server-side.
 */

const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'

function getBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 5 * 60 * 1000, // accept cached fix up to 5 min old
      enableHighAccuracy: false,
    })
  })
}

function parseStateCode(addr) {
  // Nominatim returns ISO3166-2-lvl4 like "US-FL" — prefer that when available
  const iso = addr['ISO3166-2-lvl4']
  if (iso && iso.includes('-')) {
    const code = iso.split('-')[1]
    if (code && code.length <= 3) return code
  }
  // Fall back to full state name (e.g. "Florida")
  return addr.state || addr.region || ''
}

export async function detectLocation() {
  const pos = await getBrowserPosition()
  const { latitude, longitude } = pos.coords

  const url = `${REVERSE_URL}?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Could not look up your city')

  const data = await res.json()
  const addr = data.address || {}
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.hamlet ||
    addr.municipality ||
    addr.county ||
    ''
  const stateCode = parseStateCode(addr)
  const country = (addr.country_code || '').toUpperCase()

  if (!city) throw new Error("Couldn't pin your exact city — try searching manually")

  const displayName = stateCode ? `${city}, ${stateCode}` : country ? `${city}, ${country}` : city

  return {
    city,
    state: stateCode || country,
    country,
    displayName,
    coords: { latitude, longitude },
  }
}

export function geoErrorMessage(err) {
  if (!err) return 'Unknown error'
  // PositionError codes: 1 = denied, 2 = unavailable, 3 = timeout
  if (err.code === 1) return 'Location permission was denied'
  if (err.code === 2) return 'Your location is unavailable right now'
  if (err.code === 3) return 'Location request timed out — try again'
  return err.message || 'Something went wrong'
}
