/**
 * Cross-platform share utility.
 * Tries Web Share API first (Android Chrome, iOS Safari over HTTPS).
 * Falls back to clipboard, and falls back further to the legacy execCommand
 * for environments where neither works (e.g. PWA over plain HTTP).
 */

async function copyToClipboard(text) {
  // Modern Clipboard API (secure context required)
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to legacy
    }
  }
  // Legacy execCommand fallback — works without secure context
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.left = '0'
    ta.style.opacity = '0'
    ta.style.pointerEvents = 'none'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, ta.value.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export async function shareContent({ title, text, url }) {
  // Try Web Share API first
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return { method: 'native', ok: true }
    } catch (err) {
      // User cancelled the share sheet — silent
      if (err && err.name === 'AbortError') {
        return { method: 'native', ok: false, cancelled: true }
      }
      // Anything else (NotAllowedError, security errors) → fall through to clipboard
    }
  }

  // Clipboard fallback (modern then legacy)
  const toCopy = url || text || title || ''
  const ok = await copyToClipboard(toCopy)
  return { method: ok ? 'clipboard' : 'none', ok }
}
