import FlowPlaygroundLoader from "@/components/landing/playground/flow_playground_loader";

// The landing-page playground, served on its own route so geiger-dash (and any
// other showcase) can embed it in an iframe. The frame keeps the workspace's
// dialogs, sheets, menus and toasts — all portalled to <body> with fixed
// positioning — inside the showcase card instead of covering the host page.
export const metadata = {
  title: "Flow Playground - Geiger Studio",
  robots: { index: false, follow: false },
};

export default function FlowPlaygroundPage() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-background">
      <FlowPlaygroundLoader />
    </div>
  );
}
