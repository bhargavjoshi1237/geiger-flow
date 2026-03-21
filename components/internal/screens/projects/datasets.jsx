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
  const datasets = [
    // {
    //   name: "Customer Demographics",
    //   type: "CSV",
    //   size: "24.5 MB",
    //   status: "Active",
    // },
    // {
    //   name: "Sales Transactions",
    //   type: "Postgres",
    //   size: "1.2 GB",
    //   status: "Syncing",
    // },
    // { name: "Marketing Leads", type: "JSON", size: "8.2 MB", status: "Active" },
  ];
  const hasDatasets = datasets.length > 0;

  const handleSaveActivity = async (activity) => {
    console.log("Saving dataset activity:", activity);
    // Add your save logic here
  };

  return (
    <MainScreenWrapper className="text-primary">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Datasets</h1>
          <p className="text-secondary mt-1">
            Manage your data sources and datasets.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Dataset
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        <Table>
          <TableHeader className="bg-surface-hover">
            <TableRow className="border-border hover:bg-surface-hover">
              <TableHead className="text-muted">Name</TableHead>
              <TableHead className="text-muted">Type</TableHead>
              <TableHead className="text-muted">Size</TableHead>
              <TableHead className="text-muted">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((ds) => (
              <TableRow
                key={ds.name}
                className="border-border hover:bg-surface-hover"
              >
                <TableCell className="font-medium text-primary flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted" />
                  {ds.name}
                </TableCell>
                <TableCell className="text-muted">{ds.type}</TableCell>
                <TableCell className="text-muted">{ds.size}</TableCell>
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
