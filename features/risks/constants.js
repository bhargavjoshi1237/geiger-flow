import { Flame } from "lucide-react";

export const RISK_STATUSES = ["open", "mitigating", "watching", "closed"];

export const RISK_STATUS_META = {
  open: {
    label: "Open",
    tone: "red",
    className: "border-red-500/30 bg-red-500/15 text-red-300",
  },
  mitigating: {
    label: "Mitigating",
    tone: "amber",
    className: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  },
  watching: {
    label: "Watching",
    tone: "blue",
    className: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  },
  closed: {
    label: "Closed",
    tone: "emerald",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  },
};

export const RISK_IMPACTS = ["low", "medium", "high"];

// Impact weight feeds the exposure score (probability x weight, 0-300).
export const RISK_IMPACT_WEIGHT = { low: 1, medium: 2, high: 3 };

export const RISK_IMPACT_META = {
  low: { label: "Low", tone: "zinc" },
  medium: { label: "Medium", tone: "amber" },
  high: { label: "High", tone: "red" },
};

export const RISK_FILTER_TABS = ["All", ...RISK_STATUSES.map((status) => RISK_STATUS_META[status].label)];

export function riskExposure(risk) {
  const probability = Number(risk?.probability) || 0;
  const weight = RISK_IMPACT_WEIGHT[risk?.impact] || RISK_IMPACT_WEIGHT.medium;

  return Math.round(probability * weight);
}

export function riskStatusLabel(status) {
  return RISK_STATUS_META[status]?.label || status;
}

export function riskStatusTone(status) {
  return RISK_STATUS_META[status]?.tone || "zinc";
}

export const RISK_MODULE_ICON = Flame;
