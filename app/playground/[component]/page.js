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
    // data-playground-floating also clears the body background (globals.css), so the iframe shows the host behind it.
    <div
      data-playground-floating={floating || undefined}
      className={`h-[100dvh] w-full overflow-hidden ${floating ? "" : "bg-background"}`}
    >
      <FlowComponentLoader component={component} />
    </div>
  );
}
