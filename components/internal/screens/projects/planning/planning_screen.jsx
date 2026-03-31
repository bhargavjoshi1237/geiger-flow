"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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

export function PlanningScreen() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "center",
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          },
          eds
        )
      );
    },
    [setEdges]
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

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
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

  const zoomLevel = useMemo(() => {
    if (!reactFlowInstance) return 1;
    return reactFlowInstance.getViewport().zoom;
  }, [reactFlowInstance, nodes, edges]);

  const proOptions = { hideAttribution: true };

  return (
    <div className="w-full h-[calc(100dvh-180px)] relative rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#161616]">
      <ReactFlow
        ref={reactFlowWrapper}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
        <Background
          color="#2a2a2a"
          gap={24}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="!bg-[#1e1e1e] !border-[#2a2a2a] !rounded-lg [&>button]:!bg-[#1e1e1e] [&>button]:!border-[#2a2a2a] [&>button]:!text-[#737373] [&>button:hover]:!bg-[#2a2a2a] [&>button:hover]:!text-[#e7e7e7] [&>button]:!border-b [&>button:last-child]:!border-b-0"
        />
        <Panel position="top-center" className="!m-0 !p-0 pt-3">
          <PlanningToolbar
            onAddNode={onAddNode}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onFitView={onFitView}
            zoomLevel={zoomLevel}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
}
