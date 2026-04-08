import { Database, Table2, Terminal } from "lucide-react";
import { SqlEditorScreen } from "./screens/sql_editor_screen";
import { TableEditorScreen } from "./screens/table_editor_screen";

export const sqlAddon = {
  id: "sql",
  name: "SQL Explorer",
  description:
    "Browse, query, and manage your project's SQL databases with a built-in query editor and table explorer.",
  version: "1.0.0",
  category: "Database",
  icon: Database,
  color: "#3b82f6",
  features: [
    "Interactive SQL query editor with syntax highlighting",
    "Table browser with schema preview and row counts",
    "Query history and favorites",
    "Real-time result viewer",
  ],
  navItem: {
    title: "SQL",
    icon: Database,
    subItems: [
      { title: "SQL Editor", icon: Terminal },
      { title: "Table Editor", icon: Table2 },
    ],
  },
  screens: [
    {
      id: "SQL",
      navLabel: "SQL Editor",
      component: SqlEditorScreen,
    },
    {
      id: "Table Editor",
      navLabel: "Table Editor",
      component: TableEditorScreen,
    },
  ],
};
