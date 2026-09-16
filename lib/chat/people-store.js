"use client";

// Synchronous, in-memory people directory hydrated from the DB so chat
// components can resolve a person by id during render. This replaces the old
// mock getPerson/ME: screens fetch profiles, call hydratePeople()/setMe(), then
// every component reads people from here.

const _people = {};

// The project the viewer is currently in. Set by the chat screen on load so any
// component can tell whether a person belongs to this project or is "external".
let _currentProjectId = null;

// The authoritative roster of the current project: the set of user ids that are
// members of it (flow.project_members, via chat_scope.listProjectMembers). This
// is the source of truth
// for "external", NOT a person's `projectId` — that column only records a
// person's *last-active* project, so a member of this project who is currently active in
// another project would otherwise be mis-flagged as external. `null` = not loaded.
let _projectMemberIds = null;

export function setCurrentProjectId(id) {
  const next = id || null;
  // The roster is per-project; invalidate it when the project changes so we don't judge
  // membership against the previous project's roster during the switch.
  if (next !== _currentProjectId) _projectMemberIds = null;
  _currentProjectId = next;
}

// Record the current project's member ids (from listProjectMembers). Called by the chat
// screen once the roster loads.
export function setProjectMemberIds(ids) {
  _projectMemberIds = new Set((ids || []).filter(Boolean));
}

// True when a person isn't a member of the current project — i.e. an external
// contact. Membership is decided by the project roster (a person can belong to many
// projects); we only fall back to their last-active `projectId` while the
// roster is still loading. Returns false when we don't know the project yet, or for
// "me".
export function isExternalPerson(person) {
  if (!person || !_currentProjectId) return false;
  if (ME.id && person.id === ME.id) return false;
  // Authoritative: are they on the current project's roster?
  if (_projectMemberIds) return !_projectMemberIds.has(person.id);
  // Roster not loaded yet — best-effort fall back to their last-active project.
  return !!person.projectId && person.projectId !== _currentProjectId;
}

// "Me". A mutable object (stable reference) so any module that imported the ME
// binding sees the values fill in after setMe() runs.
export const ME = {
  id: null,
  name: "You",
  firstName: "You",
  role: "",
  color: "#6366f1",
  presence: "online",
};

export function hydratePeople(list = []) {
  for (const p of list) if (p?.id) _people[p.id] = p;
}

// Ensure the given person ids are resolvable by getPerson(). Any id not already
// in the store (and not "me") is fetched by id — NOT project-scoped — so authors /
// members who aren't in the current project's directory still render with a real
// name instead of "Unknown". Returns the freshly hydrated profiles (empty when
// nothing was missing), so the caller can trigger a re-render.
export async function ensurePeople(ids = []) {
  const missing = [...new Set((ids || []).filter((id) => id && id !== ME.id && !_people[id]))];
  if (missing.length === 0) return [];
  // Imported lazily to avoid a static cycle (chat_profiles imports nothing from
  // this store, but keep the dependency one-directional and explicit).
  const { getProfilesByIds } = await import("@/features/grounding/chat_profiles");
  const fetched = await getProfilesByIds(missing);
  hydratePeople(fetched);
  return fetched;
}

export function setMe(profile) {
  if (!profile) return;
  Object.assign(ME, profile);
  if (ME.id) _people[ME.id] = { ...ME };
}

export function getPerson(id) {
  if (id && _people[id]) return _people[id];
  if (id && ME.id === id) return ME;
  return {
    id,
    name: "Unknown",
    firstName: "Unknown",
    role: "",
    color: "#737373",
    presence: "offline",
  };
}

export function allPeople() {
  return Object.values(_people);
}
