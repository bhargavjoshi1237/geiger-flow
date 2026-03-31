"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Key, Hash, AlignLeft, ToggleLeft, Calendar } from "lucide-react";

const SCHEMA_COLUMNS = [
  { table: "users", column: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimary: true },
  { table: "users", column: "name", type: "varchar(255)", nullable: false, default: null, isPrimary: false },
  { table: "users", column: "email", type: "varchar(255)", nullable: false, default: null, isPrimary: false },
  { table: "users", column: "created_at", type: "timestamptz", nullable: false, default: "now()", isPrimary: false },
  { table: "projects", column: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimary: true },
  { table: "projects", column: "name", type: "varchar(255)", nullable: false, default: null, isPrimary: false },
  { table: "projects", column: "owner_id", type: "uuid", nullable: false, default: null, isPrimary: false },
  { table: "tasks", column: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimary: true },
  { table: "tasks", column: "title", type: "varchar(500)", nullable: false, default: null, isPrimary: false },
  { table: "tasks", column: "status", type: "varchar(50)", nullable: false, default: "'open'", isPrimary: false },
  { table: "tasks", column: "project_id", type: "uuid", nullable: false, default: null, isPrimary: false },
];

const TYPE_ICONS = {
  uuid: Hash,
  "varchar": AlignLeft,
  "timestamptz": Calendar,
  default: AlignLeft,
};

function getTypeIcon(type) {
  const baseType = type.split("(")[0].split("[")[0];
  return TYPE_ICONS[baseType] || TYPE_ICONS.default;
}

export function SqlSchemaView() {
  const tables = [...new Set(SCHEMA_COLUMNS.map((c) => c.table))];

  return (
    <div className="space-y-6">
      {tables.map((tableName) => {
        const columns = SCHEMA_COLUMNS.filter((c) => c.table === tableName);
        return (
          <Card
            key={tableName}
            className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7]"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <CardTitle className="text-sm font-semibold text-[#e7e7e7]">
                  {tableName}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium border-[#2a2a2a] text-[#525252] bg-transparent"
                >
                  {columns.length} columns
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border border-[#2a2a2a] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#2a2a2a] hover:bg-transparent">
                      <TableHead className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider bg-[#111111] h-7 w-8" />
                      <TableHead className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider bg-[#111111] h-7">
                        Column
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider bg-[#111111] h-7">
                        Type
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider bg-[#111111] h-7">
                        Nullable
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider bg-[#111111] h-7">
                        Default
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columns.map((col) => {
                      const TypeIcon = getTypeIcon(col.type);
                      return (
                        <TableRow
                          key={`${col.table}-${col.column}`}
                          className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f]"
                        >
                          <TableCell className="py-2 px-3 w-8">
                            {col.isPrimary ? (
                              <Key className="w-3 h-3 text-yellow-500" />
                            ) : (
                              <div className="w-3 h-3" />
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <span className="text-sm font-medium text-[#e7e7e7] font-mono">
                              {col.column}
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1.5">
                              <TypeIcon className="w-3 h-3 text-[#525252]" />
                              <span className="text-xs text-[#737373] font-mono">
                                {col.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <span
                              className={`text-xs ${col.nullable ? "text-[#737373]" : "text-red-400"}`}
                            >
                              {col.nullable ? "YES" : "NO"}
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className="text-xs text-[#525252] font-mono">
                              {col.default || "—"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
