import React from "react";
import { Button } from "@geiger/ui";

const Reactions = ({ reactions = {}, onReactionClick }) => {
  const reactionEntries = Object.entries(reactions).filter(
    ([_, count]) => count > 0,
  );

  if (reactionEntries.length === 0) return null;

  return (
    <div className="absolute -bottom-3 right-2 flex flex-row-reverse flex-wrap gap-1.5 z-20 pointer-events-auto">
      {reactionEntries.map(([emoji, count]) => (
        <Button
          key={emoji}
          title={`${count} reactions`}
          className={`
            group flex items-center gap-1.5 
            bg-surface-subtle/80 backdrop-blur-md
            hover:bg-surface-card transition-all duration-300
            px-2 py-1 rounded-lg text-xs 
            border border-border-strong/50 hover:border-zinc-500
            shadow-lg shadow-black/20
            animate-in fade-in zoom-in duration-300
          `}
          onClick={(e) => {
            e.stopPropagation();
            onReactionClick(emoji);
          }}
        >
          <span className="text-sm transform group-hover:scale-125 transition-transform duration-300">
            {emoji}
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {count}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default Reactions;
