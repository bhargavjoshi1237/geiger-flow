import FlowComponentLoader from "@/components/landing/playground/flow_component_loader";
import {
  FLOATING_PLAYGROUND_COMPONENT_IDS,
  PLAYGROUND_COMPONENT_IDS,
} from "@/components/landing/playground/playground_components";

// One Flow component on its own route (/playground/tasks, /playground/add-task…),
// so the suite Help Center can embed just that piece, interactive, in an iframe.
export const metadata = {
  title: "Flow Playground - Geiger Studio",
  robots: { index: false, follow: false },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return PLAYGROUND_COMPONENT_IDS.map((component) => ({ component }));
}

export default async function FlowComponentPage({ params }) {
  const { component } = await params;
  const floating = FLOATING_PLAYGROUND_COMPONENT_IDS.includes(component);
  return (
    <div className={`h-[100dvh] w-full overflow-hidden ${floating ? "" : "bg-background"}`}>
      {/* Unlayered, so it beats the base body background and the iframe shows the host page behind it. */}
      {floating ? <style>{"html,body{background:transparent}"}</style> : null}
      <FlowComponentLoader component={component} />
    </div>
  );
}
