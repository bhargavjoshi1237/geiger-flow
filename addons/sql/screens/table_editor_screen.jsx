"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { Button } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { ScrollArea } from "@geiger/ui";
import { Skeleton } from "@geiger/ui";
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
  Search,
  Table2,
  KeyRound,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  Binary,
  RefreshCw,
  ChevronRight,
  ArrowUpDown,
  Columns3,
  Rows3,
  Database,
  ChevronLeft,
} from "lucide-react";
import { flowClient } from "@/supabase/components/flow-client";
import { useProject } from "@/context/project-context";
import { SQL_EXPLORER_TABLES } from "@/features/sql_history/constants";

// No execute_sql RPC here either (see sql_editor_screen.jsx): the browser
// reads whitelisted flow.* tables through the query builder so RLS still
// applies. Column types are inferred from the first page of rows; `id` is
// treated as the primary key.

const TYPE_ICONS = {
  uuid: { icon: Hash, label: "UUID" },
  text: { icon: Type, label: "Text" },
  integer: { icon: Hash, label: "Integer" },
  numeric: { icon: Hash, label: "Numeric" },
  boolean: { icon: ToggleLeft, label: "Boolean" },
  json: { icon: Binary, label: "JSON" },
  timestamp: { icon: Calendar, label: "Timestamp" },
};

function getTypeInfo(typeName) {
  const lower = (typeName || "").toLowerCase();
  for (const [key, value] of Object.entries(TYPE_ICONS)) {
    if (lower.includes(key)) return value;
  }
  return { icon: Type, label: typeName || "unknown" };
}

function inferType(value) {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "numeric";
  if (value instanceof Date) return "timestamp";
  if (typeof value === "object") return "json";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return "timestamp";
  if (typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value)) return "uuid";
  return "text";
}

function inferColumns(rows) {
  if (!rows || rows.length === 0) {
    return [];
  }

  const names = Object.keys(rows[0]);
  return names.map((column_name, index) => ({
    column_name,
    data_type: inferType(rows[0][column_name]),
    is_nullable: "YES",
    is_primary: column_name === "id",
    ordinal_position: index + 1,
  }));
}

function ColumnTypeBadge({ type }) {
  const info = getTypeInfo(type);
  const Icon = info.icon;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-hover text-muted-foreground">
      <Icon className="w-3 h-3 text-text-secondary" />
      <span className="text-[10px] font-medium font-mono">{info.label}</span>
    </div>
  );
}

function TableColumnHeader({ column, isSortActive, sortDirection, onSort }) {
  return (
    <TableHead
      className="text-text-secondary text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-foreground transition-colors select-none group"
      onClick={() => onSort(column.column_name)}
    >
      <div className="flex items-center gap-1.5">
        <span>{column.column_name}</span>
        {column.is_primary && <KeyRound className="w-3 h-3 text-yellow-500/60" />}
        <ArrowUpDown className={`w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity ${isSortActive ? "!opacity-100 text-foreground" : ""}`} />
        {isSortActive && (
          <span className="text-[9px] text-text-tertiary">
            {sortDirection === "asc" ? "ASC" : "DESC"}
          </span>
        )}
      </div>
    </TableHead>
  );
}

function TableListItem({ table, rows, columns, isSelected, onClick }) {
  return (
    <Button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer hover:bg-surface-hover ${
        isSelected ? "bg-surface-hover border border-border" : "border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-surface-strong" : "bg-surface-active"}`}>
          <Table2 className={`w-4 h-4 ${isSelected ? "text-foreground" : "text-text-secondary"}`} />
        </div>
        <div className="text-left min-w-0">
          <p className={`text-sm font-medium truncate ${isSelected ? "text-foreground" : "text-foreground"}`}>
            {table}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-text-tertiary flex items-center gap-1">
              <Columns3 className="w-2.5 h-2.5" />
              {columns !== null ? columns : "—"}
            </span>
            <span className="text-[10px] text-text-tertiary flex items-center gap-1">
              <Rows3 className="w-2.5 h-2.5" />
              {rows !== null ? rows.toLocaleString() : "—"}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-foreground" : "text-text-tertiary"}`} />
    </Button>
  );
}

