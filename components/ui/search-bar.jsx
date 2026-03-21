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

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 pr-8 bg-surface border-subtle text-foreground placeholder:text-muted focus-visible:ring-0 focus-visible:border-emphasis h-10 rounded-xl"
      />
      {value && value.length > 0 && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted hover:text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
