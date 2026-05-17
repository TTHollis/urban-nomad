const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

// Local mode
export const getEvents = ({ city, state, zip_code, ...params } = {}) => {
  const q = new URLSearchParams(params)
  if (zip_code) q.set('zip_code', zip_code)
  if (city) q.set('city', city)
  if (state) q.set('state', state)
  return request(`/events?${q}`)
}

// Nomad mode
export const getBriefing = (city) =>
  request(`/nomad/briefing?city=${encodeURIComponent(city)}`)

export const getTips = (city) =>
  request(`/nomad/tips?city=${encodeURIComponent(city)}`)

export const addTip = (tip) =>
  request('/nomad/tips', { method: 'POST', body: JSON.stringify(tip) })
