"use client";

// Desktop notifications for incoming chat messages.
//
// Thin wrapper over the Notification API that keeps the preference, the
// permission and the actual display in one place. Every function is safe to
// call during SSR or in a browser that has no Notification support — they
// degrade to "off" rather than throwing.

const PREF_KEY = "geiger-flow-chat-notifications";

export function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function permission() {
  if (!isSupported()) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

// The user's own preference, independent of the browser permission. Defaults to
// on, so granting permission is the only step needed to start receiving them.
export function isEnabled() {
  if (!isSupported()) return false;
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setEnabled(enabled) {
  try {
    window.localStorage.setItem(PREF_KEY, enabled ? "on" : "off");
  } catch {
    /* ignore */
  }
  emit();
}

// --- external store -------------------------------------------------------
// Permission and preference live in the browser, not in React, so components
// read them through useSyncExternalStore rather than copying them into state in
// an effect. The snapshot is cached so its identity only changes when the
// underlying values do — otherwise the store would re-render forever.

const listeners = new Set();
let snapshot = { supported: false, permission: "unsupported", enabled: false };

function computeSnapshot() {
  return {
    supported: isSupported(),
    permission: permission(),
    enabled: isEnabled(),
  };
}

function emit() {
  const next = computeSnapshot();
  if (
    next.supported === snapshot.supported &&
    next.permission === snapshot.permission &&
    next.enabled === snapshot.enabled
  ) {
    return;
  }
  snapshot = next;
  for (const l of listeners) l();
}

export function subscribe(listener) {
  if (listeners.size === 0) snapshot = computeSnapshot();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  // Recompute lazily so a permission granted through the browser's own UI is
  // picked up the next time React reads the store.
  const next = computeSnapshot();
  if (
    next.supported !== snapshot.supported ||
    next.permission !== snapshot.permission ||
    next.enabled !== snapshot.enabled
  ) {
    snapshot = next;
  }
  return snapshot;
}

// Stable server/first-render value: notifications are a browser-only concern.
const SERVER_SNAPSHOT = { supported: false, permission: "unsupported", enabled: false };
export function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

// Ask the browser for permission. Must be called from a user gesture in most
// browsers. Returns the resulting permission string.
export async function requestPermission() {
  if (!isSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    const result = await Notification.requestPermission();
    emit();
    return result;
  } catch {
    return Notification.permission;
  }
}

// Raise a notification. `tag` collapses repeats from the same conversation so a
// busy channel doesn't stack up a wall of them. onClick refocuses this tab.
export function notify({ title, body, tag, onClick }) {
  if (!isSupported() || !isEnabled()) return null;
  if (Notification.permission !== "granted") return null;
  try {
    const n = new Notification(title, {
      body,
      tag,
      renotify: Boolean(tag),
      icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo1.svg`,
      silent: false,
    });
    n.onclick = () => {
      try {
        window.focus();
      } catch {
        /* ignore */
      }
      onClick?.();
      n.close();
    };
    return n;
  } catch {
    return null;
  }
}
