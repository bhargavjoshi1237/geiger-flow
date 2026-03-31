"use client";

import React, { useState } from "react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { SqlQueryEditor } from "../components/query_editor";
import { SqlTableBrowser } from "../components/table_browser";
import { SqlResultsViewer } from "../components/results_viewer";
import { SqlSchemaView } from "../components/schema_view";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Terminal, Table2, Eye, History } from "lucide-react";

export function SqlScreen() {
  const [activeView, setActiveView] = useState("query");
  const [queryResults, setQueryResults] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  const handleQueryExecute = (query, results) => {
    setQueryResults(results);
    setQueryHistory((prev) => [
      { query, timestamp: new Date().toISOString(), id: Date.now() },
      ...prev.slice(0, 49),
    ]);
  };

  return (
    <MainScreenWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            SQL Explorer
          </h1>
          <p className="text-[#a3a3a3] text-sm">
            Query, browse, and manage your project databases.
          </p>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] p-1 h-auto">
            <TabsTrigger
              value="query"
              className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-[#a3a3a3] text-xs gap-1.5 px-3 py-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              Query Editor
            </TabsTrigger>
            <TabsTrigger
              value="tables"
              className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-[#a3a3a3] text-xs gap-1.5 px-3 py-1.5"
            >
              <Table2 className="w-3.5 h-3.5" />
              Tables
            </TabsTrigger>
            <TabsTrigger
              value="schema"
              className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-[#a3a3a3] text-xs gap-1.5 px-3 py-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Schema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="mt-4 space-y-4">
            <SqlQueryEditor onExecute={handleQueryExecute} />
            {queryResults && <SqlResultsViewer results={queryResults} />}
          </TabsContent>

          <TabsContent value="tables" className="mt-4">
            <SqlTableBrowser />
          </TabsContent>

          <TabsContent value="schema" className="mt-4">
            <SqlSchemaView />
          </TabsContent>
        </Tabs>
      </div>
    </MainScreenWrapper>
  );
}
