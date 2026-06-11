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
    <MainScreenWrapper className="text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Datasets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your data sources and datasets.
          </p>
        </div>
        <AddActivityDialog onSave={handleSaveActivity}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Dataset
          </Button>
        </AddActivityDialog>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-surface-subtle">
        <Table>
          <TableHeader className="bg-surface-active">
            <TableRow className="border-border hover:bg-surface-active">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Size</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((ds) => (
              <TableRow
                key={ds.name}
                className="border-border hover:bg-surface-hover"
              >
                <TableCell className="font-medium text-foreground flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  {ds.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{ds.type}</TableCell>
                <TableCell className="text-muted-foreground">{ds.size}</TableCell>
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
