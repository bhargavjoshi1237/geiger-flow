export default function Loading() {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#161616] items-center justify-center gap-3">
      <div className="w-5 h-5 rounded-full border-2 border-[#474747] border-t-[#e7e7e7] animate-spin" />
      <span className="text-[#525252] text-sm">Loading project...</span>
    </div>
  );
}
