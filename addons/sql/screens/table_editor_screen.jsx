"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  TableIcon,
  Columns3,
  Rows3,
  Database,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TYPE_ICONS = {
  uuid: { icon: Hash, label: "UUID" },
  text: { icon: Type, label: "Text" },
  varchar: { icon: Type, label: "String" },
  "character varying": { icon: Type, label: "String" },
  integer: { icon: Hash, label: "Integer" },
  bigint: { icon: Hash, label: "BigInt" },
  smallint: { icon: Hash, label: "Int" },
  numeric: { icon: Hash, label: "Numeric" },
  decimal: { icon: Hash, label: "Decimal" },
  real: { icon: Hash, label: "Real" },
  double: { icon: Hash, label: "Double" },
  boolean: { icon: ToggleLeft, label: "Boolean" },
  json: { icon: Binary, label: "JSON" },
  jsonb: { icon: Binary, label: "JSONB" },
  timestamp: { icon: Calendar, label: "Timestamp" },
  "timestamp with time zone": { icon: Calendar, label: "Timestamptz" },
  "timestamp without time zone": { icon: Calendar, label: "Timestamp" },
  date: { icon: Calendar, label: "Date" },
  time: { icon: Calendar, label: "Time" },
  bytea: { icon: Binary, label: "Bytes" },
  array: { icon: Columns3, label: "Array" },
};

function getTypeInfo(typeName) {
  const lower = (typeName || "").toLowerCase();
  for (const [key, value] of Object.entries(TYPE_ICONS)) {
    if (lower.includes(key)) return value;
  }
  return { icon: Type, label: typeName || "unknown" };
}

function ColumnTypeBadge({ type }) {
  const info = getTypeInfo(type);
  const Icon = info.icon;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2a2a2a] text-[#a3a3a3]">
      <Icon className="w-3 h-3 text-[#737373]" />
      <span className="text-[10px] font-medium font-mono">{info.label}</span>
    </div>
  );
}

function TableColumnHeader({ column, isSortActive, sortDirection, onSort }) {
  return (
    <TableHead
      className="text-[#737373] text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-[#e5e5e5] transition-colors select-none group"
      onClick={() => onSort(column.column_name)}
    >
      <div className="flex items-center gap-1.5">
        <span>{column.column_name}</span>
        {column.is_primary && <KeyRound className="w-3 h-3 text-yellow-500/60" />}
        <ArrowUpDown className={`w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity ${isSortActive ? "!opacity-100 text-white" : ""}`} />
        {isSortActive && (
          <span className="text-[9px] text-[#525252]">
            {sortDirection === "asc" ? "ASC" : "DESC"}
          </span>
        )}
      </div>
    </TableHead>
  );
}

