import { useState, useEffect, useCallback } from 'react'

/**
 * useLocalStorage — Reactive localStorage hook.
 * Reads on mount, writes on change, and stays in sync across browser tabs.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  // Persist whenever value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // quota exceeded, private mode, etc.
    }
  }, [key, value])

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue))
        } catch {/* ignore */}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return [value, setValue, reset]
}
