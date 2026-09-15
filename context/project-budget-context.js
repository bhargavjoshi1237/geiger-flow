"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ProjectContext } from "@/context/project-context";
import {
  DEFAULT_ARCHITECTURE_EXPENSES,
  DEFAULT_MANUAL_EXPENSES,
  DEFAULT_MONTHLY_BUDGET,
} from "@/features/project_budgets/constants";
import {
  defaultProjectBudget,
  getProjectBudget,
  saveProjectBudget,
} from "@/features/project_budgets/actions";

const ProjectBudgetContext = createContext(null);

function normalizeExpense(expense) {
  return {
    id: expense.id,
    name: expense.name || "Untitled expense",
    category: expense.category || "General",
    owner: expense.owner || "Unassigned",
    monthlyCost: Number(expense.monthlyCost) || 0,
    forecastMultiplier: Number(expense.forecastMultiplier) || 1,
    status: expense.status || "On Track",
    source: expense.source || "Manual",
    notes: expense.notes || "",
    enabled: expense.enabled !== false,
  };
}

// Project-scoped budget state, persisted per project in flow.project_budgets.
//
// Mutations stay synchronous and optimistic (local state updates immediately)
// while the write goes out fire-and-forget; a failed write only logs, so
// high-frequency edits (sliders) never spam toasts. Without a project (or
// when the row can't load, e.g. the landing playground's fixture project),
// the provider degrades to local-only state seeded from the feature defaults.
export function ProjectBudgetProvider({ children }) {
  const projectContext = useContext(ProjectContext) ?? null;
  const projectId = projectContext?.project?.id ?? null;

  const [monthlyBudget, setMonthlyBudgetState] = useState(DEFAULT_MONTHLY_BUDGET);
  const [manualExpenses, setManualExpenses] = useState(() =>
    DEFAULT_MANUAL_EXPENSES.map(normalizeExpense),
  );
  const [architectureExpenses, setArchitectureExpenses] = useState(() =>
    DEFAULT_ARCHITECTURE_EXPENSES.map(normalizeExpense),
  );
  const hydratedRef = useRef(null);

  useEffect(() => {
    if (!projectId || hydratedRef.current === projectId) {
      return;
    }
    hydratedRef.current = projectId;
    getProjectBudget(projectId).then((row) => {
      const resolved = row ?? defaultProjectBudget(projectId);
      setMonthlyBudgetState(resolved.monthlyBudget);
      setManualExpenses(
        (resolved.manualExpenses.length > 0
          ? resolved.manualExpenses
          : defaultProjectBudget(projectId).manualExpenses
        ).map(normalizeExpense),
      );
      setArchitectureExpenses(
        (resolved.architectureExpenses.length > 0
          ? resolved.architectureExpenses
          : defaultProjectBudget(projectId).architectureExpenses
        ).map(normalizeExpense),
      );
    });
  }, [projectId]);

  const persist = useCallback(
    (patch) => {
      if (!projectId || hydratedRef.current !== projectId) {
        return;
      }
      void saveProjectBudget(projectId, patch);
    },
    [projectId],
  );

  const setMonthlyBudget = useCallback(
    (value) => {
      const next = Math.max(0, Number(value) || 0);
      setMonthlyBudgetState(next);
      persist({ monthlyBudget: next });
    },
    [persist],
  );

  const upsertManualExpense = useCallback(
    (expense) => {
      const normalized = normalizeExpense({
        ...expense,
        id: expense.id || `manual-${Date.now()}`,
        source: "Manual",
      });

      setManualExpenses((current) => {
        const exists = current.some((item) => item.id === normalized.id);
        const next = exists
          ? current.map((item) => (item.id === normalized.id ? normalized : item))
          : [normalized, ...current];
        persist({ manualExpenses: next });
        return next;
      });
    },
    [persist],
  );

  const removeManualExpense = useCallback(
    (expenseId) => {
      setManualExpenses((current) => {
        const next = current.filter((item) => item.id !== expenseId);
        persist({ manualExpenses: next });
        return next;
      });
    },
    [persist],
  );

  const upsertArchitectureExpense = useCallback(
    (expense) => {
      const normalized = normalizeExpense({
        ...expense,
        source: "System Architecture",
      });

      setArchitectureExpenses((current) => {
        const exists = current.some((item) => item.id === normalized.id);
        const next = exists
          ? current.map((item) => (item.id === normalized.id ? { ...item, ...normalized } : item))
          : [normalized, ...current];
        persist({ architectureExpenses: next });
        return next;
      });
    },
    [persist],
  );

  const syncArchitectureExpenses = useCallback(
    (expenses) => {
      const next = expenses.map((expense) => normalizeExpense({ ...expense, source: "System Architecture" }));
      setArchitectureExpenses(next);
      persist({ architectureExpenses: next });
    },
    [persist],
  );

  const updateArchitectureExpense = useCallback(
    (expenseId, updates) => {
      setArchitectureExpenses((current) => {
        const next = current.map((item) =>
          item.id === expenseId ? normalizeExpense({ ...item, ...updates }) : item,
        );
        persist({ architectureExpenses: next });
        return next;
      });
    },
    [persist],
  );

  const expenses = useMemo(
    () => [...architectureExpenses.filter((item) => item.enabled), ...manualExpenses.filter((item) => item.enabled)],
    [architectureExpenses, manualExpenses],
  );

  const totals = useMemo(() => {
    const actual = expenses.reduce((sum, item) => sum + item.monthlyCost, 0);
    const forecast = expenses.reduce((sum, item) => sum + item.monthlyCost * item.forecastMultiplier, 0);
    const infrastructure = architectureExpenses
      .filter((item) => item.enabled)
      .reduce((sum, item) => sum + item.monthlyCost, 0);
    const variance = forecast - monthlyBudget;
    const usedPercent = monthlyBudget > 0 ? Math.round((actual / monthlyBudget) * 100) : 0;
    const forecastPercent = monthlyBudget > 0 ? Math.round((forecast / monthlyBudget) * 100) : 0;

    return {
      actual,
      forecast,
      infrastructure,
      variance,
      remaining: monthlyBudget - actual,
      usedPercent,
      forecastPercent,
      annualRunRate: actual * 12,
      watchItems: expenses.filter((item) => item.status === "Watch" || item.status === "Over").length,
    };
  }, [architectureExpenses, expenses, monthlyBudget]);

  const value = useMemo(
    () => ({
      monthlyBudget,
      setMonthlyBudget,
      manualExpenses,
      architectureExpenses,
      expenses,
      totals,
      upsertManualExpense,
      removeManualExpense,
      upsertArchitectureExpense,
      syncArchitectureExpenses,
      updateArchitectureExpense,
    }),
    [
      architectureExpenses,
      expenses,
      manualExpenses,
      monthlyBudget,
      removeManualExpense,
      setMonthlyBudget,
      syncArchitectureExpenses,
      totals,
      updateArchitectureExpense,
      upsertArchitectureExpense,
      upsertManualExpense,
    ],
  );

  return <ProjectBudgetContext.Provider value={value}>{children}</ProjectBudgetContext.Provider>;
}

export function useProjectBudget() {
  const context = useContext(ProjectBudgetContext);
  if (!context) {
    throw new Error("useProjectBudget must be used within ProjectBudgetProvider");
  }
  return context;
}
