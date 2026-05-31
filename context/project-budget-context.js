"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ProjectBudgetContext = createContext(null);

const DEFAULT_MONTHLY_BUDGET = 42000;

const initialManualExpenses = [
  {
    id: "manual-product-tools",
    name: "Product and collaboration tools",
    category: "Software",
    owner: "Product Ops",
    monthlyCost: 2400,
    forecastMultiplier: 1,
    status: "On Track",
    source: "Manual",
    notes: "Planning, design, docs, and team collaboration seats.",
  },
  {
    id: "manual-security-review",
    name: "Security review reserve",
    category: "Security",
    owner: "Security",
    monthlyCost: 5200,
    forecastMultiplier: 1.1,
    status: "Watch",
    source: "Manual",
    notes: "External review, tooling, and compliance evidence reserve.",
  },
  {
    id: "manual-qa-lab",
    name: "QA device and test lab",
    category: "Quality",
    owner: "QA",
    monthlyCost: 3800,
    forecastMultiplier: 1.15,
    status: "Watch",
    source: "Manual",
    notes: "Browsers, devices, load test capacity, and test data refreshes.",
  },
];

const initialArchitectureExpenses = [
  { id: "customer", name: "Customer", category: "Business", monthlyCost: 0, source: "System Architecture", enabled: false },
  { id: "cdn", name: "CDN", category: "Infrastructure", monthlyCost: 420, source: "System Architecture", enabled: true },
  { id: "web-app", name: "Web App", category: "Frontend", monthlyCost: 650, source: "System Architecture", enabled: true },
  { id: "api-gateway", name: "API Gateway", category: "Backend", monthlyCost: 950, source: "System Architecture", enabled: true },
  { id: "auth-service", name: "Auth Service", category: "Security", monthlyCost: 700, source: "System Architecture", enabled: true },
  { id: "microservice", name: "Orders Service", category: "Backend", monthlyCost: 1600, source: "System Architecture", enabled: true },
  { id: "worker", name: "Worker", category: "Backend", monthlyCost: 900, source: "System Architecture", enabled: true },
  { id: "database", name: "Primary DB", category: "Data", monthlyCost: 2200, source: "System Architecture", enabled: true },
  { id: "cache", name: "Cache", category: "Data", monthlyCost: 760, source: "System Architecture", enabled: true },
  { id: "message-queue", name: "Message Queue", category: "Messaging", monthlyCost: 540, source: "System Architecture", enabled: true },
  { id: "logging", name: "Logging", category: "Observability", monthlyCost: 880, source: "System Architecture", enabled: true },
  { id: "metrics", name: "Metrics", category: "Observability", monthlyCost: 620, source: "System Architecture", enabled: true },
];

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

export function ProjectBudgetProvider({ children }) {
  const [monthlyBudget, setMonthlyBudgetState] = useState(DEFAULT_MONTHLY_BUDGET);
  const [manualExpenses, setManualExpenses] = useState(initialManualExpenses.map(normalizeExpense));
  const [architectureExpenses, setArchitectureExpenses] = useState(initialArchitectureExpenses.map(normalizeExpense));

  const setMonthlyBudget = useCallback((value) => {
    setMonthlyBudgetState(Math.max(0, Number(value) || 0));
  }, []);

  const upsertManualExpense = useCallback((expense) => {
    const normalized = normalizeExpense({
      ...expense,
      id: expense.id || `manual-${Date.now()}`,
      source: "Manual",
    });

    setManualExpenses((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      if (exists) {
        return current.map((item) => (item.id === normalized.id ? normalized : item));
      }
      return [normalized, ...current];
    });
  }, []);

  const removeManualExpense = useCallback((expenseId) => {
    setManualExpenses((current) => current.filter((item) => item.id !== expenseId));
  }, []);

  const upsertArchitectureExpense = useCallback((expense) => {
    const normalized = normalizeExpense({
      ...expense,
      source: "System Architecture",
    });

    setArchitectureExpenses((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      if (exists) {
        return current.map((item) => (item.id === normalized.id ? { ...item, ...normalized } : item));
      }
      return [normalized, ...current];
    });
  }, []);

  const syncArchitectureExpenses = useCallback((expenses) => {
    setArchitectureExpenses(expenses.map((expense) => normalizeExpense({ ...expense, source: "System Architecture" })));
  }, []);

  const updateArchitectureExpense = useCallback((expenseId, updates) => {
    setArchitectureExpenses((current) =>
      current.map((item) => (item.id === expenseId ? normalizeExpense({ ...item, ...updates }) : item)),
    );
  }, []);

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
