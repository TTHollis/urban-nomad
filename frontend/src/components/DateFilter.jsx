import { useState } from 'react'
import styles from './DateFilter.module.css'

function fmt(d) {
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function getPresetRange(preset) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (preset === 'today') {
    return { start_date: fmt(today), end_date: fmt(today) }
  }
  if (preset === 'weekend') {
    // Friday → Sunday of the current/upcoming weekend
    const day = today.getDay() // 0 Sun … 6 Sat
    const daysUntilFri = (5 - day + 7) % 7 // 0 if Fri
    const fri = new Date(today)
    fri.setDate(today.getDate() + daysUntilFri)
    const sun = new Date(fri)
    sun.setDate(fri.getDate() + 2)
    return { start_date: fmt(fri), end_date: fmt(sun) }
  }
  if (preset === '7days') {
    const end = new Date(today)
    end.setDate(today.getDate() + 7)
    return { start_date: fmt(today), end_date: fmt(end) }
  }
  if (preset === '30days') {
    const end = new Date(today)
    end.setDate(today.getDate() + 30)
    return { start_date: fmt(today), end_date: fmt(end) }
  }
  return { start_date: undefined, end_date: undefined }
}

const PRESETS = [
  { id: 'any', label: 'Any time' },
  { id: 'today', label: 'Today' },
  { id: 'weekend', label: 'This weekend' },
  { id: '7days', label: 'Next 7 days' },
  { id: '30days', label: 'Next 30 days' },
  { id: 'custom', label: 'Custom…' },
]

export default function DateFilter({ value = {}, onChange, accentColor = 'green' }) {
  const [preset, setPreset] = useState(value.preset || 'any')
  const [customStart, setCustomStart] = useState(value.start_date || '')
  const [customEnd, setCustomEnd] = useState(value.end_date || '')

  const accent = accentColor === 'amber' ? styles.amber : styles.green

  const apply = (id) => {
    setPreset(id)
    if (id === 'custom') return // user picks dates below
    const range = getPresetRange(id)
    onChange({ preset: id, ...range })
  }

  const applyCustom = () => {
    onChange({
      preset: 'custom',
      start_date: customStart || undefined,
      end_date: customEnd || undefined,
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.label}>📅 When:</span>
        <div className={styles.pills}>
          {PRESETS.map(p => (
            <button
              type="button"
              key={p.id}
              className={`${styles.pill} ${preset === p.id ? `${styles.active} ${accent}` : ''}`}
              onClick={() => apply(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {preset === 'custom' && (
        <div className={styles.customRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>From</span>
            <input
              type="date"
              className={styles.dateInput}
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>To</span>
            <input
              type="date"
              className={styles.dateInput}
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              min={customStart || undefined}
            />
          </label>
          <button
            type="button"
            className={`${styles.applyBtn} ${accent}`}
            onClick={applyCustom}
            disabled={!customStart && !customEnd}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
