import styles from './TipCard.module.css'

const CATEGORY_ICONS = {
  general: '💬',
  food: '🍜',
  transport: '🚇',
  safety: '🛡️',
  etiquette: '🤝',
  nightlife: '🌙',
  'hidden gems': '💎',
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function TipCard({ tip }) {
  const icon = CATEGORY_ICONS[tip.category?.toLowerCase()] || '💬'
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.category}>{tip.category}</span>
        <span className={styles.time}>{timeAgo(tip.created_at)}</span>
      </div>
      <p className={styles.content}>{tip.content}</p>
      <p className={styles.author}>— {tip.author_handle}</p>
    </div>
  )
}
