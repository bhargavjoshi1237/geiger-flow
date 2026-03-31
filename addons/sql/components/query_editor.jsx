"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, RotateCcw, Save, Copy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SAMPLE_QUERIES = [
  "SELECT * FROM users LIMIT 10;",
  "SELECT COUNT(*) AS total FROM projects;",
  "SELECT name, email FROM users WHERE created_at > NOW() - INTERVAL '7 days';",
];

export function SqlQueryEditor({ onExecute }) {
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleExecute = useCallback(() => {
    if (!query.trim()) return;

    setIsRunning(true);

    setTimeout(() => {
      const mockResults = {
        columns: ["id", "name", "email", "created_at"],
        rows: [
          [1, "Alice Johnson", "alice@example.com", "2026-03-15"],
          [2, "Bob Smith", "bob@example.com", "2026-03-16"],
          [3, "Charlie Brown", "charlie@example.com", "2026-03-17"],
        ],
        rowCount: 3,
        executionTime: "12ms",
      };

      onExecute(query, mockResults);
      setIsRunning(false);
    }, 800);
  }, [query, onExecute]);

  const handleClear = () => {
    setQuery("");
  };

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-[#a3a3a3]">
            Query Editor
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2.5 text-xs text-[#737373] hover:text-[#a3a3a3] hover:bg-[#2a2a2a]"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs text-[#737373] hover:text-[#a3a3a3] hover:bg-[#2a2a2a]"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              onClick={handleExecute}
              disabled={!query.trim() || isRunning}
              className="h-7 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
            >
              <Play className="w-3 h-3 mr-1" />
              {isRunning ? "Running..." : "Run"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SELECT * FROM table_name LIMIT 10;"
          className="min-h-[140px] bg-[#111111] border-[#2a2a2a] text-[#e7e7e7] font-mono text-sm resize-y focus-visible:ring-blue-500/30 placeholder:text-[#474747]"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleExecute();
            }
          }}
        />
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[10px] text-[#525252] font-medium uppercase tracking-wider">
            Quick Queries
          </span>
          <div className="flex items-center gap-1.5">
            {SAMPLE_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(sq)}
                className="text-[10px] text-[#737373] bg-[#111111] border border-[#2a2a2a] px-2 py-1 rounded hover:border-[#474747] hover:text-[#a3a3a3] transition-colors"
              >
                Query {i + 1}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
