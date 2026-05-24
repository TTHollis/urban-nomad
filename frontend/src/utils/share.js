/**
 * Cross-platform share utility.
 * Uses the Web Share API where available (Android Chrome, iOS Safari, etc.) —
 * which pops up the native share sheet so users can pick any installed app.
 * Falls back to clipboard copy on desktop browsers without share API.
 */

export async function shareContent({ title, text, url }) {
  // Native share — Android, iOS, modern desktop
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return { method: 'native', ok: true }
    } catch (err) {
      // User cancelled — silent
      if (err.name === 'AbortError') return { method: 'native', ok: false, cancelled: true }
      // Fall through to clipboard
    }
  }

  // Clipboard fallback
  const toCopy = url || text || title
  try {
    await navigator.clipboard.writeText(toCopy)
    return { method: 'clipboard', ok: true }
  } catch {
    return { method: 'none', ok: false }
  }
}
