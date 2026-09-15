// Shared defaults for the Project Budgets feature.
// Mirrors the `flow.project_budgets` columns. No row data here.

export const DEFAULT_MONTHLY_BUDGET = 42000;

export const DEFAULT_MANUAL_EXPENSES = Object.freeze([
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
]);

export const DEFAULT_ARCHITECTURE_EXPENSES = Object.freeze([
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
]);
