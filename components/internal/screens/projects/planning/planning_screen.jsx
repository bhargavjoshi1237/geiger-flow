"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  SelectionMode,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Check,
  Copy,
  FileText,
  Layers3,
  Pencil,
  PanelLeft,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button, LogoLoading } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Avatar, AvatarFallback } from "@geiger/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useProject } from "@/context/project-context";
import {
  getPlanningBoard,
  savePlanningBoard,
} from "@/features/planning/actions";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import NotesSidebar from "./notes/layout/Sidebar";
import CustomNode from "./notes/nodes/CustomNode";
import CommentNode from "./notes/nodes/CommentNode";
import LinkNode from "./notes/nodes/LinkNode";
import BoardNode from "./notes/nodes/BoardNode";
import DocumentNode from "./notes/nodes/DocumentNode";
import ImageNode from "./notes/nodes/ImageNode";
import FileNode from "./notes/nodes/FileNode";
import CalendarNode from "./notes/nodes/calendar/CalendarNode";
import ClockNode from "./notes/nodes/clock/ClockNode";
import CenterEdge from "./notes/edges/CenterEdge";

const nodeTypes = {
  custom: CustomNode,
  comment: CommentNode,
  link: LinkNode,
  board: BoardNode,
  document: DocumentNode,
  image: ImageNode,
  file: FileNode,
  calendar: CalendarNode,
  clock: ClockNode,
};

const edgeTypes = {
  center: CenterEdge,
};

function cloneNodes(nodes = []) {
  return nodes.map((node) => ({
    ...node,
    position: node.position ? { ...node.position } : node.position,
    data: node.data ? { ...node.data } : node.data,
    style: node.style ? { ...node.style } : node.style,
  }));
}

function cloneEdges(edges = []) {
  return edges.map((edge) => ({
    ...edge,
    data: edge.data ? { ...edge.data } : edge.data,
    markerEnd: edge.markerEnd ? { ...edge.markerEnd } : edge.markerEnd,
    style: edge.style ? { ...edge.style } : edge.style,
  }));
}

function getUniqueFileName(files, baseName, excludeId) {
  const existingNames = files
    .filter((file) => file.id !== excludeId)
    .map((file) => file.name.toLowerCase());

  if (!existingNames.includes(baseName.toLowerCase())) {
    return baseName;
  }

  let index = 2;
  let candidate = `${baseName} (${index})`;
  while (existingNames.includes(candidate.toLowerCase())) {
    index += 1;
    candidate = `${baseName} (${index})`;
  }
  return candidate;
}

