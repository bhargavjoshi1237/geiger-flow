import { LogoLoading } from "@geiger/ui";

export default function Loading() {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background items-center justify-center gap-3">
      <LogoLoading size={72} />
      <span className="text-text-tertiary text-sm">Loading project...</span>
    </div>
  );
}
