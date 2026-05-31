"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { AddActivityDialog } from "@/components/internal/dilouges/activities/add_activity_dilouge";

export function DatasetsScreen() {
  const datasets = [];

  const handleSaveActivity = async () => {
  };

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Datasets</h1>
          <p className="text-[#a3a3a3] mt-1">
            Manage your data sources and datasets.
          </p>
        </div>
        <AddActivityDialog onSave={handleSaveActivity}>
          <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Plus className="w-4 h-4 mr-2" />
            Add Dataset
          </Button>
        </AddActivityDialog>
      </div>

      <div className="border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#1a1a1a]">
        <Table>
          <TableHeader className="bg-[#242424]">
            <TableRow className="border-[#2a2a2a] hover:bg-[#242424]">
              <TableHead className="text-[#a3a3a3]">Name</TableHead>
              <TableHead className="text-[#a3a3a3]">Type</TableHead>
              <TableHead className="text-[#a3a3a3]">Size</TableHead>
              <TableHead className="text-[#a3a3a3]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((ds) => (
              <TableRow
                key={ds.name}
                className="border-[#2a2a2a] hover:bg-[#2a2a2a]"
              >
                <TableCell className="font-medium text-[#e7e7e7] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#a3a3a3]" />
                  {ds.name}
                </TableCell>
                <TableCell className="text-[#a3a3a3]">{ds.type}</TableCell>
                <TableCell className="text-[#a3a3a3]">{ds.size}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-500 border border-green-500/20">
                    {ds.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainScreenWrapper>
  );
}