function createPlanningFile({ name, nodes = [], edges = [] }) {
  const now = Date.now();
  return {
    id: `planning-${now}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    createdAt: now,
    updatedAt: now,
  };
}

const INITIAL_NODES = [];

const INITIAL_EDGES = [];

const INITIAL_FILES = [
  createPlanningFile({ name: "Untitled Board" }),
];

function getDefaultNodeStyle(type) {
  switch (type) {
    case "board":
      return { width: 328, height: 68 };
    case "document":
      return { width: 240, height: 68 };
    case "image":
      return { width: 200, height: 250 };
    case "file":
      return { width: 220, height: 80 };
    case "calendar":
      return { width: 220, height: 220 };
    case "comment":
      return { width: 260, height: 120 };
    case "link":
      return { width: 240, height: 80 };
    default:
      return { width: 338, height: 68 };
  }
}

function getDefaultNodeData(type, defaultData = {}) {
  if (type === "board") {
    const boardId = `planning-board-${Date.now()}`;
    return {
      label: "Untitled Board",
      boardId,
      name: "Untitled Board",
      ...defaultData,
    };
  }

  if (type === "image") {
    return {
      label: "Image",
      src: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1000&auto=format&fit=crop",
      alt: "Placeholder Image",
      ...defaultData,
    };
  }

  if (type === "calendar") {
    return {
      calendarTheme: "light",
      calendarStyle: "default",
      ...defaultData,
    };
  }

  if (type === "file") {
    return {
      label: "File",
      fileName: "No file selected",
      fileSize: 0,
      fileType: "",
      src: null,
      ...defaultData,
    };
  }

  return defaultData;
}

export function PlanningScreen() {
  const { resolvedTheme } = useTheme();
  const [planningFiles, setPlanningFiles] = useState(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState(INITIAL_FILES[0].id);
  const [filesOpen, setFilesOpen] = useState(true);

  const [nodes, setNodes] = useState(() => cloneNodes(INITIAL_FILES[0].nodes));
  const [edges, setEdges] = useState(() => cloneEdges(INITIAL_FILES[0].edges));

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [renameFileId, setRenameFileId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const activeFileIdRef = useRef(activeFileId);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  // --- Board persistence (flow.planning_boards) -----------------------------
  //
  // The board row mirrors the ACTIVE planning file in nodes/edges/viewport;
  // the full file list + active id ride along in the metadata bag so every
  // file survives a reload. Autosave is debounced (~1.2s quiet period) and
  // skipped until the initial load has finished; the first synthetic change
  // caused by hydration (e.g. the fitView/setViewport onMove) is swallowed.

  const { project } = useProject();
  const projectId = project?.id;

  const [boardLoading, setBoardLoading] = useState(true);
  // null | "saving" | "saved" — drives the subtle header indicator.
  const [saveStatus, setSaveStatus] = useState(null);

  const loadedRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  const saveTimerRef = useRef(null);
  const viewportRef = useRef(null);
  const pendingViewportRef = useRef(null);
  const planningFilesRef = useRef(planningFiles);
  const projectIdRef = useRef(projectId);
  const saveFailedRef = useRef(false);

  useEffect(() => {
    planningFilesRef.current = planningFiles;
  }, [planningFiles]);

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  const buildBoardPayload = useCallback(() => {
    const activeId = activeFileIdRef.current;

    return {
      nodes: cloneNodes(nodesRef.current),
      edges: cloneEdges(edgesRef.current),
      viewport: viewportRef.current,
      metadata: {
        activeFileId: activeId,
        files: planningFilesRef.current.map((file) =>
          file.id === activeId
            ? {
                ...file,
                nodes: cloneNodes(nodesRef.current),
                edges: cloneEdges(edgesRef.current),
                updatedAt: Date.now(),
              }
            : file
        ),
      },
    };
  }, []);

  const runSave = useCallback(async () => {
    if (!projectIdRef.current || !loadedRef.current) return;

    setSaveStatus("saving");
    const result = await savePlanningBoard(
      projectIdRef.current,
      buildBoardPayload()
    );

    if (result) {
      saveFailedRef.current = false;
      setSaveStatus("saved");
    } else {
      // One toast per failure burst — retry happens on the next change.
      if (!saveFailedRef.current) {
        toast.error("Couldn't save the board.");
      }
      saveFailedRef.current = true;
      setSaveStatus(null);
    }
  }, [buildBoardPayload]);

  useEffect(() => {
    if (saveStatus !== "saved") return undefined;
    const timer = setTimeout(() => setSaveStatus(null), 2000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  const scheduleSave = useCallback(() => {
    if (!loadedRef.current) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void runSave();
    }, 1200);
  }, [runSave]);

  // Load the persisted board on mount / project change.
  useEffect(() => {
    let active = true;

    if (!projectId) {
      loadedRef.current = true;
      void Promise.resolve().then(() => {
        if (active) setBoardLoading(false);
      });
      return () => {
        active = false;
      };
    }

    loadedRef.current = false;
    skipNextSaveRef.current = false;

    void Promise.resolve().then(async () => {
      setBoardLoading(true);
      const board = await getPlanningBoard(projectId);
      if (!active) return;

      if (board) {
        const metadata = board.metadata ?? {};
        const savedFiles =
          Array.isArray(metadata.files) && metadata.files.length > 0
            ? metadata.files
            : null;
        const files = (
          savedFiles || [
            {
              id: `planning-restored-${board.id}`,
              name: "Untitled Board",
              nodes: board.nodes,
              edges: board.edges,
              createdAt: board.createdAt,
            },
          ]
        ).map((file) => ({
          ...file,
          nodes: cloneNodes(file.nodes),
          edges: cloneEdges(file.edges),
          createdAt: file.createdAt ?? Date.now(),
          updatedAt: file.updatedAt ?? file.createdAt ?? Date.now(),
        }));

        const nextActiveId =
          metadata.activeFileId && files.some((file) => file.id === metadata.activeFileId)
            ? metadata.activeFileId
            : files[0].id;
        const nextActiveFile = files.find((file) => file.id === nextActiveId);

        setPlanningFiles(files);
        setActiveFileId(nextActiveId);
        setNodes(cloneNodes(nextActiveFile.nodes));
        setEdges(cloneEdges(nextActiveFile.edges));
        pendingViewportRef.current = board.viewport ?? null;
      }

      // Swallow the first synthetic change fired by hydration (viewport apply).
      skipNextSaveRef.current = true;
      loadedRef.current = true;
      setBoardLoading(false);
    });

    return () => {
      active = false;
    };
  }, [projectId]);

  // Apply the saved canvas viewport once react-flow is initialized.
  useEffect(() => {
    if (!reactFlowInstance || boardLoading) return undefined;

    const viewport = pendingViewportRef.current;
    if (!viewport) return undefined;

    pendingViewportRef.current = null;
    const timer = setTimeout(() => {
      reactFlowInstance.setViewport(viewport);
    }, 0);

    return () => clearTimeout(timer);
  }, [reactFlowInstance, boardLoading]);

  // Flush a pending debounced save when the screen unmounts.
  useEffect(
    () => () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        void savePlanningBoard(projectIdRef.current, buildBoardPayload());
      }
    },
    [buildBoardPayload]
  );

  const activeFile = useMemo(
    () =>
      planningFiles.find((file) => file.id === activeFileId) || planningFiles[0],
    [planningFiles, activeFileId]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

  const persistGraphForFile = useCallback((fileId, nextNodes, nextEdges) => {
    setPlanningFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              nodes: cloneNodes(nextNodes),
              edges: cloneEdges(nextEdges),
              updatedAt: Date.now(),
            }
          : file
      )
    );
    scheduleSave();
  }, [scheduleSave]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((prev) => {
        const next = applyNodeChanges(changes, prev);
        persistGraphForFile(activeFileIdRef.current, next, edgesRef.current);
        return next;
      });
    },
    [persistGraphForFile]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((prev) => {
        const next = applyEdgeChanges(changes, prev);
        persistGraphForFile(activeFileIdRef.current, nodesRef.current, next);
        return next;
      });
    },
    [persistGraphForFile]
  );

  const switchToFile = useCallback(
    (fileId) => {
      const targetFile = planningFiles.find((file) => file.id === fileId);
      if (!targetFile) return;

      setActiveFileId(fileId);
      setNodes(cloneNodes(targetFile.nodes));
      setEdges(cloneEdges(targetFile.edges));
      setRenameFileId(null);
      setRenameValue("");

      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2 });
      }, 0);
    },
    [planningFiles, reactFlowInstance]
  );

  const handleSelectFile = useCallback(
    (fileId) => {
      if (fileId === activeFileIdRef.current) return;

      persistGraphForFile(activeFileIdRef.current, nodesRef.current, edgesRef.current);
      switchToFile(fileId);
    },
    [persistGraphForFile, switchToFile]
  );

  const handleCreateFile = useCallback(() => {
    const baseName = `Planning file ${planningFiles.length + 1}`;
    const nextName = getUniqueFileName(planningFiles, baseName);
    const newFile = createPlanningFile({ name: nextName });

    persistGraphForFile(activeFileIdRef.current, nodesRef.current, edgesRef.current);

    setPlanningFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNodes(cloneNodes(newFile.nodes));
    setEdges(cloneEdges(newFile.edges));
    setRenameFileId(newFile.id);
    setRenameValue(newFile.name);

    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.35 });
    }, 0);
  }, [planningFiles, persistGraphForFile, reactFlowInstance]);

  const handleDuplicateFile = useCallback(
    (fileId = activeFileIdRef.current) => {
      const source = planningFiles.find((file) => file.id === fileId);
      if (!source) return;

      persistGraphForFile(activeFileIdRef.current, nodesRef.current, edgesRef.current);

      const duplicateName = getUniqueFileName(planningFiles, `${source.name} Copy`);
      const duplicatedFile = createPlanningFile({
        name: duplicateName,
        nodes: source.nodes,
        edges: source.edges,
      });

      setPlanningFiles((prev) => [...prev, duplicatedFile]);
      setActiveFileId(duplicatedFile.id);
      setNodes(cloneNodes(duplicatedFile.nodes));
      setEdges(cloneEdges(duplicatedFile.edges));
      setRenameFileId(null);
      setRenameValue("");

      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2 });
      }, 0);
    },
    [planningFiles, persistGraphForFile, reactFlowInstance]
  );

  const handleDeleteFile = useCallback(
    (fileId = activeFileIdRef.current) => {
      if (planningFiles.length <= 1) return;

      if (fileId !== activeFileIdRef.current) {
        setPlanningFiles((prev) => prev.filter((file) => file.id !== fileId));
        if (renameFileId === fileId) {
          setRenameFileId(null);
          setRenameValue("");
        }
        scheduleSave();
        return;
      }

      const removingIndex = planningFiles.findIndex((file) => file.id === fileId);
      const nextActiveFile =
        planningFiles[removingIndex + 1] || planningFiles[removingIndex - 1];

      setPlanningFiles((prev) => prev.filter((file) => file.id !== fileId));

      if (nextActiveFile) {
        setActiveFileId(nextActiveFile.id);
        setNodes(cloneNodes(nextActiveFile.nodes));
        setEdges(cloneEdges(nextActiveFile.edges));
      }

      setRenameFileId(null);
      setRenameValue("");
    },
    [planningFiles, renameFileId, scheduleSave]
  );

  const handleStartRename = useCallback((file) => {
    setRenameFileId(file.id);
    setRenameValue(file.name);
  }, []);

  const handleCancelRename = useCallback(() => {
    setRenameFileId(null);
    setRenameValue("");
  }, []);

  const handleCommitRename = useCallback(
    (fileId) => {
      const targetFile = planningFiles.find((file) => file.id === fileId);
      if (!targetFile) {
        handleCancelRename();
        return;
      }

      const trimmed = renameValue.trim();
      const nextName =
        trimmed.length > 0
          ? getUniqueFileName(planningFiles, trimmed, fileId)
          : targetFile.name;

      setPlanningFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                name: nextName,
                updatedAt: Date.now(),
              }
            : file
        )
      );

      setRenameFileId(null);
      setRenameValue("");
      scheduleSave();
    },
    [planningFiles, renameValue, handleCancelRename, scheduleSave]
  );

  useEffect(() => {
    if (planningFiles.some((file) => file.id === activeFileId) || !planningFiles[0]) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setActiveFileId(planningFiles[0].id);
      setNodes(cloneNodes(planningFiles[0].nodes));
      setEdges(cloneEdges(planningFiles[0].edges));
    }, 0);

    return () => clearTimeout(timer);
  }, [planningFiles, activeFileId]);

  const onConnect = useCallback(
    (params) => {
      setEdges((prev) => {
        const next = addEdge(
          {
            ...params,
            type: "center",
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          },
          prev
        );
        persistGraphForFile(activeFileIdRef.current, nodesRef.current, next);
        return next;
      });
    },
    [persistGraphForFile]
  );

  const onAddNode = useCallback(
    (nodeType) => {
      const viewport = reactFlowInstance?.getViewport();
      const zoom = viewport?.zoom || 1;
      const x = (viewport?.x || 0) / -zoom + 400;
      const y = (viewport?.y || 0) / -zoom + 200;

      const newNode = {
        id: `node-${Date.now()}`,
        type: nodeType.type,
        position: { x, y },
        data: getDefaultNodeData(nodeType.type, nodeType.defaultData),
        style: getDefaultNodeStyle(nodeType.type),
      };

      setNodes((prev) => {
        const next = [...prev, newNode];
        persistGraphForFile(activeFileIdRef.current, next, edgesRef.current);
        return next;
      });
    },
    [reactFlowInstance, persistGraphForFile]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type, {}),
        style: getDefaultNodeStyle(type),
      };

      setNodes((prev) => {
        const next = [...prev, newNode];
        persistGraphForFile(activeFileIdRef.current, next, edgesRef.current);
        return next;
      });
    },
    [reactFlowInstance, persistGraphForFile],
  );

  const onNodeDragStop = useCallback(
    (_, node) => {
      setNodes((prev) => {
        const next = prev.map((item) => {
          if (item.id !== node.id) return item;

          return {
            ...item,
            position: {
              x: Math.round(item.position.x / 15) * 15,
              y: Math.round(item.position.y / 15) * 15,
            },
          };
        });

        persistGraphForFile(activeFileIdRef.current, next, edgesRef.current);
        return next;
      });
    },
    [persistGraphForFile],
  );

  const onZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const onZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const onFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  const selectedEdge = useMemo(() => edges.find((edge) => edge.selected), [edges]);
  const selectedNode = useMemo(() => nodes.find((node) => node.selected), [nodes]);

  const updateEdge = useCallback((edgeId, updates) => {
    setEdges((prev) => {
      const next = prev.map((edge) => (edge.id === edgeId ? { ...edge, ...updates } : edge));
      persistGraphForFile(activeFileIdRef.current, nodesRef.current, next);
      return next;
    });
  }, [persistGraphForFile]);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes((prev) => {
      const next = prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node));
      persistGraphForFile(activeFileIdRef.current, next, edgesRef.current);
      return next;
    });
  }, [persistGraphForFile]);

  const deselectEdges = useCallback(() => {
    setEdges((prev) => prev.map((edge) => ({ ...edge, selected: false })));
  }, []);

  const deselectNodes = useCallback(() => {
    setNodes((prev) => prev.map((node) => ({ ...node, selected: false })));
  }, []);

  const proOptions = { hideAttribution: true };
  const collaborators = [];

  return (
    <MainScreenWrapper className="max-w-none space-y-0 px-0 py-0 lg:max-w-none">
      <div className="relative h-[calc(100dvh-8rem)] min-h-[640px] overflow-hidden rounded-xl border border-border bg-background text-foreground">
        {boardLoading ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
            <LogoLoading size={40} label="Loading board" />
          </div>
        ) : null}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeDragStop={onNodeDragStop}
          onInit={(instance) => {
            setReactFlowInstance(instance);
            setZoomLevel(instance.getViewport().zoom);
          }}
          onMove={(_, viewport) => {
            viewportRef.current = viewport;
            setZoomLevel(viewport.zoom);
            scheduleSave();
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          zoomOnScroll={false}
          fitView
          fitViewOptions={{ padding: 0.18, maxZoom: 0.8 }}
          proOptions={proOptions}
          minZoom={0.1}
          maxZoom={2}
          deleteKeyCode={["Backspace", "Delete"]}
          multiSelectionKeyCode="Shift"
          selectionMode={SelectionMode.Partial}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
          zoomOnDoubleClick={false}
          className="planning-notes-canvas bg-background"
          defaultEdgeOptions={{
            type: "center",
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          }}
        >
          <Background color="var(--canvas-dots)" gap={14} size={1} variant="dots" />
        </ReactFlow>

        <header className="absolute left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilesOpen((value) => !value)}
              className="h-8 w-8 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              title="Toggle planning files"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 border-l border-border pl-3">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground">Planning</h1>
                <span className="hidden text-xs text-text-tertiary sm:inline">/</span>
                <span className="hidden max-w-[260px] truncate text-sm text-muted-foreground sm:inline">
                  {activeFile?.name || "Planning file"}
                </span>
              </div>
              <p className="hidden text-xs text-text-secondary md:block">
                Map project dependencies on a clean shared canvas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              aria-live="polite"
              className={cn(
                "text-xs text-text-tertiary transition-opacity duration-200",
                !saveStatus && "opacity-0"
              )}
            >
              {saveStatus === "saving" ? "Saving…" : "Saved"}
            </span>
            <div className="flex -space-x-2">
              {collaborators.map((user) => (
                <Avatar
                  key={user.initials}
                  title={user.name}
                  className="h-8 w-8 border-2 border-background shadow-sm"
                >
                  <AvatarFallback className={cn("text-[11px] font-bold", user.color)}>
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </header>

        <style jsx global>{`
          .planning-notes-canvas .react-flow__node {
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        `}</style>

        <div className="absolute bottom-0 left-0 top-14 z-40">
          <NotesSidebar
            selectedEdge={selectedEdge}
            onUpdateEdge={updateEdge}
            onDeselect={deselectEdges}
            selectedNode={selectedNode}
            onUpdateNode={updateNode}
            onDeselectNode={deselectNodes}
          />
        </div>

        <aside
          className={cn(
            "absolute bottom-4 left-20 top-[4.5rem] z-40 flex w-[292px] flex-col overflow-hidden rounded-xl border border-border/70 bg-background/70 backdrop-blur-md transition-transform duration-300",
            filesOpen ? "translate-x-0" : "-translate-x-[calc(100%+5rem)]",
          )}
        >
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/70 px-3">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Files</span>
              <span className="text-xs text-text-tertiary">{planningFiles.length}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateFile}
              className="h-7 w-7 text-text-secondary hover:bg-surface-active hover:text-foreground"
              title="Create file"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {planningFiles.map((file) => {
              const isActive = file.id === activeFileId;
              const isRenaming = renameFileId === file.id;

              return (
                <div
                  key={file.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectFile(file.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelectFile(file.id);
                    }
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 transition-colors",
                    isActive
                      ? "border-border-strong bg-surface-active"
                      : "border-transparent bg-transparent hover:border-border hover:bg-surface-card",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-text-secondary" />
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <Input
                          value={renameValue}
                          onChange={(event) => setRenameValue(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onBlur={() => handleCommitRename(file.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleCommitRename(file.id);
                            }
                            if (event.key === "Escape") {
                              event.preventDefault();
                              handleCancelRename();
                            }
                          }}
                          autoFocus
                          className="h-7 w-full border-border bg-background px-2 text-sm text-foreground focus-visible:border-border-strong focus-visible:ring-0"
                        />
                      ) : (
                        <>
                          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                          <p className="truncate text-[11px] text-text-tertiary">
                            {file.nodes.length} nodes | {file.edges.length} links | {dateFormatter.format(new Date(file.updatedAt))}
                          </p>
                        </>
                      )}
                    </div>

                    {isRenaming ? (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCommitRename(file.id);
                          }}
                          className="h-7 w-7 text-text-secondary hover:bg-surface-active hover:text-foreground"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCancelRename();
                          }}
                          className="h-7 w-7 text-text-secondary hover:bg-surface-active hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center gap-0.5 opacity-70">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStartRename(file);
                          }}
                          className="h-7 w-7 text-text-tertiary hover:bg-surface-hover hover:text-foreground"
                          title="Rename file"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDuplicateFile(file.id);
                          }}
                          className="h-7 w-7 text-text-tertiary hover:bg-surface-hover hover:text-foreground"
                          title="Duplicate file"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={planningFiles.length <= 1}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="h-7 w-7 text-text-tertiary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-35"
                          title="Delete file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div
          className={cn(
            "absolute bottom-4 z-40 flex overflow-hidden rounded-lg border border-border/70 bg-surface-strong/60 shadow-xl backdrop-blur-md transition-all duration-300",
            filesOpen ? "left-[384px]" : "left-20",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            className="h-9 w-9 rounded-none border-r border-border/70 text-muted-foreground hover:bg-border-strong/60 hover:text-foreground"
            title="Zoom out"
          >
            <span className="text-lg leading-none">-</span>
          </Button>
          <Button
            type="button"
            onClick={onFitView}
            className="h-9 min-w-14 border-r border-border/70 px-3 font-mono text-[11px] text-foreground hover:bg-border-strong/60"
            title="Fit to view"
          >
            {Math.round(zoomLevel * 100)}%
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            className="h-9 w-9 rounded-none text-muted-foreground hover:bg-border-strong/60 hover:text-foreground"
            title="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
