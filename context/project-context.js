"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const ProjectContext = createContext();

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectInfo = useCallback(async (id) => {
    setLoading(true);
    let foundProject = null;

    if (UUID_PATTERN.test(id)) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("flow_projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      foundProject = data;

      if (error) {
        console.error("[project-context] fetch error:", error.message || error, error.code);
      }
    }

    if (foundProject) {
      setProject(foundProject);
    } else {
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
