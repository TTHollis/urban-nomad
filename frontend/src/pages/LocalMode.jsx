import { useState, useCallback } from 'react'
import Header from '../components/Header'
import EventCard from '../components/EventCard'
import LocationSearch from '../components/LocationSearch'
import { getEvents } from '../services/api'
import { useRecentSearches } from '../hooks/useRecentSearches'
import styles from './LocalMode.module.css'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: '🎵 Music', value: 'Music' },
  { label: '⚽ Sports', value: 'Sports' },
  { label: '🎭 Arts', value: 'Arts & Theatre' },
  { label: '😂 Comedy', value: 'Comedy' },
  { label: '👨‍👩‍👧 Family', value: 'Family' },
]

export default function LocalMode() {
  const [category, setCategory] = useState('')
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [lastSearch, setLastSearch] = useState(null)
  const { record } = useRecentSearches()

  const search = useCallback(async ({ city, state, zip_code, displayName: name, category: cat } = {}) => {
    // A "new" search is one where either city OR zip_code is provided.
    // Otherwise we re-run the previous search (used when category changes).
    const isNewSearch = city !== undefined || zip_code !== undefined
    const searchParams = isNewSearch ? { city, state, zip_code } : lastSearch
    if (!searchParams) return
    const label = name || displayName
    setStatus('loading')
    setErrorMsg('')
    setDisplayName(label)
    setLastSearch(searchParams)
    try {
      const data = await getEvents({ ...searchParams, category: cat ?? category, size: 24 })
      setEvents(data.events || [])
      setStatus('success')
      record({ ...searchParams, displayName: label })
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong')
      setStatus('error')
    }
  }, [category, displayName, lastSearch, record])

  const handleSearch = (loc) => search({ ...loc })

  const handleCategoryChange = (val) => {
    setCategory(val)
    if (status === 'success' && lastSearch) {
      search({ ...lastSearch, displayName, category: val })
    }
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>

        <section className={styles.searchSection}>
          <h1 className={styles.heading}><span className={styles.pin}>📍</span> Local Events</h1>
          <p className={styles.sub}>Find concerts, festivals, sports & more — search by city or zip code</p>
          <LocationSearch
            onSearch={handleSearch}
            loading={status === 'loading'}
            accentColor="green"
            buttonLabel="Search"
          />
          <div className={styles.filters}>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                className={`${styles.filterPill} ${category === c.value ? styles.filterActive : ''}`}
                onClick={() => handleCategoryChange(c.value)}
                type="button"
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {status === 'loading' && (
          <div className={styles.stateBox}>
            <div className={styles.bigSpinner} />
            <p>Searching events in {displayName}…</p>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.stateBox}>
            <span className={styles.stateIcon}>⚠️</span>
            <p className={styles.stateTitle}>Couldn't load events</p>
            <p className={styles.stateSub}>{errorMsg}</p>
            <button className={styles.retryBtn} onClick={() => search({})}>Try again</button>
          </div>
        )}

        {status === 'success' && events.length === 0 && (
          <div className={styles.stateBox}>
            <span className={styles.stateIcon}>🔍</span>
            <p className={styles.stateTitle}>No events found</p>
            <p className={styles.stateSub}>Try a different city, zip code, or category.</p>
          </div>
        )}

        {status === 'success' && events.length > 0 && (
          <section className={styles.results}>
            <p className={styles.resultsMeta}>
              {events.length} event{events.length !== 1 ? 's' : ''} in <strong>{displayName}</strong>
              {category && ` · ${category}`}
            </p>
            <div className={styles.grid}>
              {events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        {status === 'idle' && (
          <div className={styles.idleHint}>
            <span className={styles.idleIcon}>🌆</span>
            <p>Search any city or zip code to see what's happening</p>
          </div>
        )}
      </main>
    </div>
  )
}
