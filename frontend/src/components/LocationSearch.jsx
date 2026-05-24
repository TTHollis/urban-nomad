import { useState } from 'react'
import { detectLocation, geoErrorMessage } from '../hooks/useGeolocation'
import styles from './LocationSearch.module.css'

export default function LocationSearch({ onSearch, loading, accentColor = 'green', buttonLabel = 'Search' }) {
  const [mode, setMode] = useState('city')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [geoError, setGeoError] = useState('')

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

  const handleDetectLocation = async () => {
    setGeoError('')
    setDetecting(true)
    try {
      const loc = await detectLocation()
      // Switch to city mode and fill the fields so the user sees what was detected
      setMode('city')
      setCity(loc.city)
      setState(loc.state || '')
      setZip('')
      // Auto-trigger the search
      onSearch({
        city: loc.city,
        state: loc.state || undefined,
        displayName: loc.displayName,
      })
    } catch (err) {
      setGeoError(geoErrorMessage(err))
    } finally {
      setDetecting(false)
    }
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      {/* Mode toggle + detect button */}
      <div className={styles.toggleRow}>
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
        <button
          type="button"
          className={styles.locateBtn}
          onClick={handleDetectLocation}
          disabled={detecting || loading}
          title="Use my current location"
        >
          {detecting
            ? <><span className={styles.miniSpinner} /> Locating…</>
            : <>📍 Use my location</>
          }
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
        />
      )}

      <button
        className={`${styles.searchBtn} ${accent}`}
        type="submit"
        disabled={loading || detecting || (mode === 'city' ? !city.trim() : !zip.trim())}
      >
        {loading ? <span className={styles.spinner} /> : buttonLabel}
      </button>

      {geoError && (
        <p className={styles.geoError}>⚠️ {geoError}</p>
      )}
    </form>
  )
}
