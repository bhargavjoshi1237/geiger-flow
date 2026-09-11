// Demo mode.
//
// While this flag is on, createClient() (lib/supabase/client.js) hands back the
// fixture-backed demo client instead of a real Supabase client, so the landing
// playground can run the real workspace screens with no session and no network.
//
// The flag lives at module scope because the interception happens in a plain
// module, not a React tree. The playground sets it before its subtree renders,
// so no child's mount effect can race it — a screen that fetched a tick early
// would render an empty state and never recover.

let demoMode = false;
let writeHandler = null;

export function isDemoMode() {
  return demoMode;
}

export function setDemoMode(next) {
  demoMode = Boolean(next);
}

// The playground registers here, so a rejected write surfaces as one uniform
// "read-only demo" message instead of looking like a bug in the screen.
export function setDemoWriteHandler(handler) {
  writeHandler = handler;
}

export function notifyDemoWrite() {
  if (writeHandler) writeHandler();
}

// A query shape the demo client doesn't implement is a gap in the fixtures, not
// an empty result — say so loudly rather than quietly rendering a blank screen.
export function warnDemoGap(where, detail) {
  console.error(`[demo] unsupported query — ${where}`, detail);
}
