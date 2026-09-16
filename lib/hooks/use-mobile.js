import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// Subscribe/getSnapshot pair for useSyncExternalStore. Reading the match at
// snapshot time (rather than seeding it from an effect) keeps the first render
// correct and avoids the extra commit a setState-in-effect would cost.
function subscribe(onChange) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

// The server has no viewport; render the desktop layout and let hydration
// correct it, which is what the previous `undefined` initial state did too.
function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
