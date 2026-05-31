import React from "react";
import { Calendar } from "lucide-react";

export function DeadlinesSection({ deadlines = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-semibold text-[#e7e7e7] tracking-tight leading-tight">
            Upcoming Deadlines
          </h2>
          <p className="text-xs text-[#737373]">
            Tasks requiring immediate attention
          </p>
        </div>
      </div>

      {deadlines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#202020] p-10 text-center">
          <Calendar className="mx-auto mb-3 h-6 w-6 text-[#525252]" />
          <p className="text-sm font-medium text-[#e7e7e7]">No deadlines yet</p>
          <p className="mt-1 text-xs text-[#737373]">
            Upcoming deadlines will appear here after backend data is connected.
          </p>
        </div>
      ) : null}
    </div>
  );
}
