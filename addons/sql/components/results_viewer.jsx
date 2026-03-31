"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Table2, Rows3, Clock } from "lucide-react";

export function SqlResultsViewer({ results }) {
  if (!results) return null;

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-[#a3a3a3]">
            Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-[#2a2a2a] text-[#737373] bg-transparent"
            >
              <Rows3 className="w-3 h-3 mr-1" />
              {results.rowCount} rows
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-[#2a2a2a] text-[#737373] bg-transparent"
            >
              <Clock className="w-3 h-3 mr-1" />
              {results.executionTime}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg border border-[#2a2a2a] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2a2a2a] hover:bg-transparent">
                {results.columns.map((col) => (
                  <TableHead
                    key={col}
                    className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider bg-[#111111] h-8"
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.rows.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f]"
                >
                  {row.map((cell, cellIdx) => (
                    <TableCell
                      key={cellIdx}
                      className="text-sm text-[#a3a3a3] font-mono py-2.5"
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
