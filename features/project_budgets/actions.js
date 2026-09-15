// Data-access layer for the Project Budgets feature.
//
// Reads/writes target flow.project_budgets (one row per project) via the
// shared flowClient helper. The DB stores snake_case columns; the UI works in
// camelCase, so this module adapts between the two (toRow /
// normalizeProjectBudget). Pure data access: validate,
// console.error("[flow.project_budgets]") on failure, return null/false —
// never throw, never toast.

import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_ARCHITECTURE_EXPENSES,
  DEFAULT_MANUAL_EXPENSES,
  DEFAULT_MONTHLY_BUDGET,
} from "./constants";

const BUDGETS_TABLE = "project_budgets";

// DB row (snake_case) -> UI view model (camelCase).
export function normalizeProjectBudget(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    monthlyBudget: Number(row.monthly_budget ?? DEFAULT_MONTHLY_BUDGET),
    manualExpenses: Array.isArray(row.manual_expenses) ? row.manual_expenses : [],
    architectureExpenses: Array.isArray(row.architecture_expenses)
      ? row.architecture_expenses
      : [],
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function defaultProjectBudget(projectId) {
  return {
    id: null,
    projectId,
    monthlyBudget: DEFAULT_MONTHLY_BUDGET,
    manualExpenses: DEFAULT_MANUAL_EXPENSES.map((expense) => ({ ...expense })),
    architectureExpenses: DEFAULT_ARCHITECTURE_EXPENSES.map((expense) => ({ ...expense })),
    metadata: {},
    createdAt: null,
    updatedAt: null,
  };
}

// UI input (camelCase) -> DB columns (snake_case). Only keys present in
// `input` are emitted.
function toRow(input) {
  const row = {};

  if ("monthlyBudget" in input) {
    row.monthly_budget = Math.max(0, Number(input.monthlyBudget) || 0);
  }
  if ("manualExpenses" in input) {
    row.manual_expenses = Array.isArray(input.manualExpenses) ? input.manualExpenses : [];
  }
  if ("architectureExpenses" in input) {
    row.architecture_expenses = Array.isArray(input.architectureExpenses)
      ? input.architectureExpenses
      : [];
  }

  return row;
}

// The project's budget row, or null when absent/unreadable. Callers fall back
// to defaultProjectBudget(projectId) for rendering.
export async function getProjectBudget(projectId) {
  if (!projectId) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(BUDGETS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("[flow.project_budgets] get error:", error);
      return null;
    }

    return normalizeProjectBudget(data);
  } catch (error) {
    console.error("[flow.project_budgets] get error:", error);
    return null;
  }
}

// Create-or-update the project's single budget row.
export async function saveProjectBudget(projectId, patch) {
  if (!projectId || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(BUDGETS_TABLE)
      .upsert({ project_id: projectId, ...row }, { onConflict: "project_id" })
      .select()
      .single();

    if (error) {
      console.error("[flow.project_budgets] save error:", error);
      return null;
    }

    return normalizeProjectBudget(data);
  } catch (error) {
    console.error("[flow.project_budgets] save error:", error);
    return null;
  }
}
