// Data-access layer for the Grounding feature.
//
// All reads/writes target the dedicated `flow` Postgres schema
// (flow.grounding_channels, flow.grounding_messages) via `.schema("flow")`.
// RLS scopes channels to members of their project (grounding.* abilities) and
// messages through their parent channel, so no extra filtering is needed here.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toChannelRow / toMessageRow / normalize*) and always
// returns view-model objects the screen can render directly. Author display
// names are stamped into the metadata bag at create time (resolved from
// flow_profiles) so messages stay self-contained; they fall back to "Member".

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { DEFAULT_MESSAGE_TYPE } from "./constants";

const CHANNELS_TABLE = "grounding_channels";
const MESSAGES_TABLE = "grounding_messages";

const FALLBACK_AUTHOR_NAME = "Member";

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys are
// spread onto the view model so the UI treats them like first-class fields.
export function normalizeChannel(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description ?? "",
    isLocked: row.is_locked ?? false,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeMessage(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    channelId: row.channel_id,
    authorId: row.created_by ?? null,
    authorName: metadata.authorName || FALLBACK_AUTHOR_NAME,
    body: row.body,
    messageType: row.message_type || DEFAULT_MESSAGE_TYPE,
    isPinned: row.is_pinned ?? false,
    metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps camelCase channel fields to DB columns. Only keys present in `input`
// are emitted, so one helper serves creates and partial updates ({ isLocked }).
function toChannelRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("isLocked" in input) {
    row.is_locked = Boolean(input.isLocked);
  }

  return row;
}

function toMessageRow(input) {
  const row = {};

  if ("body" in input) {
    row.body = input.body?.trim();
  }
  if ("messageType" in input) {
    row.message_type = input.messageType || DEFAULT_MESSAGE_TYPE;
  }
  if ("isPinned" in input) {
    row.is_pinned = Boolean(input.isPinned);
  }

  return row;
}

// Resolve the signed-in user's display name from flow_profiles, mirroring how
// profiles.js normalizes member names; falls back through email -> "Member".
async function resolveAuthor(supabase, userId) {
  if (!userId) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("flow_profiles")
    .select("display_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[flow.grounding] author lookup error:", error);
    return null;
  }

  const name =
    profile?.display_name ||
    profile?.email?.split("@")[0] ||
    FALLBACK_AUTHOR_NAME;

  // The storage path convention keeps names short — trim long emails down.
  return name ? String(name).slice(0, 40) : FALLBACK_AUTHOR_NAME;
}

export async function listChannels(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(CHANNELS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[flow.grounding] listChannels error:", error);
      return [];
    }

    return (data ?? []).map(normalizeChannel);
  } catch (e) {
    console.error("[flow.grounding] listChannels error:", e);
    return [];
  }
}

export async function createChannel(projectId, input) {
  if (!projectId || !input?.name?.trim()) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[flow.grounding] user lookup error:", userError);
    }

    const payload = {
      ...toChannelRow(input),
      project_id: projectId,
      created_by: user?.id ?? null,
    };

    // Honor a caller-supplied id so optimistic rows and the DB row share a UUID.
    if (input.id) {
      payload.id = input.id;
    }

    const { data, error } = await flowClient()
      .from(CHANNELS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.grounding] createChannel error:", error);
      return null;
    }

    return normalizeChannel(data);
  } catch (e) {
    console.error("[flow.grounding] createChannel error:", e);
    return null;
  }
}

export async function updateChannel(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toChannelRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(CHANNELS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.grounding] updateChannel error:", error);
      return null;
    }

    return normalizeChannel(data);
  } catch (e) {
    console.error("[flow.grounding] updateChannel error:", e);
    return null;
  }
}

export async function softDeleteChannel(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(CHANNELS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.grounding] deleteChannel error:", error);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[flow.grounding] deleteChannel error:", e);
    return false;
  }
}

export async function listMessages(channelId) {
  if (!channelId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(MESSAGES_TABLE)
      .select("*")
      .eq("channel_id", channelId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[flow.grounding] listMessages error:", error);
      return [];
    }

    return (data ?? []).map(normalizeMessage);
  } catch (e) {
    console.error("[flow.grounding] listMessages error:", e);
    return [];
  }
}

export async function createMessage(channelId, input) {
  if (!channelId || !input?.body?.trim()) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[flow.grounding] user lookup error:", userError);
    }

    const authorName = await resolveAuthor(supabase, user?.id);

    const payload = {
      channel_id: channelId,
      body: input.body.trim(),
      message_type: input.messageType || DEFAULT_MESSAGE_TYPE,
      is_pinned: Boolean(input.isPinned),
      metadata: { authorName: authorName || FALLBACK_AUTHOR_NAME },
      created_by: user?.id ?? null,
    };

    // Honor a caller-supplied id so optimistic rows and the DB row share a UUID.
    if (input.id) {
      payload.id = input.id;
    }

    const { data, error } = await flowClient()
      .from(MESSAGES_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.grounding] createMessage error:", error);
      return null;
    }

    return normalizeMessage(data);
  } catch (e) {
    console.error("[flow.grounding] createMessage error:", e);
    return null;
  }
}

export async function updateMessage(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toMessageRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(MESSAGES_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.grounding] updateMessage error:", error);
      return null;
    }

    return normalizeMessage(data);
  } catch (e) {
    console.error("[flow.grounding] updateMessage error:", e);
    return null;
  }
}

export async function softDeleteMessage(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(MESSAGES_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.grounding] deleteMessage error:", error);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[flow.grounding] deleteMessage error:", e);
    return false;
  }
}
