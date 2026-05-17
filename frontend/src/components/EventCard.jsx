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
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.imgWrap}>
        {event.image
          ? <img src={event.image} alt={event.name} className={styles.img} loading="lazy" />
          : <div className={styles.imgPlaceholder}>🎟️</div>
        }
        <span
          className={styles.sourceBadge}
          style={{ background: SOURCE_COLOR[event.source] }}
        >
          {SOURCE_LABEL[event.source]}
        </span>
      </div>
      <div className={styles.body}>
        {event.category && <span className={styles.category}>{event.category}</span>}
        <h3 className={styles.name}>{event.name}</h3>
        <p className={styles.date}>{formatDate(event.start_date, event.start_time)}</p>
        {event.venue_name && (
          <p className={styles.venue}>📍 {event.venue_name}{event.venue_address ? ` · ${event.venue_address}` : ''}</p>
        )}
      </div>
    </a>
  )
}
