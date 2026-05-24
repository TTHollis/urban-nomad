import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const KEY = 'urban-nomad.favorites'

/**
 * useFavorites — Manages saved/starred events in localStorage.
 * Stores the full event object so saved events still display when the
 * underlying API result is no longer cached.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage(KEY, [])

  const isFavorite = useCallback(
    (id) => favorites.some(f => f.id === id),
    [favorites]
  )

  const toggle = useCallback((event) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === event.id)
      if (exists) return prev.filter(f => f.id !== event.id)
      return [{ ...event, savedAt: new Date().toISOString() }, ...prev]
    })
  }, [setFavorites])

  const remove = useCallback((id) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }, [setFavorites])

  const clear = useCallback(() => setFavorites([]), [setFavorites])

  return { favorites, isFavorite, toggle, remove, clear }
}
