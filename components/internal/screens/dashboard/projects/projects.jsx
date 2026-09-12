"use client";

import React, { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Copy,
  Layers,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Settings,
  FolderKanban,
  Trash2,
} from "lucide-react";
import { ProjectItem } from "./project";
import Link from "next/link";
import { NewProjectDialog } from "@/components/internal/dilouges/projects/newproject_dilouge";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { ActionMenu } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { LogoLoading } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { ensureUserOrganization } from "@/lib/supabase/organization";

const PROJECT_STATUS_MAP = {
  ACTIVE: { label: "Active", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  ARCHIVED: { label: "Archived", variant: "neutral" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

function createProjectSlug(name) {
  const baseSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseSlug || "project"}-${crypto.randomUUID().slice(0, 8)}`;
}

export function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[projects] fetch error:", error);
    }

    if (data) {
      const formattedProjects = data.map((p) => ({
        ...p,
        provider: p.provider || p.metadata?.provider || "AWS",
        region: p.region || p.metadata?.region || "ap-south-1",
        status: p.status || p.metadata?.status || "ACTIVE",
        tags: p.tags?.length ? p.tags : p.metadata?.tags || ["ACTIVE"],
      }));
      setProjects(formattedProjects);
    } else {
      setProjects([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void Promise.resolve().then(fetchProjects);
  }, []);

  const handleCreateProject = async (details) => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[projects] user lookup error:", userError);
      return false;
    }

    let organizationId;

    try {
      organizationId = await ensureUserOrganization(supabase);
    } catch (organizationError) {
      console.error(
        "[projects] organization setup error:",
        organizationError,
      );
      return false;
    }

    const newProject = {
      organization_id: organizationId,
      name: details.name.trim(),
      slug: createProjectSlug(details.name),
      logo_url: details.logo.trim() || null,
      provider: details.provider,
      region: details.region.trim(),
      status: "ACTIVE",
      tags: ["ACTIVE"],
      created_by: user.id,
      metadata: {
        vault: details.vaultSettings,
      },
    };

    const { data, error } = await supabase
      .from("projects")
      .insert([newProject])
      .select()
      .single();

    if (error) {
      console.error("[projects] insert error:", error);
      return false;
    }

    if (data) {
      const { error: teamError } = await supabase
        .from("flow_teams")
        .insert([
          {
            organization_id: organizationId,
            project_id: data.id,
            name: "Core Team",
            members: [],
          },
        ]);

      if (teamError) {
        console.warn("[flow_teams] insert warning:", teamError);
      }

      await fetchProjects();
    }

    return true;
  };

  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Project ID copied to clipboard.");
    } catch {
      toast.error("Couldn't copy the project ID.");
    }
  };

  const handleDelete = async (project) => {
    setDeleteTarget(null);
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) {
      console.error("[projects] delete error:", error);
      toast.error("Couldn't delete the project on the server.");
      await fetchProjects();
    } else {
      toast.success(`Deleted "${project.name}".`);
    }
  };

  const filteredProjects = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = (project.name ?? "")
        .toLowerCase()
        .includes(needle);
      const matchesStatus =
        statusFilter === "all" ||
        (project.status ?? "").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const pager = usePagination(filteredProjects, {
    resetKey: `${search}|${statusFilter}|${viewMode}`,
  });

  const stats = useMemo(() => {
    const count = (s) =>
      projects.filter((p) => (p.status ?? "").toUpperCase() === s).length;
    return [
      {
        label: "Total projects",
        value: String(projects.length),
        footer: `${count("ACTIVE")} active now`,
      },
      {
        label: "Active",
        value: String(count("ACTIVE")),
        footer: "Running in production",
      },
      {
        label: "Paused",
        value: String(count("PAUSED")),
        footer: "Temporarily stopped",
      },
      {
        label: "Archived",
        value: String(count("ARCHIVED")),
        footer: "Kept for reference",
      },
    ];
  }, [projects]);

  const columns = [
    {
      key: "project",
      header: "Project",
      render: (project) => (
        <Link href={`/project/${project.id}`}>
          <div className="flex cursor-pointer items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-hover text-muted-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {project.name}
              </div>
              <div className="text-xs text-text-secondary">
                {project.provider} • {project.region}
              </div>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: "environment",
      header: "Environment",
      render: () => (
        <Badge variant="neutral">
          Production
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (project) => (
        <StatusPill
          status={(project.status ?? "").toUpperCase()}
          map={PROJECT_STATUS_MAP}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (project) => (
        <ActionMenu
          label={`Actions for ${project.name}`}
          items={[
            {
              icon: Pencil,
              label: "Edit",
              href: `/project/${project.id}`,
            },
            {
              icon: Copy,
              label: "Copy Id",
              onSelect: () => handleCopyId(project.id),
            },
            {
              icon: Settings,
              label: "Settings",
              href: `/project/${project.id}`,
            },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setDeleteTarget(project),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Projects"
        description="Create, search, and manage workspace projects."
        actions={
          <NewProjectDialog onCreate={handleCreateProject}>
            <Button className="flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="h-4 w-4 font-bold text-primary-foreground stroke-[3]" />
              New project
            </Button>
          </NewProjectDialog>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search for a project…"
          />
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-subtle p-1">
            <Button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-surface-hover text-foreground shadow-sm"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-surface-hover text-foreground shadow-sm"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} />
          Loading projects…
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-5">
          {pager.pageItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface-subtle">
              <EmptyState
                icon={FolderKanban}
                title="No projects found"
                description="Create your first project to get started."
                action={
                  <NewProjectDialog onCreate={handleCreateProject}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4" /> New project
                    </Button>
                  </NewProjectDialog>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pager.pageItems.map((project) => (
                <ProjectItem
                  key={project.id}
                  {...project}
                  onCopyId={handleCopyId}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
          <ListPagination {...pager} itemLabel="projects" />
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(p) => p.id}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={FolderKanban}
                  title="No projects found"
                  description="Create your first project to get started."
                  action={
                    <NewProjectDialog onCreate={handleCreateProject}>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> New project
                      </Button>
                    </NewProjectDialog>
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="projects" />
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => handleDelete(deleteTarget)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default ProjectsScreen;
