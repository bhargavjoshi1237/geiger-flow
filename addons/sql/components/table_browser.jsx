"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Table2,
  ChevronRight,
  Rows3,
  Columns3,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const MOCK_TABLES = [
  {
    name: "users",
    schema: "public",
    rows: 1247,
    columns: 8,
    size: "2.4 MB",
    lastModified: "2026-03-30",
  },
  {
    name: "projects",
    schema: "public",
    rows: 89,
    columns: 12,
    size: "1.1 MB",
    lastModified: "2026-03-29",
  },
  {
    name: "tasks",
    schema: "public",
    rows: 3421,
    columns: 10,
    size: "4.8 MB",
    lastModified: "2026-03-31",
  },
  {
    name: "issues",
    schema: "public",
    rows: 567,
    columns: 9,
    size: "890 KB",
    lastModified: "2026-03-28",
  },
  {
    name: "milestones",
    schema: "public",
    rows: 43,
    columns: 6,
    size: "128 KB",
    lastModified: "2026-03-27",
  },
  {
    name: "activity_logs",
    schema: "public",
    rows: 89432,
    columns: 7,
    size: "24.6 MB",
    lastModified: "2026-03-31",
  },
];

export function SqlTableBrowser() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTables = MOCK_TABLES.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tables..."
          className="pl-9 bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] text-sm placeholder:text-[#474747] focus-visible:ring-blue-500/30"
        />
      </div>

      <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7]">
        <CardContent className="p-0">
          <div className="rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#2a2a2a] hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider bg-[#111111] h-8">
                    Table
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider bg-[#111111] h-8">
                    Schema
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider bg-[#111111] h-8">
                    Rows
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider bg-[#111111] h-8">
                    Columns
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider bg-[#111111] h-8">
                    Size
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider bg-[#111111] h-8">
                    Last Modified
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => (
                  <TableRow
                    key={table.name}
                    className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] cursor-pointer group"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#2a2a2a] flex items-center justify-center">
                          <Table2 className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-[#e7e7e7]">
                          {table.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#737373]">
                      {table.schema}
                    </TableCell>
                    <TableCell className="text-sm text-[#a3a3a3]">
                      {table.rows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-[#a3a3a3]">
                      {table.columns}
                    </TableCell>
                    <TableCell className="text-sm text-[#a3a3a3]">
                      {table.size}
                    </TableCell>
                    <TableCell className="text-sm text-[#737373]">
                      {table.lastModified}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
