"use client";

import React, { useState, useCallback, useRef } from "react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Play,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  Database,
  ChevronLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SAMPLE_QUERIES = [
  "SELECT * FROM users LIMIT 10;",
  "SELECT count(*) AS total FROM users;",
  "SELECT * FROM projects ORDER BY created_at DESC LIMIT 5;",
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';",
];

function QueryHistoryItem({ query, timestamp, result, onClick }) {
  const isSuccess = result?.status === "success";
  const isError = result?.status === "error";

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#2a2a2a] transition-colors group cursor-pointer"
    >
      <div className="flex items-start gap-2">
        {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />}
        {isError && <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />}
        {!isSuccess && !isError && <Database className="w-3.5 h-3.5 text-[#737373] mt-0.5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#e5e5e5] font-mono truncate leading-relaxed">
            {query}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#525252]">
              {timestamp}
            </span>
            {isSuccess && result?.rowCount !== undefined && (
              <span className="text-[10px] text-[#525252]">{result.rowCount} rows</span>
            )}
            {isSuccess && result?.duration && (
              <span className="text-[10px] text-[#525252]">{result.duration}ms</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function SqlEditorScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const textareaRef = useRef(null);

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const executeQuery = useCallback(async (sqlQuery) => {
    const trimmed = (sqlQuery || query).trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResults(null);
    const startTime = performance.now();

    try {
      const supabase = createClient();
      let data, supabaseError;
      try {
        const res = await supabase.rpc("execute_sql", { query_string: trimmed });
        data = res.data;
        supabaseError = res.error;
      } catch (e) {
        supabaseError = { message: e.message || 'Failed to execute query' };
      }

      const duration = Math.round(performance.now() - startTime);

      if (supabaseError) {
        const errResult = { status: "error", message: supabaseError.message };
        setError(supabaseError.message);
        setResults(null);
        setHistory((prev) => [
          { query: trimmed, timestamp: formatTimestamp(), result: errResult },
          ...prev.slice(0, 49),
        ]);
        setActiveTab("messages");
        return;
      }

      const rows = Array.isArray(data) ? data : data?.rows || [];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : data?.columns || [];

      const successResult = {
        status: "success",
        columns,
        rows,
        rowCount: rows.length,
        duration,
      };

      setResults(successResult);
      setHistory((prev) => [
        { query: trimmed, timestamp: formatTimestamp(), result: successResult },
        ...prev.slice(0, 49),
      ]);
      setActiveTab("results");
    } catch (err) {
      const errResult = { status: "error", message: err.message };
      setError(err.message);
      setResults(null);
      setHistory((prev) => [
        { query: trimmed, timestamp: formatTimestamp(), result: errResult },
        ...prev.slice(0, 49),
      ]);
      setActiveTab("messages");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      executeQuery();
    }
  };

  const clearEditor = () => {
    setQuery("");
    setError(null);
    setResults(null);
    textareaRef.current?.focus();
  };

  const handleHistoryClick = (item) => {
    setQuery(item.query);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const handleSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery);
    textareaRef.current?.focus();
  };

  return (
    <MainScreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              SQL Editor
            </h1>
            <p className="text-[#a3a3a3] text-sm">
              Write and execute SQL queries against your project database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[#202020] border-[#2a2a2a] text-[#737373] text-[10px] font-mono">
              {history.length} queries run
            </Badge>
          </div>
        </div>

        <div className="flex gap-4 min-h-[calc(100vh-280px)]">
          <div className={`transition-all duration-300 ${showHistory ? "w-64 shrink-0" : "w-0 overflow-hidden"}`}>
            {showHistory && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#737373]" />
                    <span className="text-xs font-medium text-[#e5e5e5]">History</span>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-[10px] text-[#525252] hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-0.5">
                    {history.length === 0 ? (
                      <p className="text-[11px] text-[#525252] px-2 py-4 text-center leading-relaxed">
                        No queries executed yet
                      </p>
                    ) : (
                      history.map((item, i) => (
                        <QueryHistoryItem
                          key={`${item.timestamp}-${i}`}
                          query={item.query}
                          timestamp={item.timestamp}
                          result={item.result}
                          onClick={() => handleHistoryClick(item)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1a1a1a]">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#737373]" />
                  <span className="text-xs font-medium text-[#e5e5e5]">Query</span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowHistory((prev) => !prev)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${showHistory ? "bg-[#2a2a2a] text-[#e5e5e5]" : "text-[#525252] hover:text-[#737373]"}`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#2a2a2a] border-[#333] text-[#e5e5e5] text-[11px]">
                        Toggle history
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={clearEditor}
                          className="p-1.5 rounded-md text-[#525252] hover:text-[#737373] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#2a2a2a] border-[#333] text-[#e5e5e5] text-[11px]">
                        Clear editor
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your SQL query here... (Ctrl+Enter to execute)"
                className="w-full min-h-[140px] max-h-[300px] bg-[#161616] text-[#e5e5e5] placeholder:text-[#525252] font-mono text-xs p-4 resize-y outline-none leading-relaxed"
                spellCheck={false}
              />

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#2a2a2a] bg-[#1a1a1a]">
                <div className="flex items-center gap-2">
                  {SAMPLE_QUERIES.map((sq) => (
                    <button
                      key={sq}
                      onClick={() => handleSampleQuery(sq)}
                      className="text-[10px] text-[#525252] hover:text-[#a3a3a3] bg-[#2a2a2a] hover:bg-[#333] px-2 py-1 rounded transition-colors cursor-pointer font-mono truncate max-w-[140px]"
                    >
                      {sq.split(" ").slice(0, 3).join(" ")}...
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#525252] hidden sm:inline">
                    Ctrl+Enter to run
                  </span>
                  <Button
                    onClick={() => executeQuery()}
                    disabled={loading || !query.trim()}
                    size="sm"
                    className="bg-white text-black hover:bg-[#e5e5e5] text-xs font-medium rounded-md h-7 px-3 gap-1.5"
                  >
                    {loading ? (
                      <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Run
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab("results")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      activeTab === "results"
                        ? "bg-[#2a2a2a] text-[#e5e5e5]"
                        : "text-[#525252] hover:text-[#737373]"
                    }`}
                  >
                    Results {results && <span className="text-[#525252] ml-1">({results.rowCount})</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer relative ${
                      activeTab === "messages"
                        ? "bg-[#2a2a2a] text-[#e5e5e5]"
                        : "text-[#525252] hover:text-[#737373]"
                    }`}
                  >
                    Messages
                    {error && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full" />
                    )}
                  </button>
                </div>

                {results && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#525252] font-mono">
                      {results.rowCount} rows
                    </span>
                    <span className="text-[10px] text-[#525252] font-mono">
                      {results.duration}ms
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(results.rows, null, 2));
                            }}
                            className="p-1 rounded text-[#525252] hover:text-[#737373] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-[#2a2a2a] border-[#333] text-[#e5e5e5] text-[11px]">
                          Copy as JSON
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto">
                {activeTab === "results" ? (
                  loading ? (
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-4 w-3/4 bg-[#202020]" />
                      <Skeleton className="h-4 w-1/2 bg-[#202020]" />
                      <Skeleton className="h-4 w-5/6 bg-[#202020]" />
                      <Skeleton className="h-4 w-2/3 bg-[#202020]" />
                    </div>
                  ) : results ? (
                    results.rows.length > 0 ? (
                      <div className="overflow-auto h-full">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-[#2a2a2a] hover:bg-transparent">
                              <TableHead className="text-[#525252] text-[10px] font-medium w-12 pl-4">
                                #
                              </TableHead>
                              {results.columns.map((col) => (
                                <TableHead
                                  key={col}
                                  className="text-[#737373] text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                                >
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.rows.map((row, idx) => (
                              <TableRow key={idx} className="border-b border-[#2a2a2a]/50 hover:bg-[#1a1a1a]">
                                <TableCell className="text-[#525252] text-[11px] font-mono pl-4">
                                  {idx + 1}
                                </TableCell>
                                {results.columns.map((col) => (
                                  <TableCell
                                    key={col}
                                    className="text-[#e5e5e5] text-xs font-mono max-w-[300px] truncate"
                                  >
                                    {row[col] === null ? (
                                      <span className="text-[#525252] italic">null</span>
                                    ) : typeof row[col] === "boolean" ? (
                                      <span className={row[col] ? "text-green-400" : "text-[#525252]"}>
                                        {row[col].toString()}
                                      </span>
                                    ) : typeof row[col] === "object" ? (
                                      <span className="text-[#737373]">{JSON.stringify(row[col])}</span>
                                    ) : (
                                      String(row[col])
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CheckCircle2 className="w-8 h-8 text-[#2a2a2a] mb-3" />
                        <p className="text-sm text-[#525252]">Query executed successfully</p>
                        <p className="text-xs text-[#333] mt-1">No rows returned</p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Database className="w-8 h-8 text-[#2a2a2a] mb-3" />
                      <p className="text-sm text-[#525252]">No results yet</p>
                      <p className="text-xs text-[#333] mt-1">Write a query and click Run</p>
                    </div>
                  )
                ) : (
                  <div className="p-4">
                    {error ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-300 mb-1">Query Error</p>
                            <p className="text-xs text-red-400/80 font-mono leading-relaxed whitespace-pre-wrap">
                              {error}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : results ? (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-300">Query executed successfully</p>
                            {results.duration && (
                              <p className="text-xs text-[#525252] mt-1">
                                Completed in {results.duration}ms
                                {results.rowCount > 0 && ` · ${results.rowCount} rows returned`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#525252] text-center py-8">
                        No messages yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