function TableListItem({ table, rows, columns, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer hover:bg-[#2a2a2a] ${
        isSelected ? "bg-[#2a2a2a] border border-[#333]" : "border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-[#333]" : "bg-[#242424]"}`}>
          <Table2 className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#737373]"}`} />
        </div>
        <div className="text-left min-w-0">
          <p className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-[#e5e5e5]"}`}>
            {table}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#525252] flex items-center gap-1">
              <Columns3 className="w-2.5 h-2.5" />
              {columns !== null ? columns : "—"}
            </span>
            <span className="text-[10px] text-[#525252] flex items-center gap-1">
              <Rows3 className="w-2.5 h-2.5" />
              {rows !== null ? rows.toLocaleString() : "—"}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[#333]"}`} />
    </button>
  );
}

function CellValue({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-[#525252] italic font-mono">null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex items-center gap-1 ${value ? "text-green-400" : "text-[#525252]"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${value ? "bg-green-400" : "bg-[#333]"}`} />
        {value.toString()}
      </span>
    );
  }
  if (typeof value === "object") {
    return (
      <span className="text-[#737373] font-mono text-[11px] max-w-[200px] truncate block">
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
            <span className="text-[#e5e5e5] font-mono text-xs cursor-default">{str.slice(0, 100)}…</span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#2a2a2a] border-[#333] text-[#e5e5e5] text-[11px] max-w-[400px]">
            <span className="font-mono whitespace-pre-wrap break-all">{str}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <span className="text-[#e5e5e5] font-mono text-xs">{str}</span>;
}

export function TableEditorScreen() {
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
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("execute_sql", {
        query_string: `
          SELECT 
            t.table_name,
            (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count,
            c.reltuples::bigint as estimated_rows
          FROM information_schema.tables t
          LEFT JOIN pg_class c ON c.relname = t.table_name AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
          WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
          ORDER BY t.table_name;
        `,
      });

      if (error) {
        setTables([]);
        return;
      }

      const tableList = Array.isArray(data) ? data : [];
      setTables(tableList);
    } catch (err) {
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
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
        const supabase = createClient();

        let colData = null;
        let colError = null;
        try {
          const res = await supabase.rpc("execute_sql", {
            query_string: `
              SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default,
                character_maximum_length,
                ordinal_position
              FROM information_schema.columns 
              WHERE table_name = '${tableName}' AND table_schema = 'public'
              ORDER BY ordinal_position;
            `,
          });
          colData = res.data;
          colError = res.error;
        } catch (e) {
          colError = e;
        }

        if (!colError && colData) {
          setColumns(Array.isArray(colData) ? colData : []);

          try {
            const pkResult = await supabase.rpc("execute_sql", {
              query_string: `
                SELECT a.attname
                FROM pg_index i
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE i.indrelid = '${tableName}'::regclass AND i.indisprimary;
              `,
            });
            if (!pkResult.error && Array.isArray(pkResult.data)) {
              const pkCols = pkResult.data.map((r) => r.attname);
              setColumns((prev) =>
                prev.map((col) => ({
                  ...col,
                  is_primary: pkCols.includes(col.column_name),
                }))
              );
            }
          } catch (e) {}
        }

        let countData = null;
        try {
          const countRes = await supabase.rpc("execute_sql", {
            query_string: `SELECT count(*) as total FROM "${tableName}";`,
          });
          countData = countRes.data;
        } catch (e) {}
        if (Array.isArray(countData) && countData.length > 0) {
          setTotalRows(countData[0].total || 0);
        } else {
          setTotalRows(0);
        }

        const offset = 0;
        let rowData = [];
        let rowError = null;
        try {
          const rowRes = await supabase.rpc("execute_sql", {
            query_string: `SELECT * FROM "${tableName}" ORDER BY 1 LIMIT ${pageSize} OFFSET ${offset};`,
          });
          rowData = rowRes.data;
          rowError = rowRes.error;
        } catch (e) {
          rowError = e;
        }

        if (!rowError) {
          setRows(Array.isArray(rowData) ? rowData : []);
        } else {
          setRows([]);
        }
      } catch (err) {
        setRows([]);
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  const fetchSortedData = useCallback(
    async (col, direction) => {
      if (!selectedTable) return;
      setLoadingData(true);

      try {
        const supabase = createClient();
        const order = direction === "asc" ? "ASC" : "DESC";
        const offset = page * pageSize;

        const { data, error } = await supabase.rpc("execute_sql", {
          query_string: `SELECT * FROM "${selectedTable}" ORDER BY "${col}" ${order} LIMIT ${pageSize} OFFSET ${offset};`,
        });

        if (!error) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setRows([]);
      } finally {
        setLoadingData(false);
      }
    },
    [selectedTable, page]
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
        const supabase = createClient();
        const offset = newPage * pageSize;
        const orderClause = sortColumn
          ? ` ORDER BY "${sortColumn}" ${sortDirection === "asc" ? "ASC" : "DESC"}`
          : " ORDER BY 1";

        const { data, error } = await supabase.rpc("execute_sql", {
          query_string: `SELECT * FROM "${selectedTable}"${orderClause} LIMIT ${pageSize} OFFSET ${offset};`,
        });

        if (!error) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setRows([]);
      } finally {
        setLoadingData(false);
      }
    },
    [selectedTable, sortColumn, sortDirection]
  );

  const filteredTables = tables.filter((t) =>
    t.table_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalPages = Math.ceil(totalRows / pageSize);
  const columnNames = columns.map((c) => c.column_name);

  return (
    <MainScreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              Table Editor
            </h1>
            <p className="text-[#a3a3a3] text-sm">
              Browse and explore your database tables, schemas, and data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[#202020] border-[#2a2a2a] text-[#737373] text-[10px] font-mono">
              {tables.length} tables
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={fetchTables}
                    className="text-[#525252] hover:text-[#737373] hover:bg-[#2a2a2a]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#2a2a2a] border-[#333] text-[#e5e5e5] text-[11px]">
                  Refresh tables
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex gap-4 min-h-[calc(100vh-280px)]">
          <div className={`transition-all duration-300 ${showSidebar ? "w-72 shrink-0" : "w-0 overflow-hidden"}`}>
            {showSidebar && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl h-full flex flex-col">
                <div className="px-4 py-3 border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#737373]" />
                    <span className="text-xs font-medium text-[#e5e5e5]">Tables</span>
                  </div>
                </div>
                <div className="px-3 py-2 border-b border-[#2a2a2a]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                    <Input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter tables..."
                      className="bg-[#161616] border-[#2a2a2a] text-xs h-7 pl-8 pr-3 placeholder:text-[#525252] focus-visible:border-[#474747] focus-visible:ring-0"
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-0.5">
                    {loadingTables ? (
                      <div className="space-y-2 p-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full bg-[#202020] rounded-lg" />
                        ))}
                      </div>
                    ) : filteredTables.length === 0 ? (
                      <p className="text-[11px] text-[#525252] px-2 py-4 text-center leading-relaxed">
                        {tables.length === 0
                          ? "No tables found in public schema"
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
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setShowSidebar((prev) => !prev)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${showSidebar ? "bg-[#2a2a2a] text-[#e5e5e5]" : "text-[#525252] hover:text-[#737373]"}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-[#2a2a2a] border-[#333] text-[#e5e5e5] text-[11px]">
                            Toggle sidebar
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Table2 className="w-3.5 h-3.5 text-[#737373]" />
                      <span className="text-sm font-medium text-white">{selectedTable}</span>
                      {!loadingData && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#525252]">
                            {columns.length} columns
                          </span>
                          <span className="text-[#525252]">·</span>
                          <span className="text-[10px] text-[#525252]">
                            {totalRows.toLocaleString()} rows
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {columns.length > 0 && (
                    <div className="px-4 py-3 border-b border-[#2a2a2a]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-[#525252] font-medium uppercase tracking-wider mr-1">
                          Schema
                        </span>
                        {columns.map((col) => (
                          <div
                            key={col.column_name}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#242424] border border-[#2a2a2a] hover:border-[#333] transition-colors group cursor-default"
                          >
                            {col.is_primary && (
                              <KeyRound className="w-2.5 h-2.5 text-yellow-500/60" />
                            )}
                            <span className="text-[10px] text-[#a3a3a3] font-mono group-hover:text-[#e5e5e5] transition-colors">
                              {col.column_name}
                            </span>
                            <ColumnTypeBadge type={col.data_type} />
                            {col.is_nullable === "NO" && (
                              <span className="text-[9px] text-[#525252] font-mono">NOT NULL</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex-1 flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a]">
                    <span className="text-xs font-medium text-[#e5e5e5]">Data</span>
                    {rows.length > 0 && (
                      <span className="text-[10px] text-[#525252] font-mono">
                        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalRows)} of {totalRows.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto">
                    {loadingData ? (
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-full bg-[#202020] rounded" />
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full bg-[#202020] rounded" />
                        ))}
                      </div>
                    ) : rows.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-[#2a2a2a] hover:bg-transparent">
                            <TableHead className="text-[#525252] text-[10px] font-medium w-12 pl-4">
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
                              className="border-b border-[#2a2a2a]/50 hover:bg-[#242424] transition-colors"
                            >
                              <TableCell className="text-[#525252] text-[11px] font-mono pl-4">
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
                        <Table2 className="w-8 h-8 text-[#2a2a2a] mb-3" />
                        <p className="text-sm text-[#525252]">No data in this table</p>
                        <p className="text-xs text-[#333] mt-1">
                          {totalRows === 0 ? "The table is empty" : "Failed to load data"}
                        </p>
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#2a2a2a]">
                      <span className="text-[10px] text-[#525252]">
                        Page {page + 1} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(0)}
                          disabled={page === 0 || loadingData}
                          className="text-[#525252] hover:text-[#737373] hover:bg-[#2a2a2a] disabled:opacity-30 h-6 w-6"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <ChevronLeft className="w-3 h-3 -ml-1.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(page - 1)}
                          disabled={page === 0 || loadingData}
                          className="text-[#525252] hover:text-[#737373] hover:bg-[#2a2a2a] disabled:opacity-30 h-6 w-6"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(page + 1)}
                          disabled={page >= totalPages - 1 || loadingData}
                          className="text-[#525252] hover:text-[#737373] hover:bg-[#2a2a2a] disabled:opacity-30 h-6 w-6"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fetchPageData(totalPages - 1)}
                          disabled={page >= totalPages - 1 || loadingData}
                          className="text-[#525252] hover:text-[#737373] hover:bg-[#2a2a2a] disabled:opacity-30 h-6 w-6"
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
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowSidebar((prev) => !prev)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${showSidebar ? "bg-[#2a2a2a] text-[#e5e5e5]" : "text-[#525252] hover:text-[#737373]"}`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#2a2a2a] border-[#333] text-[#e5e5e5] text-[11px]">
                        Toggle sidebar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs font-medium text-[#737373]">
                    {loadingTables ? "Loading tables..." : "Select a table to view"}
                  </span>
                </div>
                <Table2 className="w-12 h-12 text-[#2a2a2a] mb-4" />
                <p className="text-sm text-[#525252]">
                  {loadingTables ? "Discovering database tables" : "Choose a table from the sidebar"}
                </p>
                <p className="text-xs text-[#333] mt-1">
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
