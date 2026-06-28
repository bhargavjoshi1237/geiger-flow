"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const ProjectContext = createContext();

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchProjectInfo = useCallback(async (id) => {
    setLoading(true);
    setNotFound(false);

    // Strict project id: data only loads for an id that resolves to a real
    // row in `public.projects`. A non-uuid id (e.g. "1") can never match the
    // uuid `id` column, so we short-circuit it as not found rather than
    // querying with an invalid uuid.
    if (!UUID_PATTERN.test(id)) {
      setProject(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[project-context] fetch error:", error.message || error, error.code);
    }

    if (data) {
      setProject(data);
      setNotFound(false);
    } else {
      setProject(null);
      setNotFound(true);
    }
    setLoading(false);
  }, []);

  return (
    <ProjectContext.Provider value={{ project, setProject, fetchProjectInfo, loading, notFound }}>
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
