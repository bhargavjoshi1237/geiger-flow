"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FilterDropdown() {
  const [filter, setFilter] = useState("1d");

  const filterLabels = {
    "1d": "Last 1 day",
    "1w": "Last 1 week",
    "1m": "Last 1 month",
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-[#202020] border-[#2a2a2a] text-[#ededed] hover:bg-[#1a1a1a] text-xs h-8 px-3 rounded-md font-medium"
          >
            {filterLabels[filter]}{" "}
            <ChevronDown className="w-3.5 h-3.5 ml-2 text-[#737373]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
          <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
            <DropdownMenuRadioItem
              value="1d"
              className="text-xs focus:bg-[#2a2a2a] focus:text-[#ededed] cursor-pointer"
            >
              1 Day
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="1w"
              className="text-xs focus:bg-[#2a2a2a] focus:text-[#ededed] cursor-pointer"
            >
              1 Week
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="1m"
              className="text-xs focus:bg-[#2a2a2a] focus:text-[#ededed] cursor-pointer"
            >
              1 Month
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
