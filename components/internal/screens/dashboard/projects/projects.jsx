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
      .from("flow_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow_projects] fetch error:", error);
    }

    if (data) {
      const formattedProjects = data.map((p) => ({
        ...p,
        provider: p.metadata?.provider || "AWS",
        region: p.metadata?.region || "ap-south-1",
        status: p.metadata?.status || "ACTIVE",
        tags: p.metadata?.tags || ["ACTIVE"],
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
    const { data: userData } = await supabase.auth.getUser();

    const newProject = {
      name: details.name,
      logo: details.logo || null,
      owner_user: userData?.user?.id || null,
      metadata: {
        provider: details.provider,
        region: details.region,
        status: "ACTIVE",
        tags: ["ACTIVE"],
      },
    };

    const { data, error } = await supabase
      .from("flow_projects")
      .insert([newProject])
      .select()
      .single();

    if (error) {
      console.error("[flow_projects] insert error:", error);
      return;
    }

    if (data) {
      const { error: teamError } = await supabase
        .from("flow_teams")
        .insert([{ id: data.id, members: [] }]);

      if (teamError) {
        console.warn("[flow_teams] insert warning:", teamError);
      }

      await fetchProjects();
    }
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
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#e7e7e7] tracking-tight">
            Projects
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            Create, search, and manage workspace projects.
          </p>
        </div>
        <NewProjectDialog onCreate={handleCreateProject}>
          <Button className="bg-[#e7e7e7] hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors w-fit">
            <Plus className="w-4 h-4 text-black font-bold stroke-[3]" />
            New project
          </Button>
        </NewProjectDialog>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <Input
              type="text"
              placeholder="Search for a project"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full !pl-10 !pr-4 !py-[7px] bg-[#1a1a1a] border border-[#2a2a2a] text-[#e7e7e7] text-sm rounded-sm focus:outline-none focus:border-[#474747] transition-colors placeholder:text-[#525252]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 bg-[#202020] border border-[#2a2a2a] text-[#a3a3a3] hover:text-[#e7e7e7] px-3 py-1.5 rounded-sm text-sm font-medium transition-colors group cursor-pointer">
                <span className="text-[#a3a3a3] group-hover:text-[#e7e7e7] transition-colors capitalize">
                  {statusFilter === "all" ? "Status" : statusFilter}
                </span>
                <ChevronDown className="w-4 h-4 text-[#525252] group-hover:text-[#e7e7e7] transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7]">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem
                  value="all"
                  className="cursor-pointer focus:bg-[#2a2a2a]"
                >
                  All Statuses
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="active"
                  className="cursor-pointer focus:bg-[#2a2a2a]"
                >
                  Active
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="paused"
                  className="cursor-pointer focus:bg-[#2a2a2a]"
                >
                  Paused
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="archived"
                  className="cursor-pointer focus:bg-[#2a2a2a]"
                >
                  Archived
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1 shrink-0">
          <Button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-[#2a2a2a] text-[#e7e7e7] shadow-sm"
                : "hover:bg-[#2a2a2a] text-[#737373]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-[#2a2a2a] text-[#e7e7e7] shadow-sm"
                : "hover:bg-[#2a2a2a] text-[#737373]"
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 w-full text-zinc-500">
          Loading projects...
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center p-8 text-zinc-500">
              No projects found.
            </div>
          ) : (
            filteredProjects.map((project, idx) => (
              <ProjectItem key={idx} {...project} />
            ))
          )}
        </div>
      ) : (
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1a1a1a] border-[#2a2a2a]">
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
                    className="text-center py-8 text-zinc-500"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project, idx) => (
                  <TableRow
                    key={idx}
                    className="border-[#2a2a2a] hover:bg-[#242424]"
                  >
                    <TableCell>
                      <Link href={`/project/${project.id}`}>
                        <div className="flex items-center gap-3 cursor-pointer group/item">
                          <div className="w-8 h-8 rounded-md bg-[#2a2a2a] border border-[#333333] flex items-center justify-center text-[#a3a3a3] group-hover/item:border-[#474747] transition-colors">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#e7e7e7] group-hover/item:text-white transition-colors">
                              {project.name}
                            </div>
                            <div className="text-xs text-[#737373]">
                              {project.provider} • {project.region}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-[#c0c0c0] bg-[#2a2a2a] px-2 py-1 rounded border border-[#333333]">
                        Production
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-[#2a2a2a] bg-[#1a1a1a]">
                          {project.status === "ACTIVE" ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${project.status === "ACTIVE" ? "text-green-400" : "text-[#737373]"}`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="text-[#737373] hover:text-[#e7e7e7] p-1 rounded-md hover:bg-[#2a2a2a] transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[160px] bg-[#212121] border-[#2a2a2a] text-[#e7e7e7] p-1"
                        >
                          <DropdownMenuItem className="cursor-pointer focus:bg-[#323232] focus:text-[#e7e7e7] flex items-center gap-2 px-2 py-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="text-xs">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer focus:bg-[#323232] focus:text-[#e7e7e7] flex items-center gap-2 px-2 py-1.5">
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-xs">Copy Id</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer focus:bg-[#323232] focus:text-[#e7e7e7] flex items-center gap-2 px-2 py-1.5">
                            <Settings className="w-3.5 h-3.5" />
                            <span className="text-xs">Settings</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
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
