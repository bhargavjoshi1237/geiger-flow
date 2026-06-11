"use client";

import React, { useEffect, useState } from "react";

export default function DigitalClock({ animated = true }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const update = () => setTime(new Date());
    update();

    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    return (
      <div className="px-2 py-0.5 text-[11px] font-mono text-text-secondary">
        --:--:--
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden flex items-center justify-center px-2 py-0.5 rounded-md bg-surface-card/50 border border-border-strong/50 hover:bg-surface-card hover:border-zinc-600 transition-all duration-300 cursor-default min-w-[92px]">
      {animated && (
        <div className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
      <span className="relative z-10 text-[11px] font-mono font-medium text-foreground tabular-nums tracking-wider uppercase">
        {time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })}
      </span>
    </div>
  );
}
