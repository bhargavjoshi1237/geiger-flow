import { Database, Table2, Terminal, Play } from "lucide-react";
import { SqlScreen } from "./screens/sql_screen";

export const sqlAddon = {
  id: "sql",
  name: "SQL Explorer",
  description:
    "Browse, query, and manage your project's SQL databases with a built-in query editor, table explorer, and schema viewer.",
  version: "1.0.0",
  category: "Database",
  icon: Database,
  color: "#3b82f6",
  features: [
    "Interactive SQL query editor",
    "Table browser with schema preview",
    "Query history and favorites",
    "Real-time result viewer",
  ],
  navItem: {
    title: "SQL",
    icon: Database,
  },
  screens: [
    {
      id: "SQL",
      component: SqlScreen,
    },
  ],
};
