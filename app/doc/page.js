import { ArrowLeft, FolderKanban, LifeBuoy, MessageCircle } from "lucide-react";
import { projectNav } from "@/components/internal/sidebar/projects/sidebar_data";

export default function DocPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        {/* /org is geiger-dash's zone — plain anchor, outside Flow's basePath. */}
        <a
          href="/org"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to organization
        </a>

        <h1 className="mt-6 text-xl font-semibold text-foreground">
          Documentation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Everything in Flow lives as tabs inside a project. Open a project to
          reach the sections below.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-surface-subtle p-2">
          {projectNav.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            >
              <item.icon className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-surface-subtle p-2">
          <a
            href="/org"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-active transition-colors"
          >
            <FolderKanban className="size-4 text-muted-foreground shrink-0" />
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground">
                Working in a project
              </span>
              <span className="text-xs text-muted-foreground">
                Pick an organization to open a project and reach its overview,
                tasks, planning, office files, and settings tabs
              </span>
            </span>
          </a>
          <a
            href="mailto:feedback@geiger.studio"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-active transition-colors"
          >
            <MessageCircle className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Send feedback
            </span>
          </a>
          <a
            href="mailto:help@geiger.studio"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-active transition-colors"
          >
            <LifeBuoy className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Help &amp; support
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
