"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useProject } from "@/context/project-context";
import {
  createIssue,
  duplicateIssue,
  listIssues,
  softDeleteIssue,
  updateIssue,
} from "@/features/issues/actions";
import { listMilestones } from "@/features/milestones/actions";
import { listObjectives } from "@/features/objectives/actions";
import { listActivityLogs } from "@/features/activity_logs/actions";
import { getUser } from "@/lib/supabase/user";
import {
  getProfilesByIds,
  listOrgMembers,
  profileFromUser,
} from "@/lib/supabase/profiles";
import { projectKeyFor } from "@/features/issues/constants";
import { isCompleted, toLinearPriority, toLinearStatus } from "./constants";

// One fetch of the whole tracker, shared by every view in the shell.
//
// Linear's Cycles / Projects / Initiatives map onto tables this app already
// owns rather than new ones: flow.milestones are cycles (a dated window with a
// task roll-up) and flow.objectives are projects (owner, status, progress,
// start/target). An issue carries its cycle/project association in the
// metadata bag as `cycleId` / `objectiveId`, promoted to first-class fields by
// the data layer alongside type/estimate.

const TrackerContext = createContext(null);

// Issues arrive with legacy vocabulary; normalise once here so no view has to.
function decorate(issue) {
  if (!issue) return null;
  return {
    ...issue,
    status: toLinearStatus(issue.status),
    priority: toLinearPriority(issue.priority),
    subscribed: Array.isArray(issue.watchers) ? issue.watchers : [],
  };
}

