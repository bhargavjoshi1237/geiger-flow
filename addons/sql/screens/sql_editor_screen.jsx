"use client";

import React, { useState, useCallback, useRef } from "react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { Button } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { ScrollArea } from "@geiger/ui";
import { Skeleton } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@geiger/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@geiger/ui";
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

function QueryHistoryItem({ query, timestamp, result, onClick }) {
  const isSuccess = result?.status === "success";
  const isError = result?.status === "error";

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full justify-start text-left px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group cursor-pointer"
    >
      <div className="flex items-start gap-2">
        {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />}
        {isError && <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />}
        {!isSuccess && !isError && <Database className="w-3.5 h-3.5 text-text-secondary mt-0.5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-foreground font-mono truncate leading-relaxed">
            {query}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-text-tertiary">
              {timestamp}
            </span>
            {isSuccess && result?.rowCount !== undefined && (
              <span className="text-[10px] text-text-tertiary">{result.rowCount} rows</span>
            )}
            {isSuccess && result?.duration && (
              <span className="text-[10px] text-text-tertiary">{result.duration}ms</span>
            )}
          </div>
        </div>
      </div>
    </Button>
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

  return (
    <MainScreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              SQL Editor
            </h1>
            <p className="text-muted-foreground text-sm">
              Write and execute SQL queries against your project database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-surface-card border-border text-text-secondary text-[10px] font-mono">
              {history.length} queries run
            </Badge>
          </div>
        </div>

        <div className="flex gap-4 min-h-[calc(100vh-280px)]">
          <div className={`transition-all duration-300 ${showHistory ? "w-64 shrink-0" : "w-0 overflow-hidden"}`}>
            {showHistory && (
              <div className="bg-surface-subtle border border-border rounded-xl h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium text-foreground">History</span>
                  </div>
                  {history.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-[10px] text-text-tertiary hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-0.5">
                    {history.length === 0 ? (
                      <p className="text-[11px] text-text-tertiary px-2 py-4 text-center leading-relaxed">
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
            <div className="bg-surface-subtle border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-subtle">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-xs font-medium text-foreground">Query</span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowHistory((prev) => !prev)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${showHistory ? "bg-surface-hover text-foreground" : "text-text-tertiary hover:text-text-secondary"}`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-surface-hover border-border text-foreground text-[11px]">
                        Toggle history
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={clearEditor}
                          className="p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-surface-hover border-border text-foreground text-[11px]">
                        Clear editor
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your SQL query here... (Ctrl+Enter to execute)"
                className="min-h-[140px] max-h-[300px] rounded-none border-0 bg-background p-4 font-mono text-xs leading-relaxed text-foreground placeholder:text-text-tertiary resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
                spellCheck={false}
              />

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-subtle">
                <div />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary hidden sm:inline">
                    Ctrl+Enter to run
                  </span>
                  <Button
                    onClick={() => executeQuery()}
                    disabled={loading || !query.trim()}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-md h-7 px-3 gap-1.5"
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

            <div className="bg-surface-subtle border border-border rounded-xl overflow-hidden flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("results")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      activeTab === "results"
                        ? "bg-surface-hover text-foreground"
                        : "text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    Results {results && <span className="text-text-tertiary ml-1">({results.rowCount})</span>}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("messages")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer relative ${
                      activeTab === "messages"
                        ? "bg-surface-hover text-foreground"
                        : "text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    Messages
                    {error && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full" />
                    )}
                  </Button>
                </div>

                {results && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-text-tertiary font-mono">
                      {results.rowCount} rows
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono">
                      {results.duration}ms
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(results.rows, null, 2));
                            }}
                            className="p-1 rounded text-text-tertiary hover:text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-surface-hover border-border text-foreground text-[11px]">
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
                      <Skeleton className="h-4 w-3/4 bg-surface-card" />
                      <Skeleton className="h-4 w-1/2 bg-surface-card" />
                      <Skeleton className="h-4 w-5/6 bg-surface-card" />
                      <Skeleton className="h-4 w-2/3 bg-surface-card" />
                    </div>
                  ) : results ? (
                    results.rows.length > 0 ? (
                      <div className="overflow-auto h-full">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-border hover:bg-transparent">
                              <TableHead className="text-text-tertiary text-[10px] font-medium w-12 pl-4">
                                #
                              </TableHead>
                              {results.columns.map((col) => (
                                <TableHead
                                  key={col}
                                  className="text-text-secondary text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                                >
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.rows.map((row, idx) => (
                              <TableRow key={idx} className="border-b border-border/50 hover:bg-surface-subtle">
                                <TableCell className="text-text-tertiary text-[11px] font-mono pl-4">
                                  {idx + 1}
                                </TableCell>
                                {results.columns.map((col) => (
                                  <TableCell
                                    key={col}
                                    className="text-foreground text-xs font-mono max-w-[300px] truncate"
                                  >
                                    {row[col] === null ? (
                                      <span className="text-text-tertiary italic">null</span>
                                    ) : typeof row[col] === "boolean" ? (
                                      <span className={row[col] ? "text-green-400" : "text-text-tertiary"}>
                                        {row[col].toString()}
                                      </span>
                                    ) : typeof row[col] === "object" ? (
                                      <span className="text-text-secondary">{JSON.stringify(row[col])}</span>
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
                        <CheckCircle2 className="w-8 h-8 text-text-tertiary mb-3" />
                        <p className="text-sm text-text-tertiary">Query executed successfully</p>
                        <p className="text-xs text-text-tertiary mt-1">No rows returned</p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Database className="w-8 h-8 text-text-tertiary mb-3" />
                      <p className="text-sm text-text-tertiary">No results yet</p>
                      <p className="text-xs text-text-tertiary mt-1">Write a query and click Run</p>
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
                              <p className="text-xs text-text-tertiary mt-1">
                                Completed in {results.duration}ms
                                {results.rowCount > 0 && ` · ${results.rowCount} rows returned`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-text-tertiary text-center py-8">
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
