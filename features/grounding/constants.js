// Shared option/label/meta maps + small formatters for the Grounding feature.
// Message type mirrors the `flow.grounding_messages.message_type` column
// ('message' | 'broadcast'). No row data lives here.

export const MESSAGE_TYPES = [
  { value: "message", label: "Message" },
  { value: "broadcast", label: "Broadcast" },
];

export const DEFAULT_MESSAGE_TYPE = "message";

// StatusPill map (config-only): { [type]: { label, variant } } fed to
// <StatusPill status map /> from the shared screen kit.
export const MESSAGE_TYPE_PILL_MAP = {
  message: { label: "Message", variant: "neutral" },
  broadcast: { label: "Broadcast", variant: "success" },
};

export const MESSAGE_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  ...MESSAGE_TYPES.map((type) => ({ value: type.value, label: type.label })),
];

export const messageTypeLabels = Object.fromEntries(
  MESSAGE_TYPES.map((type) => [type.value, type.label]),
);

// Badge color classes (semantic tokens / tailwind color utilities at /10 bg +
// /20 border, matching the issues severity palette). Broadcasts stand out.
export const messageTypeMeta = {
  message: {
    label: "Message",
    className: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
  },
  broadcast: {
    label: "Broadcast",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
};

// Avatar tone pool cycled deterministically by name so an author keeps the
// same tone across messages without a stored column.
const AVATAR_TONES = ["amber", "emerald", "sky", "violet"];

export const avatarToneClasses = {
  amber: "bg-amber-300 text-amber-950",
  emerald: "bg-emerald-300 text-emerald-950",
  sky: "bg-sky-300 text-sky-950",
  violet: "bg-violet-300 text-violet-950",
};

export function toneForText(text) {
  const seed = String(text || "");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function initialsOf(name) {
  return (
    String(name || "")
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export function formatMessageTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatChannelDescription(channel) {
  if (!channel) {
    return "";
  }
  return channel.description ? String(channel.description) : "No description yet.";
}
