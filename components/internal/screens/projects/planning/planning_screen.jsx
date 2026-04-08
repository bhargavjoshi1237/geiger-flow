"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Check,
  Copy,
  FileText,
  Layers3,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import CustomNode from "./nodes/custom_node";
import TaskNode from "./nodes/task_node";
import NoteNode from "./nodes/note_node";
import GroupNode from "./nodes/group_node";
import CenterEdge from "./edges/center_edge";
import { PlanningToolbar } from "./planning_toolbar";

const nodeTypes = {
  custom: CustomNode,
  taskNode: TaskNode,
  noteNode: NoteNode,
  groupNode: GroupNode,
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

const INITIAL_NODES = [
  {
    id: "node-1",
    type: "custom",
    position: { x: 250, y: 50 },
    data: { label: "Project Planning Board", textAlign: "center", bold: true },
    style: { width: 338, height: 68 },
  },
  {
    id: "node-2",
    type: "taskNode",
    position: { x: 100, y: 220 },
    data: { label: "Design System Setup", nodeType: "task", status: "progress" },
    style: { width: 260, height: 80 },
  },
  {
    id: "node-3",
    type: "taskNode",
    position: { x: 450, y: 220 },
    data: { label: "API Integration", nodeType: "task", status: "todo" },
    style: { width: 260, height: 80 },
  },
  {
    id: "node-4",
    type: "groupNode",
    position: { x: 80, y: 400 },
    data: { label: "Phase 1" },
    style: { width: 600, height: 300 },
  },
  {
    id: "node-5",
    type: "noteNode",
    position: { x: 120, y: 460 },
    data: { label: "Remember to sync milestones with the project timeline", color: "#f59e0b" },
    style: { width: 220, height: 100 },
  },
  {
    id: "node-6",
    type: "noteNode",
    position: { x: 400, y: 460 },
    data: { label: "Review security requirements before deployment", color: "#3b82f6" },
    style: { width: 220, height: 100 },
  },
];

const INITIAL_EDGES = [
  {
    id: "e1-2",
    source: "node-1",
    target: "node-2",
    type: "center",
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
  },
  {
    id: "e1-3",
    source: "node-1",
    target: "node-3",
    type: "center",
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
  },
  {
    id: "e2-5",
    source: "node-2",
    target: "node-5",
    type: "center",
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
  },
  {
    id: "e3-6",
    source: "node-3",
    target: "node-6",
    type: "center",
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
  },
];

const INITIAL_FILES = [
  {
    id: "planning-main",
    name: "Master Plan",
    nodes: cloneNodes(INITIAL_NODES),
    edges: cloneEdges(INITIAL_EDGES),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function PlanningScreen() {
  const [planningFiles, setPlanningFiles] = useState(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState(INITIAL_FILES[0].id);

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
  }, []);

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
    [planningFiles, renameFileId]
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
    },
    [planningFiles, renameValue, handleCancelRename]
  );

  useEffect(() => {
    if (!planningFiles.some((file) => file.id === activeFileId) && planningFiles[0]) {
      setActiveFileId(planningFiles[0].id);
      setNodes(cloneNodes(planningFiles[0].nodes));
      setEdges(cloneEdges(planningFiles[0].edges));
    }
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
        data: { ...nodeType.defaultData },
      };

      setNodes((prev) => {
        const next = [...prev, newNode];
        persistGraphForFile(activeFileIdRef.current, next, edgesRef.current);
        return next;
      });
    },
    [reactFlowInstance, persistGraphForFile]
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

  const activeSummary = useMemo(
    () => ({
      nodes: nodes.length,
      edges: edges.length,
      files: planningFiles.length,
    }),
    [nodes.length, edges.length, planningFiles.length]
  );

  const proOptions = { hideAttribution: true };

  return (
    <MainScreenWrapper className="max-w-none space-y-5">
      <div className="border-b border-[#2a2a2a] pb-6">
        <h1 className="text-3xl font-bold text-[#e7e7e7]">Planning</h1>
        <p className="mt-1 text-[#a3a3a3]">
          Build multiple planning files, switch context instantly, and map dependencies on a shared canvas.
        </p>
      </div>

      <div className="grid min-h-[calc(100dvh-250px)] grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-[#2a2a2a] bg-[#131313] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">
                Planning files
              </p>
              <p className="text-xs text-[#525252]">{planningFiles.length} total</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateFile}
              className="h-8 w-8 border border-[#2a2a2a] text-[#737373] hover:bg-[#202020] hover:text-[#ededed]"
              title="Create file"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
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
                    "rounded-xl border p-3 transition-all",
                    isActive
                      ? "border-[#3a3a3a] bg-[#1b1b1b]"
                      : "border-[#222] bg-[#171717] hover:border-[#2e2e2e] hover:bg-[#1a1a1a]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <div className="flex items-center gap-1">
                          <input
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
                            className="h-7 w-full rounded-md border border-[#2f2f2f] bg-[#101010] px-2 text-sm text-[#ededed] outline-none focus:border-[#3f3f3f]"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCommitRename(file.id);
                            }}
                            className="h-7 w-7 text-[#737373] hover:bg-[#242424] hover:text-[#ededed]"
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
                            className="h-7 w-7 text-[#737373] hover:bg-[#242424] hover:text-[#ededed]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-sm font-medium text-[#e7e7e7]">{file.name}</p>
                          <p className="mt-0.5 text-[11px] text-[#525252]">
                            {file.nodes.length} nodes / {file.edges.length} links
                          </p>
                        </>
                      )}
                    </div>

                    {!isRenaming && (
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStartRename(file);
                          }}
                          className="h-7 w-7 text-[#525252] hover:bg-[#242424] hover:text-[#a3a3a3]"
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
                          className="h-7 w-7 text-[#525252] hover:bg-[#242424] hover:text-[#a3a3a3]"
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
                          className="h-7 w-7 text-[#525252] hover:bg-red-500/10 hover:text-red-400 disabled:opacity-35"
                          title="Delete file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isRenaming && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[#444]">
                      <FileText className="h-3 w-3" />
                      Updated {dateFormatter.format(new Date(file.updatedAt))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[#242424] bg-[#171717] p-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#737373]">
              <Layers3 className="h-3.5 w-3.5" />
              Active summary
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-[#242424] bg-[#151515] py-2">
                <p className="text-[10px] uppercase tracking-widest text-[#525252]">Files</p>
                <p className="mt-1 text-sm font-semibold text-[#e7e7e7]">{activeSummary.files}</p>
              </div>
              <div className="rounded-lg border border-[#242424] bg-[#151515] py-2">
                <p className="text-[10px] uppercase tracking-widest text-[#525252]">Nodes</p>
                <p className="mt-1 text-sm font-semibold text-[#e7e7e7]">{activeSummary.nodes}</p>
              </div>
              <div className="rounded-lg border border-[#242424] bg-[#151515] py-2">
                <p className="text-[10px] uppercase tracking-widest text-[#525252]">Links</p>
                <p className="mt-1 text-sm font-semibold text-[#e7e7e7]">{activeSummary.edges}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="relative min-h-0 overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(148,163,184,0.15),transparent_38%),radial-gradient(circle_at_95%_100%,rgba(59,130,246,0.12),transparent_42%)]" />

          <div className="relative h-full min-h-[560px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={(instance) => {
                setReactFlowInstance(instance);
                setZoomLevel(instance.getViewport().zoom);
              }}
              onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              zoomOnScroll={false}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={proOptions}
              deleteKeyCode={["Backspace", "Delete"]}
              multiSelectionKeyCode="Shift"
              className="bg-[#161616]"
              defaultEdgeOptions={{
                type: "center",
                markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
              }}
            >
              <Background color="#2a2a2a" gap={24} size={1} />
              <Controls
                showInteractive={false}
                className="!bg-[#1e1e1e] !border-[#2a2a2a] !rounded-lg [&>button]:!bg-[#1e1e1e] [&>button]:!border-[#2a2a2a] [&>button]:!text-[#737373] [&>button:hover]:!bg-[#2a2a2a] [&>button:hover]:!text-[#e7e7e7] [&>button]:!border-b [&>button:last-child]:!border-b-0"
              />
              <Panel position="top-center" className="!m-0 !p-0 pt-3">
                <PlanningToolbar
                  onAddNode={onAddNode}
                  onCreateFile={handleCreateFile}
                  onDuplicateFile={() => handleDuplicateFile()}
                  onDeleteFile={() => handleDeleteFile()}
                  canDeleteFile={planningFiles.length > 1}
                  onZoomIn={onZoomIn}
                  onZoomOut={onZoomOut}
                  onFitView={onFitView}
                  zoomLevel={zoomLevel}
                  activeFileName={activeFile?.name || "Planning file"}
                />
              </Panel>
            </ReactFlow>
          </div>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