function CellValue({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-text-tertiary italic font-mono">null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex items-center gap-1 ${value ? "text-green-400" : "text-text-tertiary"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${value ? "bg-green-400" : "bg-surface-strong"}`} />
        {value.toString()}
      </span>
    );
  }
  if (typeof value === "object") {
    return (
      <span className="text-text-secondary font-mono text-[11px] max-w-[200px] truncate block">
        {JSON.stringify(value)}
      </span>
    );
  }
  const str = String(value);
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return (
      <a
        href={str}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#60a5fa] hover:text-[#93bbfd] hover:underline font-mono text-xs truncate block max-w-[200px]"
      >
        {str}
      </a>
    );
  }
  if (str.length > 100) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-foreground font-mono text-xs cursor-default">{str.slice(0, 100)}…</span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-surface-hover border-border text-foreground text-[11px] max-w-[400px]">
            <span className="font-mono whitespace-pre-wrap break-all">{str}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <span className="text-foreground font-mono text-xs">{str}</span>;
}

export function TableEditorScreen() {
  const { project } = useProject();
  const projectId = project?.id;
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const pageSize = 50;

  const fetchTables = useCallback(async () => {
    setLoadingTables(true);

    const base = SQL_EXPLORER_TABLES.map((table_name) => ({
      table_name,
      column_count: null,
      estimated_rows: null,
    }));
    setTables(base);

    try {
      const counts = await Promise.all(
        SQL_EXPLORER_TABLES.map(async (table_name) => {
          try {
            let query = flowClient().from(table_name).select("id", { count: "exact", head: true });
            if (projectId) {
              query = query.eq("project_id", projectId);
            }
            const { count, error } = await query;
            if (error) {
              return { table_name, estimated_rows: null };
            }
            return { table_name, estimated_rows: count ?? null };
          } catch {
            return { table_name, estimated_rows: null };
          }
        }),
      );

      setTables((current) =>
        current.map((entry) => ({
          ...entry,
          estimated_rows:
            counts.find((item) => item.table_name === entry.table_name)?.estimated_rows ?? null,
        })),
      );
    } finally {
      setLoadingTables(false);
    }
  }, [projectId]);

  useEffect(() => {
    void Promise.resolve().then(fetchTables);
  }, [fetchTables]);

  const fetchTableData = useCallback(
    async (tableName) => {
      setLoadingData(true);
      setSelectedTable(tableName);
      setSortColumn(null);
      setSortDirection("asc");
      setPage(0);
      setSearchFilter("");

      try {
        let query = flowClient().from(tableName).select("*", { count: "exact" }).range(0, pageSize - 1);
        if (projectId) {
          query = query.eq("project_id", projectId);
        }
        const { data, count, error } = await query;

        if (error) {
          console.error("[table-editor] list error:", error);
          toast.error(`Couldn't load ${tableName}.`);
          setColumns([]);
          setRows([]);
          setTotalRows(0);
          return;
        }

        const pageRows = Array.isArray(data) ? data : [];
        setColumns(inferColumns(pageRows));
        setRows(pageRows);
        setTotalRows(count ?? pageRows.length);
      } catch (err) {
        console.error("[table-editor] list error:", err);
        toast.error(`Couldn't load ${tableName}.`);
        setColumns([]);
        setRows([]);
        setTotalRows(0);
      } finally {
        setLoadingData(false);
      }
    },
    [pageSize, projectId],
  );

  const fetchSortedData = useCallback(
    async (col, direction) => {
      if (!selectedTable) return;
      setLoadingData(true);

      try {
        const offset = page * pageSize;
        let query = flowClient()
          .from(selectedTable)
          .select("*", { count: "exact" })
          .order(col, { ascending: direction === "asc" })
          .range(offset, offset + pageSize - 1);
        if (projectId) {
          query = query.eq("project_id", projectId);
        }
        const { data, count, error } = await query;

        if (error) {
          console.error("[table-editor] sort error:", error);
          toast.error("Couldn't sort rows.");
          return;
        }

        const pageRows = Array.isArray(data) ? data : [];
        if (columns.length === 0) {
          setColumns(inferColumns(pageRows));
        }
        setRows(pageRows);
        if (typeof count === "number") {
          setTotalRows(count);
        }
      } catch (err) {
        console.error("[table-editor] sort error:", err);
        toast.error("Couldn't sort rows.");
      } finally {
        setLoadingData(false);
      }
    },
    [columns.length, page, pageSize, projectId, selectedTable],
  );

  const handleSort = (colName) => {
    let newDirection = "asc";
    if (sortColumn === colName) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    setSortColumn(colName);
    setSortDirection(newDirection);
    fetchSortedData(colName, newDirection);
  };

  const fetchPageData = useCallback(
    async (newPage) => {
      if (!selectedTable) return;
      setLoadingData(true);
      setPage(newPage);

      try {
        const offset = newPage * pageSize;
        let query = flowClient().from(selectedTable).select("*", { count: "exact" });
        if (sortColumn) {
          query = query.order(sortColumn, { ascending: sortDirection === "asc" });
        }
        if (projectId) {
          query = query.eq("project_id", projectId);
        }
        const { data, count, error } = await query.range(offset, offset + pageSize - 1);

        if (error) {
          console.error("[table-editor] page error:", error);
          toast.error("Couldn't load the next page.");
          return;
        }

        const pageRows = Array.isArray(data) ? data : [];
        setRows(pageRows);
        if (typeof count === "number") {
          setTotalRows(count);
        }
      } catch (err) {
        console.error("[table-editor] page error:", err);
        toast.error("Couldn't load the next page.");
      } finally {
        setLoadingData(false);
      }
    },
    [pageSize, projectId, selectedTable, sortColumn, sortDirection],
  );

  const filteredTables = tables.filter((t) =>
    t.table_name.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  const totalPages = Math.ceil(totalRows / pageSize);
  const columnNames = columns.map((c) => c.column_name);

  return (
    <MainScreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Table Editor
            </h1>
            <p className="text-muted-foreground text-sm">
              Browse whitelisted project tables, schemas, and data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-surface-card border-border text-text-secondary text-[10px] font-mono">
              {tables.length} tables
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={fetchTables}
                    className="text-text-tertiary hover:text-text-secondary hover:bg-surface-hover"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-surface-hover border-border text-foreground text-[11px]">
                  Refresh tables
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex gap-4 min-h-[calc(100vh-280px)]">
          <div className={`transition-all duration-300 ${showSidebar ? "w-72 shrink-0" : "w-0 overflow-hidden"}`}>
            {showSidebar && (
              <div className="bg-surface-subtle border border-border rounded-xl h-full flex flex-col">
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium text-foreground">Tables</span>
                  </div>
                </div>
                <div className="px-3 py-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                    <Input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter tables..."
                      className="bg-background border-border text-xs h-7 pl-8 pr-3 placeholder:text-text-tertiary focus-visible:border-border-strong focus-visible:ring-0"
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-0.5">
                    {loadingTables && tables.length === 0 ? (
                      <div className="space-y-2 p-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full bg-surface-card rounded-lg" />
                        ))}
                      </div>
                    ) : filteredTables.length === 0 ? (
                      <p className="text-[11px] text-text-tertiary px-2 py-4 text-center leading-relaxed">
                        {tables.length === 0
                          ? "No whitelisted tables"
                          : "No tables match your filter"}
                      </p>
                    ) : (
                      filteredTables.map((t) => (
                        <TableListItem
                          key={t.table_name}
                          table={t.table_name}
                          rows={t.estimated_rows}
                          columns={t.column_count}
                          isSelected={selectedTable === t.table_name}
                          onClick={() => fetchTableData(t.table_name)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {selectedTable ? (
              <>
                <div className="bg-surface-subtle border border-border rounded-xl overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => setShowSidebar((prev) => !prev)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${showSidebar ? "bg-surface-hover text-foreground" : "text-text-tertiary hover:text-text-secondary"}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-surface-hover border-border text-foreground text-[11px]">
                            Toggle sidebar
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Table2 className="w-3.5 h-3.5 text-text-secondary" />
                      <span className="text-sm font-medium text-foreground">{selectedTable}</span>
                      {!loadingData && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-tertiary">
                            {columns.length} columns
                          </span>
                          <span className="text-text-tertiary">·</span>
                          <span className="text-[10px] text-text-tertiary">
                            {totalRows.toLocaleString()} rows
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {columns.length > 0 && (
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mr-1">
                          Schema
                        </span>
                        {columns.map((col) => (
                          <div
                            key={col.column_name}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-active border border-border hover:border-border transition-colors group cursor-default"
                          >
                            {col.is_primary && (
                              <KeyRound className="w-2.5 h-2.5 text-yellow-500/60" />
                            )}
                            <span className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground transition-colors">
                              {col.column_name}
                            </span>
                            <ColumnTypeBadge type={col.data_type} />
                            {col.is_nullable === "NO" && (
                              <span className="text-[9px] text-text-tertiary font-mono">NOT NULL</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-surface-subtle border border-border rounded-xl overflow-hidden flex-1 flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <span className="text-xs font-medium text-foreground">Data</span>
                    {rows.length > 0 && (
                      <span className="text-[10px] text-text-tertiary font-mono">
                        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalRows)} of {totalRows.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto">
                    {loadingData ? (
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-full bg-surface-card rounded" />
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full bg-surface-card rounded" />
                        ))}
                      </div>
                    ) : rows.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="text-text-tertiary text-[10px] font-medium w-12 pl-4">
                              #
                            </TableHead>
                            {columns.map((col) => (
                              <TableColumnHeader
                                key={col.column_name}
                                column={col}
                                isSortActive={sortColumn === col.column_name}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                              />
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row, idx) => (
                            <TableRow
                              key={idx}
                              className="border-b border-border/50 hover:bg-surface-active transition-colors"
                            >
                              <TableCell className="text-text-tertiary text-[11px] font-mono pl-4">
                                {page * pageSize + idx + 1}
                              </TableCell>
                              {columnNames.map((colName) => (
                                <TableCell
                                  key={colName}
                                  className="text-xs max-w-[300px] py-2.5"
                                >
                                  <CellValue value={row[colName]} />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Table2 className="w-8 h-8 text-text-tertiary mb-3" />
                        <p className="text-sm text-text-tertiary">No data in this table</p>
                        <p className="text-xs text-text-tertiary mt-1">
                          {totalRows === 0 ? "The table is empty" : "Failed to load data"}
                        </p>
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
                      <span className="text-[10px] text-text-tertiary">
                        Page {page + 1} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(0)}
                          disabled={page === 0 || loadingData}
                          className="text-text-tertiary hover:text-text-secondary hover:bg-surface-hover disabled:opacity-30 h-6 w-6"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <ChevronLeft className="w-3 h-3 -ml-1.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(page - 1)}
                          disabled={page === 0 || loadingData}
                          className="text-text-tertiary hover:text-text-secondary hover:bg-surface-hover disabled:opacity-30 h-6 w-6"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(page + 1)}
                          disabled={page >= totalPages - 1 || loadingData}
                          className="text-text-tertiary hover:text-text-secondary hover:bg-surface-hover disabled:opacity-30 h-6 w-6"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(totalPages - 1)}
                          disabled={page >= totalPages - 1 || loadingData}
                          className="text-text-tertiary hover:text-text-secondary hover:bg-surface-hover disabled:opacity-30 h-6 w-6"
                        >
                          <ChevronRight className="w-3 h-3" />
                          <ChevronRight className="w-3 h-3 -ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-surface-subtle border border-border rounded-xl flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => setShowSidebar((prev) => !prev)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${showSidebar ? "bg-surface-hover text-foreground" : "text-text-tertiary hover:text-text-secondary"}`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-surface-hover border-border text-foreground text-[11px]">
                        Toggle sidebar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs font-medium text-text-secondary">
                    {loadingTables ? "Loading tables..." : "Select a table to view"}
                  </span>
                </div>
                <Table2 className="w-12 h-12 text-text-tertiary mb-4" />
                <p className="text-sm text-text-tertiary">
                  {loadingTables ? "Discovering database tables" : "Choose a table from the sidebar"}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  {loadingTables ? "This may take a moment" : "View schema, browse rows, and sort data"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
