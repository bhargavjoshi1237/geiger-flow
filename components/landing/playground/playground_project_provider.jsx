"use client";

import React, { useMemo } from "react";
import { ProjectContext } from "@/context/project-context";
import { DEMO_PROJECT } from "@/supabase/demo/fixtures";

// Serves the fixture project through the same context the real ProjectProvider
// fills, so every screen's `useProject()` works untouched — no fetch, no UUID
// gate, no loading phase.
//
// `fetchProjectInfo` is deliberately inert: the real provider clears the project
// when an id doesn't resolve, and nothing in the playground should be able to
// trigger that. The fixture id is a valid v4 UUID, so even if it were called it
// would resolve to the fixture row.
export function PlaygroundProjectProvider({ children }) {
  const value = useMemo(
    () => ({
      project: DEMO_PROJECT,
      setProject: () => {},
      fetchProjectInfo: async () => {},
      loading: false,
      notFound: false,
    }),
    [],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export default PlaygroundProjectProvider;
