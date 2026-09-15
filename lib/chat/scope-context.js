"use client";

// Scope context for the chat workspace behind the Grounding screen.
//
// Chat was ported from geiger-chat, where conversations were scoped to an
// organization. In Flow the scope is the project: every conversation, profile
// lookup and channel bootstrap is keyed on the project the user is currently
// in, so each project gets its own chat circle.
//
// The project itself is owned by ProjectProvider (context/project-context.js);
// this is the thin adapter that exposes it under the shape the chat components
// consume (currentProjectId / currentProject / loading). Keeping it separate
// means the chat tree never reaches into Flow's project context directly.

import React, { createContext, useContext, useMemo } from "react";
import { useOptionalProject } from "@/context/project-context";

const ChatScopeContext = createContext(null);

export function ChatScopeProvider({ children, projectId: projectIdProp = null }) {
  const projectCtx = useOptionalProject();
  const project = projectCtx?.project ?? null;
  const loading = projectCtx?.loading ?? false;

  // An explicit projectId prop wins, so the standalone /chat/<id> route can
  // scope itself before the project record has finished loading.
  const projectId = projectIdProp || project?.id || null;

  const value = useMemo(
    () => ({
      currentProjectId: projectId,
      currentProject: projectId
        ? { id: projectId, name: project?.name || "Project" }
        : null,
      loading,
    }),
    [projectId, project?.name, loading],
  );

  return (
    <ChatScopeContext.Provider value={value}>{children}</ChatScopeContext.Provider>
  );
}

// Current chat scope. Safe outside a provider — callers get a null project and
// render their own empty/loading state rather than crashing.
export function useChatScope() {
  return (
    useContext(ChatScopeContext) ?? {
      currentProjectId: null,
      currentProject: null,
      loading: false,
    }
  );
}
