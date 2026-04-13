export function stopEvent(e) {
  e.stopPropagation?.()
}

export function cursorPointer(on) {
  if (typeof document === 'undefined') return
  document.body.style.cursor = on ? 'pointer' : 'default'
}

