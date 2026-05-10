import React from "react";

const Reactions = ({ reactions = {}, onReactionClick }) => {
  const reactionEntries = Object.entries(reactions).filter(
    ([_, count]) => count > 0,
  );

  if (reactionEntries.length === 0) return null;

  return (
    <div className="absolute -bottom-3 right-2 flex flex-row-reverse flex-wrap gap-1.5 z-20 pointer-events-auto">
      {reactionEntries.map(([emoji, count]) => (
        <button
          key={emoji}
          title={`${count} reactions`}
          className={`
            group flex items-center gap-1.5 
            bg-zinc-900/80 backdrop-blur-md 
            hover:bg-zinc-800 transition-all duration-300 
            px-2 py-1 rounded-lg text-xs 
            border border-zinc-700/50 hover:border-zinc-500
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
          <span className="font-medium text-zinc-300 tabular-nums">
            {count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Reactions;
