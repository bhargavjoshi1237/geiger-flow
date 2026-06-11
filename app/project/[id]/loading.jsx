export default function Loading() {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background items-center justify-center gap-3">
      <div className="w-5 h-5 rounded-full border-2 border-border-strong border-t-foreground animate-spin" />
      <span className="text-text-tertiary text-sm">Loading project...</span>
    </div>
  );
}
