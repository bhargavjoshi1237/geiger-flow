"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { ExternalLink, Package, Layers, File, Eye, HardDrive } from "lucide-react";
import { damFeatures } from "./data";

const featureIconMap = { Layers, File, Eye, HardDrive };

export function DamCard() {
  return (
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Digital Asset Manager</CardTitle>
            <CardDescription className="text-text-tertiary text-xs mt-1">
              Advanced asset management
            </CardDescription>
          </div>
          <Package className="w-4 h-4 text-text-tertiary" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary" asChild>
          <a href="#">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open In DAM
          </a>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          {damFeatures.map((feature) => {
            const Icon = featureIconMap[feature.iconKey];
            return (
              <div key={feature.label} className="flex items-center gap-2 p-2 rounded-md bg-surface-active border border-border">
                <Icon className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-xs text-text-secondary">{feature.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
