// Data-access layer for the Time tracking feature.
//
// Reads/writes target flow.time_entries via the shared flowClient helper. RLS
// scopes every row to members of the entry's project (open-module model). An
// entry optionally links to a flow task; deleting a task nulls the link (set
// null FK). The DB stores snake_case columns; the UI works in camelCase.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { logActivity } from "@/features/activity_logs/actions";
import { formatUpdateMessage } from "@/features/activity_logs/constants";

const TIME_ENTRIES_TABLE = "time_entries";

// Readable labels for the activity-log change summary.
const TIME_ENTRY_FIELD_LABELS = {
  title: "title",
  owner: "owner",
  workedOn: "worked on",
  minutes: "minutes",
  billable: "billable",
  notes: "notes",
  taskId: "task",
};

const TIME_ENTRY_VALUE_LABELS = {
  billable: (value) => (value ? "billable" : "non-billable"),
};

export function normalizeTimeEntry(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    taskId: row.task_id,
    title: row.title,
    owner: row.owner ?? "",
    workedOn: row.worked_on,
    minutes: Number(row.minutes) || 0,
    billable: row.billable ?? true,
    notes: row.notes ?? "",
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("owner" in input) {
    row.owner = input.owner?.trim() || null;
  }
  if ("workedOn" in input) {
    row.worked_on = input.workedOn || null;
  }
  if ("minutes" in input) {
    const value = Number(input.minutes);
    row.minutes = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  }
  if ("billable" in input) {
    row.billable = Boolean(input.billable);
  }
  if ("notes" in input) {
    row.notes = input.notes?.trim() || null;
  }
  if ("taskId" in input) {
    row.task_id = input.taskId || null;
  }

  return row;
}

export async function listTimeEntries(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(TIME_ENTRIES_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("worked_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.time_entries] list error:", error);
      return null;
    }

    return (data ?? []).map(normalizeTimeEntry);
  } catch (error) {
    console.error("[flow.time_entries] list error:", error);
    return null;
  }
}

export async function createTimeEntry(projectId, input) {
  if (!projectId || !input?.title?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toRow({
      title: input.title,
      owner: input.owner ?? "",
      workedOn: input.workedOn,
      minutes: input.minutes,
      billable: input.billable,
      notes: input.notes ?? "",
      taskId: input.taskId,
    }),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  try {
    const { data, error } = await flowClient()
      .from(TIME_ENTRIES_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.time_entries] create error:", error);
      return null;
    }

    void logActivity(projectId, {
      source: "time",
      message: `Logged ${data.minutes}m on "${data.title}"`,
      detail: { id: data.id, workedOn: data.worked_on, billable: data.billable },
    }).catch(() => {});

    return normalizeTimeEntry(data);
  } catch (error) {
    console.error("[flow.time_entries] create error:", error);
    return null;
  }
}

export async function updateTimeEntry(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(TIME_ENTRIES_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.time_entries] update error:", error);
      return null;
    }

    void logActivity(data.project_id, {
      source: "time",
      message: formatUpdateMessage({
        entity: "time entry",
        title: data.title,
        patch,
        fields: TIME_ENTRY_FIELD_LABELS,
        values: TIME_ENTRY_VALUE_LABELS,
      }),
      detail: { id, patch },
    }).catch(() => {});

    return normalizeTimeEntry(data);
  } catch (error) {
    console.error("[flow.time_entries] update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteTimeEntry(id) {
  if (!id) {
    return false;
  }

  try {
    const { data, error } = await flowClient()
      .from(TIME_ENTRIES_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select("project_id, title")
      .maybeSingle();

    if (error) {
      console.error("[flow.time_entries] delete error:", error);
      return false;
    }

    if (data?.project_id) {
      void logActivity(data.project_id, {
        source: "time",
        level: "warning",
        message: `Deleted time entry "${data.title}"`,
        detail: { id },
      }).catch(() => {});
    }

    return true;
  } catch (error) {
    console.error("[flow.time_entries] delete error:", error);
    return false;
  }
}
