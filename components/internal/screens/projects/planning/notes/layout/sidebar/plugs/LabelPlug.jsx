"use client";

import React, { useState, useEffect } from "react";
import { Type } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { SidebarButton } from "../SidebarPrimitives";

export const LabelPlug = ({
  value,
  onChange,
  title = "Label Text",
  placeholder = "Type something...",
}) => {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    onChange(newVal);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarButton icon={Type} label="Label" active={!!value} />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-72 bg-surface-dialog border-border p-4 shadow-2xl rounded-xl"
      >
        <div className="flex flex-col gap-3">
          <Label className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold">
            {title}
          </Label>
          <div className="relative">
            <Input
              className="bg-surface-subtle/50 border-border text-foreground focus:border-border-strong focus:ring-ring/20 transition-all font-medium"
              value={localValue}
              onChange={handleChange}
              placeholder={placeholder}
              autoFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