export function TrackerProvider({ children }) {
  const { project } = useProject();
  const projectId = project?.id;
  const organizationId = project?.organization_id;

  const [issues, setIssues] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [me, setMe] = useState(null);
  // Loading is derived, not stored: the fetch stamps the id it resolved for,
  // so a project switch is "loading" again without a setState in the effect.
  const [loadedFor, setLoadedFor] = useState(null);
  const loading = !projectId || loadedFor !== projectId;

  const reloadIssues = useCallback(async () => {
    if (!projectId) return;
    const rows = await listIssues(projectId);
    setIssues((rows ?? []).map(decorate));
  }, [projectId]);

  useEffect(() => {
    void getUser().then((user) => {
      if (user) setMe(profileFromUser(user));
    });
  }, []);

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;

    void Promise.all([
      listIssues(projectId),
      listMilestones(projectId),
      listObjectives(projectId),
      listActivityLogs(projectId),
    ]).then(([issueRows, cycleRows, projectRows, activityRows]) => {
      if (cancelled) return;
      setIssues((issueRows ?? []).map(decorate));
      setCycles(cycleRows ?? []);
      setProjects(projectRows ?? []);
      setActivity(activityRows ?? []);
      setLoadedFor(projectId);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!organizationId) return;
    void listOrgMembers(organizationId).then((rows) => setMembers(rows ?? []));
  }, [organizationId]);

  // Assignees can be workspace users who aren't org members (or whose profile
  // row is missing), so backfill anything the member list didn't cover.
  useEffect(() => {
    const ids = new Set();
    for (const issue of issues) {
      for (const id of issue.assignees ?? []) ids.add(id);
      if (issue.createdBy) ids.add(issue.createdBy);
    }
    for (const member of members) ids.delete(member.id);
    const missing = [...ids].filter((id) => !profiles[id]);
    if (missing.length === 0) return;
    void getProfilesByIds(missing).then((map) => {
      setProfiles((current) => ({ ...current, ...map }));
    });
  }, [issues, members, profiles]);

  const peopleById = useMemo(() => {
    const map = { ...profiles };
    for (const member of members) map[member.id] = member;
    if (me) map[me.id] = { ...map[me.id], ...me };
    return map;
  }, [members, profiles, me]);

  const people = useMemo(() => {
    const seen = new Map();
    const all = [...(me ? [me] : []), ...members, ...Object.values(profiles)];
    for (const person of all) {
      if (person?.id && !seen.has(person.id)) seen.set(person.id, person);
    }
    return [...seen.values()];
  }, [me, members, profiles]);

  const projectKey = useMemo(() => projectKeyFor(project), [project]);

  // --- Mutations: optimistic, persisted, reconciled on failure. -------------

  const patchIssue = useCallback(
    async (id, patch, { silent = false } = {}) => {
      const previous = issues.find((issue) => issue.id === id);
      if (!previous) return null;

      setIssues((current) =>
        current.map((issue) =>
          issue.id === id ? decorate({ ...issue, ...patch }) : issue,
        ),
      );

      // updateIssue carries every metadata key it wasn't handed over from the
      // stored bag, so a single-field patch is safe to send as-is.
      const saved = await updateIssue(id, patch);
      if (!saved) {
        setIssues((current) =>
          current.map((issue) => (issue.id === id ? previous : issue)),
        );
        toast.error("Couldn't save that change.");
        return null;
      }
      setIssues((current) =>
        current.map((issue) => (issue.id === id ? decorate(saved) : issue)),
      );
      if (!silent) toast.success("Issue updated");
      return decorate(saved);
    },
    [issues],
  );

  const addIssue = useCallback(
    async (input) => {
      if (!projectId) return null;
      const id = crypto.randomUUID();
      const optimistic = decorate({
        id,
        projectId,
        number: null,
        title: input.title,
        description: input.description ?? "",
        status: input.status ?? "backlog",
        priority: input.priority ?? "none",
        labels: input.labels ?? [],
        assignees: input.assignees ?? [],
        dueDate: input.dueDate ?? null,
        estimate: input.estimate ?? "",
        type: input.type ?? "task",
        cycleId: input.cycleId ?? null,
        objectiveId: input.objectiveId ?? null,
        metadata: {},
        createdBy: me?.id ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setIssues((current) => [optimistic, ...current]);

      const created = await createIssue(projectId, input);

      if (!created) {
        setIssues((current) => current.filter((issue) => issue.id !== id));
        toast.error("Couldn't create the issue.");
        return null;
      }

      setIssues((current) =>
        current.map((issue) => (issue.id === id ? decorate(created) : issue)),
      );
      return decorate(created);
    },
    [projectId, me],
  );

  const removeIssue = useCallback(
    async (id) => {
      const previous = issues;
      setIssues((current) => current.filter((issue) => issue.id !== id));
      const ok = await softDeleteIssue(id);
      if (!ok) {
        setIssues(previous);
        toast.error("Couldn't delete the issue.");
        return false;
      }
      toast.success("Issue deleted");
      return true;
    },
    [issues],
  );

  const copyIssue = useCallback(async (id) => {
    const created = await duplicateIssue(id);
    if (!created) {
      toast.error("Couldn't duplicate the issue.");
      return null;
    }
    setIssues((current) => [decorate(created), ...current]);
    toast.success("Issue duplicated");
    return decorate(created);
  }, []);

  const counts = useMemo(
    () => ({
      all: issues.length,
      open: issues.filter((issue) => !isCompleted(issue.status)).length,
      mine: issues.filter(
        (issue) =>
          me &&
          (issue.assignees ?? []).includes(me.id) &&
          !isCompleted(issue.status),
      ).length,
      triage: issues.filter(
        (issue) =>
          issue.status === "backlog" && (issue.assignees ?? []).length === 0,
      ).length,
    }),
    [issues, me],
  );

  const value = useMemo(
    () => ({
      project,
      projectId,
      projectKey,
      issues,
      cycles,
      projects,
      activity,
      people,
      peopleById,
      me,
      loading,
      counts,
      addIssue,
      patchIssue,
      removeIssue,
      copyIssue,
      reloadIssues,
    }),
    [
      project,
      projectId,
      projectKey,
      issues,
      cycles,
      projects,
      activity,
      people,
      peopleById,
      me,
      loading,
      counts,
      addIssue,
      patchIssue,
      removeIssue,
      copyIssue,
      reloadIssues,
    ],
  );

  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}
