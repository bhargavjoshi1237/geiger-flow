import { createClient } from "./client";

let _cached = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000;

function parseSession(session) {
  if (!session?.user) return null;

  const meta = session.user.user_metadata ?? {};
  const email = session.user.email ?? "";

  return {
    id: session.user.id,
    name:
      meta.full_name ||
      meta.name ||
      email.split("@")[0] ||
      "User",
    email,
    avatar: meta.avatar_url || null,
  };
}

// The signed-in user as { id, name, email, avatar }, or null when there is no
// session. Read from the stored session rather than the Auth server, and cached for
// CACHE_TTL; call invalidateUserCache() when the session changes, e.g. on sign-out.
export async function getUser() {
  const now = Date.now();
  if (_cached && now - _cacheTimestamp < CACHE_TTL) {
    return _cached;
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = parseSession(session);

  _cached = user;
  _cacheTimestamp = now;

  return user;
}

export function getUserCached() {
  return _cached;
}

export function invalidateUserCache() {
  _cached = null;
  _cacheTimestamp = 0;
}
