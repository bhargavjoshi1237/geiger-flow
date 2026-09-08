export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function formatDateLabel(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Monday-based week key, e.g. "2026-W35" style bucket label per entry date.
export function weekStartOf(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);

  return date.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekStart) {
  if (!weekStart) {
    return "Unknown week";
  }

  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const sameMonth = start.getMonth() === end.getMonth();
  const formatOptions = { month: "short", day: "numeric" };
  const startLabel = start.toLocaleDateString("en-US", formatOptions);
  const endLabel = end.toLocaleDateString("en-US", {
    ...formatOptions,
    ...(sameMonth ? {} : {}),
  });

  return `${startLabel} – ${endLabel}`;
}
