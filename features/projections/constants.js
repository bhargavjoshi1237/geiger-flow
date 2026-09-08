// Shared option/label/meta maps for the Projections feature.
// Kind & visibility mirror the `flow.projections` columns. Kind is a free-form
// label (milestone / release / review / deadline) — the values here match the
// Calendar's EVENT_COLORS palette so chips color themselves automatically.

export const PROJECTION_KINDS = [
  { value: "milestone", label: "Milestone" },
  { value: "release", label: "Release" },
  { value: "review", label: "Review" },
  { value: "deadline", label: "Deadline" },
];

export const DEFAULT_PROJECTION_KIND = "milestone";

export const PROJECTION_VISIBILITIES = [
  { value: "public", label: "Public" },
  { value: "shared", label: "Shared" },
];

export const DEFAULT_PROJECTION_VISIBILITY = "public";

export const kindLabels = Object.fromEntries(
  PROJECTION_KINDS.map((kind) => [kind.value, kind.label]),
);

export const kindMeta = {
  milestone: {
    label: "Milestone",
    className: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  },
  release: {
    label: "Release",
    className: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  },
  review: {
    label: "Review",
    className: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
  deadline: {
    label: "Deadline",
    className: "bg-red-500/10 text-red-300 border-red-500/20",
  },
};

export const visibilityMeta = {
  public: {
    label: "Public",
    className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  shared: {
    label: "Shared",
    className: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatProjectionDate(value) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "-";
}

// "Aug 5, 2026 – Aug 9, 2026", collapsing to a single date when both ends
// fall on the same day (and to "-" when there is no valid start).
export function formatProjectionRange(startsOn, endsOn) {
  const start = parseDate(startsOn);
  const end = parseDate(endsOn);

  if (!start) return "-";
  if (!end || start.getTime() === end.getTime()) return dateFormatter.format(start);
  if (start.getFullYear() === end.getFullYear()) {
    return `${shortDateFormatter.format(start)} – ${dateFormatter.format(end)}`;
  }
  return `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`;
}

// Local-time YYYY-MM-DD key for a Date (or today when omitted). Used to
// prefill the dialog from a calendar day click and default new starts_on.
export function toDayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
