"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Reusable Empty State component for cases like "No Team Members", "No Projects", etc.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - The top icon or component (e.g., Avatar stack)
 * @param {string} props.title - Main heading
 * @param {string} props.description - Subtext description
 * @param {string} props.actionLabel - Label for the primary action button
 * @param {() => void} props.onAction - Callback for the action button
 * @param {string} [props.className] - Optional container classes
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#2a2a2a] bg-[#121212]/50",
      className
    )}>
      {icon && (
        <div className="mb-6">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-[#e7e7e7] mb-2">
        {title}
      </h3>
      
      <p className="text-[#a3a3a3] text-base mb-8 max-w-sm">
        {description}
      </p>

      {actionLabel && (
        <Button 
          onClick={onAction}
          className="bg-[#e7e7e7] hover:bg-zinc-200 text-black px-3 py-3 rounded-xl text-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5 text-black font-bold stroke-[3]" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
