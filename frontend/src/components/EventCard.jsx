import { useState, useRef, useEffect } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { downloadIcs, googleCalUrl } from '../utils/calendar'
import { shareContent } from '../utils/share'
import styles from './EventCard.module.css'

const SOURCE_LABEL = { ticketmaster: 'Ticketmaster', eventbrite: 'Eventbrite' }
const SOURCE_COLOR = { ticketmaster: '#026CDF', eventbrite: '#F05537' }

function formatDate(date, time) {
  if (!date) return 'Date TBA'
  const d = new Date(`${date}T${time || '00:00'}`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    (time ? ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '')
}

export default function EventCard({ event }) {
  const { isFavorite, toggle } = useFavorites()
  const saved = isFavorite(event.id)
  const [calMenuOpen, setCalMenuOpen] = useState(false)
  const [shareToast, setShareToast] = useState('')
  const calRef = useRef(null)

  const handleStar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(event)
  }

  const handleShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const dateStr = event.start_date
      ? new Date(`${event.start_date}T${event.start_time || '00:00'}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : ''
    const venueStr = event.venue_name ? ` at ${event.venue_name}` : ''
    const res = await shareContent({
      title: event.name || 'Event',
      text: `${event.name}${venueStr}${dateStr ? ' · ' + dateStr : ''}`,
      url: event.url,
    })
    if (res.method === 'clipboard' && res.ok) {
      setShareToast('Link copied!')
      setTimeout(() => setShareToast(''), 1800)
    }
  }

  const handleCalToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCalMenuOpen(v => !v)
  }

  const handleDownload = (e) => {
    e.preventDefault()
    e.stopPropagation()
    downloadIcs(event)
    setCalMenuOpen(false)
  }

  const handleGoogle = (e) => {
    e.stopPropagation()
    const url = googleCalUrl(event)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    setCalMenuOpen(false)
  }

  // Close popover on outside click
  useEffect(() => {
    if (!calMenuOpen) return
    const onClick = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) setCalMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [calMenuOpen])

  return (
    <a href={event.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
      <div className={styles.imgWrap}>
        {event.image
          ? <img src={event.image} alt={event.name} className={styles.img} loading="lazy" />
          : <div className={styles.imgPlaceholder}>🎟️</div>
        }
        <span className={styles.sourceBadge} style={{ background: SOURCE_COLOR[event.source] }}>
          {SOURCE_LABEL[event.source]}
        </span>
        <button
          type="button"
          onClick={handleStar}
          className={`${styles.starBtn} ${saved ? styles.starred : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save event'}
          title={saved ? 'Remove from saved' : 'Save event'}
        >
          {saved ? '★' : '☆'}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className={styles.shareBtn}
          aria-label="Share event"
          title="Share event"
        >
          ↗
        </button>
        {shareToast && <div className={styles.shareToast}>{shareToast}</div>}
      </div>
      <div className={styles.body}>
        {event.category && <span className={styles.category}>{event.category}</span>}
        <h3 className={styles.name}>{event.name}</h3>
        <p className={styles.date}>{formatDate(event.start_date, event.start_time)}</p>
        {event.venue_name && (
          <p className={styles.venue}>📍 {event.venue_name}{event.venue_address ? ` · ${event.venue_address}` : ''}</p>
        )}
        <div className={styles.actions} ref={calRef}>
          <button type="button" className={styles.calBtn} onClick={handleCalToggle}>
            📅 Add to Calendar
          </button>
          {calMenuOpen && (
            <div className={styles.calMenu}>
              <button type="button" className={styles.calOption} onClick={handleDownload}>
                <span>📥</span>
                <span>
                  <strong>Download .ics</strong>
                  <small>Apple, Outlook, default</small>
                </span>
              </button>
              <button type="button" className={styles.calOption} onClick={handleGoogle}>
                <span>🗓️</span>
                <span>
                  <strong>Google Calendar</strong>
                  <small>Opens in new tab</small>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
