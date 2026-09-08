export const DECISION_STATUSES = ["proposed", "accepted", "revisit", "superseded"];

export const DECISION_STATUS_META = {
  proposed: {
    label: "Proposed",
    tone: "blue",
    className: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  },
  accepted: {
    label: "Accepted",
    tone: "emerald",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  },
  revisit: {
    label: "Revisit",
    tone: "amber",
    className: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  },
  superseded: {
    label: "Superseded",
    tone: "zinc",
    className: "border-zinc-500/30 bg-zinc-500/15 text-foreground",
  },
};

export const DECISION_REVERSIBILITY_META = {
  reversible: { label: "Reversible", tone: "zinc" },
  one_way: { label: "One way", tone: "violet" },
};

export const DECISION_FILTER_TABS = [
  "All",
  ...DECISION_STATUSES.map((status) => DECISION_STATUS_META[status].label),
];

export function decisionStatusLabel(status) {
  return DECISION_STATUS_META[status]?.label || status;
}

export function decisionStatusTone(status) {
  return DECISION_STATUS_META[status]?.tone || "zinc";
}
