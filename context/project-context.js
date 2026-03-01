"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const ProjectContext = createContext();

export const projectsData = [
  {
    id: "aabackup",
    name: "aabackup",
    provider: "AWS",
    region: "ap-south-1",
    status: "PAUSED",
  },
  {
    id: "anime-alley",
    name: "Anime Alley",
    provider: "AWS",
    region: "ap-south-1",
    status: "PAUSED",
  },
  {
    id: "books",
    name: "Books",
    provider: "AWS",
    region: "ap-south-1",
    status: "PAUSED",
  },
  {
    id: "geiger-studio",
    name: "Geiger Studio",
    provider: "AWS",
    region: "ap-south-1",
    status: "ACTIVE",
    tags: ["ACTIVE", "NANO"],
  },
];

import { createClient } from "@/lib/supabase/client";

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectInfo = useCallback(async (id) => {
    console.log("[project-context] fetchProjectInfo triggered for:", id);
    setLoading(true);
    const supabase = createClient();
    const { data: foundProject, error } = await supabase
      .from("flow_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[project-context] fetch error:", error.message || error, error.code);
    }

    if (foundProject) {
      console.log("[project-context] project found:", foundProject.name);
      setProject(foundProject);
    } else {
      console.log("[project-context] project not found, using fallback for:", id);
      setProject({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
        status: "UNKNOWN",
      });
    }
    setLoading(false);
  }, []);

  return (
    <ProjectContext.Provider value={{ project, setProject, fetchProjectInfo, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
