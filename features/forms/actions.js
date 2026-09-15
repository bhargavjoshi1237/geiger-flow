// Data-access layer for the Forms addon (shared by the list screen and the
// builder — no divergence).
//
// Reads/writes target flow.forms + flow.form_questions via the shared
// flowClient helper. RLS scopes every row to the row's project (forms.*
// abilities, open-module model). The DB stores snake_case; the UI works in
// camelCase. Questions are ordered by position.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { logActivity } from "@/features/activity_logs/actions";
import { DEFAULT_FORM_STATUS, DEFAULT_QUESTION_TYPE } from "./constants";

const FORMS_TABLE = "forms";
const QUESTIONS_TABLE = "form_questions";

export function normalizeForm(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title ?? "Untitled form",
    description: row.description ?? "",
    status: row.status ?? DEFAULT_FORM_STATUS,
    confidentiality: row.confidentiality ?? "Confidential",
    settings: row.settings ?? {},
    responses: row.metadata?.responses ?? 0,
    metadata: row.metadata ?? {},
    publishedAt: row.published_at ?? null,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeQuestion(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    formId: row.form_id,
    title: row.title ?? "Untitled question",
    type: row.type ?? DEFAULT_QUESTION_TYPE,
    description: row.description ?? "",
    required: Boolean(row.required),
    options: Array.isArray(row.options) ? row.options : [],
    position: Number(row.position) || 0,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toFormRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim() || "Untitled form";
  }
  if ("description" in input) {
    row.description = input.description?.trim() || "";
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_FORM_STATUS;
  }
  if ("confidentiality" in input) {
    row.confidentiality = input.confidentiality?.trim() || "Confidential";
  }
  if ("settings" in input) {
    row.settings =
      input.settings && typeof input.settings === "object" ? input.settings : {};
  }
  if ("publishedAt" in input) {
    row.published_at = input.publishedAt || null;
  }

  return row;
}

function toQuestionRow(input) {
  const row = {};

  if ("formId" in input) {
    row.form_id = input.formId || null;
  }
  if ("title" in input) {
    row.title = input.title?.trim() || "Untitled question";
  }
  if ("type" in input) {
    row.type = input.type || DEFAULT_QUESTION_TYPE;
  }
  if ("description" in input) {
    row.description = input.description?.trim() || "";
  }
  if ("required" in input) {
    row.required = Boolean(input.required);
  }
  if ("options" in input) {
    row.options = Array.isArray(input.options) ? input.options : [];
  }
  if ("position" in input) {
    row.position = Number(input.position) || 0;
  }

  return row;
}

export async function listForms(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(FORMS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[flow.forms] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeForm);
  } catch (error) {
    console.error("[flow.forms] list error:", error);
    return [];
  }
}

export async function getForm(id) {
  if (!id) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(FORMS_TABLE)
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("[flow.forms] get error:", error);
      return null;
    }

    return normalizeForm(data);
  } catch (error) {
    console.error("[flow.forms] get error:", error);
    return null;
  }
}

export async function createForm(projectId, input) {
  if (!projectId || !input?.title?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toFormRow(input),
    title: input.title.trim(),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(FORMS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.forms] create error:", error);
      return null;
    }

    void logActivity(projectId, {
      source: "forms",
      message: `Created form "${data.title}"`,
      detail: { id: data.id },
    }).catch(() => {});

    return normalizeForm(data);
  } catch (error) {
    console.error("[flow.forms] create error:", error);
    return null;
  }
}

export async function updateForm(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toFormRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(FORMS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.forms] update error:", error);
      return null;
    }

    return normalizeForm(data);
  } catch (error) {
    console.error("[flow.forms] update error:", error);
    return null;
  }
}

export async function softDeleteForm(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(FORMS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.forms] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.forms] delete error:", error);
    return false;
  }
}

export async function listFormQuestions(formId) {
  if (!formId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(QUESTIONS_TABLE)
      .select("*")
      .eq("form_id", formId)
      .is("deleted_at", null)
      .order("position", { ascending: true });

    if (error) {
      console.error("[flow.form_questions] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeQuestion);
  } catch (error) {
    console.error("[flow.form_questions] list error:", error);
    return [];
  }
}

export async function createFormQuestion(projectId, formId, input) {
  if (!projectId || !formId) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toQuestionRow({ ...input, formId }),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  if (input?.id && typeof input.id === "string" && input.id.length >= 32) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(QUESTIONS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.form_questions] create error:", error);
      return null;
    }

    return normalizeQuestion(data);
  } catch (error) {
    console.error("[flow.form_questions] create error:", error);
    return null;
  }
}

export async function updateFormQuestion(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toQuestionRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(QUESTIONS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.form_questions] update error:", error);
      return null;
    }

    return normalizeQuestion(data);
  } catch (error) {
    console.error("[flow.form_questions] update error:", error);
    return null;
  }
}

export async function softDeleteFormQuestion(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(QUESTIONS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.form_questions] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.form_questions] delete error:", error);
    return false;
  }
}

// Replace a form's full question set (builder save): soft-delete removed rows,
// upsert kept rows, insert new rows — all ordered by position.
export async function saveFormQuestions(projectId, formId, questions) {
  if (!projectId || !formId || !Array.isArray(questions)) {
    return null;
  }

  const existing = await listFormQuestions(formId);
  const seen = new Set();
  const saved = [];

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const patch = {
      formId,
      title: question.title?.trim() || `Question ${index + 1}`,
      type: question.type || DEFAULT_QUESTION_TYPE,
      description: question.description?.trim() || "",
      required: Boolean(question.required),
      options: Array.isArray(question.options) ? question.options : [],
      position: index,
    };

    const match =
      question.id && existing.some((row) => row.id === question.id)
        ? question.id
        : null;

    if (match) {
      const updated = await updateFormQuestion(match, patch);
      if (updated) {
        seen.add(updated.id);
        saved.push(updated);
      }
    } else {
      const created = await createFormQuestion(projectId, formId, patch);
      if (created) {
        seen.add(created.id);
        saved.push(created);
      }
    }
  }

  await Promise.all(
    existing
      .filter((row) => !seen.has(row.id))
      .map((row) => softDeleteFormQuestion(row.id)),
  );

  return saved;
}
