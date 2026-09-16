// Migration config for @geiger/orm. This product's tables live in the dedicated
// "flow" Postgres schema of the suite-shared Supabase project, and so does
// its migration ledger (flow.geiger_migrations).
const config = {
  schema: "flow",
  url: process.env.STRING_URI,
};

export default config;
