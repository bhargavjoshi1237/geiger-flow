// filepath: components/ui/search-bar.jsx
"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className,
  onClear,
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
  };
  
  const iconOffsetClass = "left-[var(--input-box-padding-x)]";
  const rightOffsetClass = "right-[var(--input-box-padding-x)]";
  const inputIconPaddingClass =
    "pl-[calc(var(--input-box-padding-x)+16px+var(--input-box-icon-gap))] pr-[calc(var(--input-box-padding-x)+16px+var(--input-box-icon-gap))]";

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none",
          iconOffsetClass,
        )}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          inputIconPaddingClass,
          "bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] focus-visible:ring-0 focus-visible:border-[#474747]",
        )}
      />
      {value && value.length > 0 && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] hover:text-white transition-colors",
            rightOffsetClass,
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
