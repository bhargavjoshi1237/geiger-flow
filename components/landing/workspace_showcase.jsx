import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";

const projects = [
  { name: "Geiger Design System", count: 4, active: true },
  { name: "Mobile App v2", count: 7 },
  { name: "Marketing Site", count: 2 },
];

const columns = [
  {
    label: "Backlog",
    dotClass: "bg-muted-foreground",
    issues: [
      { id: "GDS-12", title: "Refine color token system", tag: "Design" },
      { id: "MOB-03", title: "Push notification setup", tag: "Feature" },
      { id: "GDS-15", title: "Update icon grid", tag: "Design" },
    ],
  },
  {
    label: "In Progress",
    dotClass: "bg-blue-400",
    issues: [
      { id: "GDS-08", title: "Dark mode token audit", tag: "Feature" },
      { id: "MOB-07", title: "Fix date picker locale", tag: "Bug" },
    ],
  },
  {
    label: "Review",
    dotClass: "bg-amber-400",
    issues: [
      { id: "MKT-02", title: "Redesign hero section", tag: "Feature" },
      { id: "GDS-11", title: "Typography scale", tag: "Design" },
    ],
  },
  {
    label: "Done",
    dotClass: "bg-emerald-400",
    issues: [
      { id: "GDS-04", title: "Auth flow fix", tag: "Bug" },
      { id: "MOB-01", title: "Logo update", tag: "Feature" },
    ],
  },
];

const tagColors = {
  Design: "text-indigo-400 bg-indigo-400/10",
  Feature: "text-blue-400 bg-blue-400/10",
  Bug: "text-red-400 bg-red-400/10",
};

export default function LandingWorkspaceShowcase({ backgroundImage } = {}) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-surface-subtle bg-cover bg-center bg-no-repeat p-3 sm:rounded-3xl sm:p-6 md:p-8 xl:p-10"
      style={backgroundImage ? { backgroundImage: `url('${backgroundImage}')` } : undefined}
    >
      <div className="absolute inset-0 bg-[#080808]/75" />
      <div className="relative z-10 flex flex-col gap-6 sm:gap-10">
        <div className="mx-auto mb-4 mt-4 flex w-[92%] flex-col items-start gap-4 sm:mb-6 sm:mt-6 sm:w-[90%]">
          <h3 className="text-3xl font-semibold leading-tight text-foreground">
            See your workflow come to life.
          </h3>
          <p className="max-w-sm text-[#bcbcbc]">
            Track projects, manage issues, and keep your team aligned — all in one workspace built for how modern teams actually work.
          </p>
          <Link
            href="/org"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Flow
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative rounded-2xl border border-border/80 bg-background/70 p-2 shadow-2xl backdrop-blur-md sm:p-3">
          <div className="h-[430px] overflow-hidden rounded-xl border border-border bg-background sm:h-[460px] lg:h-[600px] flex">
            {/* Mini sidebar */}
            <div className="w-44 shrink-0 border-r border-border bg-surface-subtle p-3 flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                Projects
              </p>
              {projects.map((p) => (
                <div
                  key={p.name}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-default select-none ${
                    p.active
                      ? "bg-surface-active text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs truncate flex-1">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.count}</span>
                </div>
              ))}
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto p-4">
              <div className="flex gap-3 h-full" style={{ minWidth: "560px" }}>
                {columns.map((col) => (
                  <div key={col.label} className="flex flex-col gap-2 w-[155px] shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotClass}`} />
                      <span className="text-xs font-medium text-muted-foreground">{col.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{col.issues.length}</span>
                    </div>
                    {col.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-lg border border-border bg-surface-subtle p-2.5 cursor-default select-none"
                      >
                        <p className="text-xs text-foreground leading-snug mb-2">{issue.title}</p>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              tagColors[issue.tag] || "text-muted-foreground bg-surface-hover"
                            }`}
                          >
                            {issue.tag}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{issue.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
