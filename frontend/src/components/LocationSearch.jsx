import { useState } from 'react'
import styles from './LocationSearch.module.css'

export default function LocationSearch({ onSearch, loading, accentColor = 'green', buttonLabel = 'Search' }) {
  const [mode, setMode] = useState('city')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  const accent = accentColor === 'amber' ? styles.amber : styles.green

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'zip') {
      if (!zip.trim()) return
      onSearch({ zip_code: zip.trim(), displayName: zip.trim() })
    } else {
      if (!city.trim()) return
      const displayName = state.trim() ? `${city.trim()}, ${state.trim()}` : city.trim()
      onSearch({ city: city.trim(), state: state.trim() || undefined, displayName })
    }
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      {/* Mode toggle */}
      <div className={styles.toggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'city' ? `${styles.toggleActive} ${accent}` : ''}`}
          onClick={() => setMode('city')}
        >
          🏙️ City
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'zip' ? `${styles.toggleActive} ${accent}` : ''}`}
          onClick={() => setMode('zip')}
        >
          📮 Zip / Postal
        </button>
      </div>

      {/* Inputs */}
      {mode === 'city' ? (
        <div className={styles.cityRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="City name — e.g. Jacksonville"
            value={city}
            onChange={e => setCity(e.target.value)}
            autoFocus
          />
          <input
            className={`${styles.input} ${styles.stateInput}`}
            type="text"
            placeholder="State / Country (e.g. FL)"
            value={state}
            onChange={e => setState(e.target.value)}
          />
        </div>
      ) : (
        <input
          className={styles.input}
          type="text"
          placeholder="ZIP or postal code — e.g. 32099"
          value={zip}
          onChange={e => setZip(e.target.value)}
          autoFocus
        />
      )}

      <button
        className={`${styles.searchBtn} ${accent}`}
        type="submit"
        disabled={loading || (mode === 'city' ? !city.trim() : !zip.trim())}
      >
        {loading ? <span className={styles.spinner} /> : buttonLabel}
      </button>
    </form>
  )
}
