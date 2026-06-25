"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  ChevronDown,
  Plus,
  LayoutGrid,
  List,
  Layers,
  MoreVertical,
  Copy,
  Settings,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { ProjectItem } from "./project";
import { Input } from "@/components/ui/input";
import { NewProjectDialog } from "@/components/internal/dilouges/projects/newproject_dilouge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { Button } from "@/components/ui/button";
import { ensureUserOrganization } from "@/lib/supabase/organization";

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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = (project.name ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (project.status ?? "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-foreground">
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Projects
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, search, and manage workspace projects.
          </p>
        </div>
        <NewProjectDialog onCreate={handleCreateProject}>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors w-fit">
            <Plus className="w-4 h-4 text-primary-foreground font-bold stroke-[3]" />
            New project
          </Button>
        </NewProjectDialog>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              type="text"
              placeholder="Search for a project"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full !pl-10 !pr-4 !py-[7px] bg-surface-subtle border border-border text-foreground text-sm rounded-sm focus:outline-none focus:border-border-strong transition-colors placeholder:text-text-tertiary"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 bg-surface-card border border-border text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-sm text-sm font-medium transition-colors group cursor-pointer">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                  {statusFilter === "all" ? "Status" : statusFilter}
                </span>
                <ChevronDown className="w-4 h-4 text-text-tertiary group-hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-surface-subtle border-border text-foreground">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem
                  value="all"
                  className="cursor-pointer focus:bg-surface-hover"
                >
                  All Statuses
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="active"
                  className="cursor-pointer focus:bg-surface-hover"
                >
                  Active
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="paused"
                  className="cursor-pointer focus:bg-surface-hover"
                >
                  Paused
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="archived"
                  className="cursor-pointer focus:bg-surface-hover"
                >
                  Archived
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 bg-surface-subtle rounded-lg p-1 shrink-0">
          <Button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-surface-hover text-foreground shadow-sm"
                : "hover:bg-surface-hover text-text-secondary"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-surface-hover text-foreground shadow-sm"
                : "hover:bg-surface-hover text-text-secondary"
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 w-full text-text-secondary">
          Loading projects...
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center p-8 text-text-secondary">
              No projects found.
            </div>
          ) : (
            filteredProjects.map((project, idx) => (
              <ProjectItem key={idx} {...project} />
            ))
          )}
        </div>
      ) : (
        <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-subtle border-border">
                <TableHead>Project</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-text-secondary"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project, idx) => (
                  <TableRow
                    key={idx}
                    className="border-border hover:bg-surface-active"
                  >
                    <TableCell>
                      <Link href={`/project/${project.id}`}>
                        <div className="flex items-center gap-3 cursor-pointer group/item">
                          <div className="w-8 h-8 rounded-md bg-surface-hover border border-border flex items-center justify-center text-muted-foreground group-hover/item:border-border-strong transition-colors">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover/item:text-foreground transition-colors">
                              {project.name}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {project.provider} • {project.region}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-muted-foreground bg-surface-hover px-2 py-1 rounded border border-border">
                        Production
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border bg-surface-subtle">
                          {project.status === "ACTIVE" ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${project.status === "ACTIVE" ? "text-green-400" : "text-text-secondary"}`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="text-text-secondary hover:text-foreground p-1 rounded-md hover:bg-surface-hover transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[160px] bg-surface-card border-border text-foreground p-1"
                        >
                          <DropdownMenuItem className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="text-xs">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-1.5">
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-xs">Copy Id</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-1.5">
                            <Settings className="w-3.5 h-3.5" />
                            <span className="text-xs">Settings</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-surface-hover" />
                          <DropdownMenuItem className="cursor-pointer focus:bg-red-500/10 focus:text-red-500 flex items-center gap-2 px-2 py-1.5 text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </MainScreenWrapper>
  );
}
