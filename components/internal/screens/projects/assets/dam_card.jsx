"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package, Layers, File, Eye, HardDrive } from "lucide-react";
import { damFeatures } from "./data";

const featureIconMap = { Layers, File, Eye, HardDrive };

export function DamCard() {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] hover:border-[#474747] transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Digital Asset Manager</CardTitle>
            <CardDescription className="text-[#525252] text-xs mt-1">
              Advanced asset management
            </CardDescription>
          </div>
          <Package className="w-4 h-4 text-[#525252]" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm text-[#a3a3a3]">
          Open the full DAM for versioning, AI tagging, bulk actions, and granular access controls.
        </p>
        <Button className="w-full bg-white text-black hover:bg-[#e7e7e7]" asChild>
          <a href="#">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open In DAM
          </a>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          {damFeatures.map((feature) => {
            const Icon = featureIconMap[feature.iconKey];
            return (
              <div key={feature.label} className="flex items-center gap-2 p-2 rounded-md bg-[#242424] border border-[#2a2a2a]">
                <Icon className="w-3.5 h-3.5 text-[#525252]" />
                <span className="text-xs text-[#737373]">{feature.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
