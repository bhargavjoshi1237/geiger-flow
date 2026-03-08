"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Calendar, ArrowRight, Plus } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function ProjectionsScreen() {
  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Projections</h1>
          <p className="text-[#a3a3a3] mt-1">
            View project forecasts based on current velocity and historical data.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="w-4 h-4 mr-2" />
          Add Projection
        </Button>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#a3a3a3]">
        <div className="flex flex-col items-center gap-2">
          <TrendingUp className="w-12 h-12 opacity-20" />
          <span>Projections Placeholder</span>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
