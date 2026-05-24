import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const KEY = 'urban-nomad.recent-searches'
const MAX = 8

/**
 * useRecentSearches — Tracks recently searched locations across both modes.
 * Each entry has { city, state, zip_code, displayName, searchedAt }.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useLocalStorage(KEY, [])

  const record = useCallback((loc) => {
    if (!loc || !loc.displayName) return
    setRecent(prev => {
      // Dedup on displayName (case-insensitive)
      const key = loc.displayName.toLowerCase()
      const filtered = prev.filter(r => r.displayName.toLowerCase() !== key)
      return [
        { ...loc, searchedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX)
    })
  }, [setRecent])

  const remove = useCallback((displayName) => {
    setRecent(prev => prev.filter(r => r.displayName !== displayName))
  }, [setRecent])

  const clear = useCallback(() => setRecent([]), [setRecent])

  return { recent, record, remove, clear }
}
