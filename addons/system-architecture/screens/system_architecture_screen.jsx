"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Panel,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import {
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Maximize2,
  Minus,
  Network,
  Plus,
  Save,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProjectBudget } from "@/context/project-budget-context";
import {
  architectureCategories,
  architectureIconMap,
  architectureNodeCatalogue,
} from "../data/node_catalogue";
import {
  providerLogoCatalogue,
  providerLogoCategories,
} from "../data/provider_logo_catalogue";
import { ArchitectureNode } from "../nodes/architecture_node";
import { IconifyLogo } from "../icons/iconify_logo";

const nodeTypes = {
  architectureNode: ArchitectureNode,
};

const proOptions = { hideAttribution: true };

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: "var(--edge-stroke)",
  },
  style: {
    stroke: "var(--edge-stroke)",
    strokeWidth: 1.8,
  },
};

const starterNodes = [
  makeNode("customer", { x: -760, y: -90 }),
  makeNode("cdn", { x: -470, y: -90 }),
  makeNode("web-app", { x: -190, y: -90 }),
  makeNode("api-gateway", { x: 120, y: -90 }),
  makeNode("auth-service", { x: 430, y: -230 }),
  makeNode("microservice", { x: 430, y: -20 }, { label: "Orders Service", meta: "Service boundary" }),
  makeNode("worker", { x: 730, y: 130 }),
  makeNode("database", { x: 730, y: -80 }, { label: "Primary DB", meta: "Transactional" }),
  makeNode("cache", { x: 730, y: -290 }),
  makeNode("message-queue", { x: 430, y: 190 }),
  makeNode("logging", { x: 1030, y: 70 }),
  makeNode("metrics", { x: 1030, y: -150 }),
];

const starterEdges = [
  edge("customer", "cdn"),
  edge("cdn", "web-app"),
  edge("web-app", "api-gateway"),
  edge("api-gateway", "auth-service"),
  edge("api-gateway", "microservice"),
  edge("microservice", "database"),
  edge("microservice", "cache"),
  edge("microservice", "message-queue"),
  edge("message-queue", "worker"),
  edge("microservice", "logging"),
  edge("microservice", "metrics"),
  edge("worker", "logging"),
];

function edge(source, target) {
  return {
    id: `${source}-${target}`,
    source,
    target,
    ...defaultEdgeOptions,
  };
}

function makeNode(templateId, position, overrides = {}) {
  const template = architectureNodeCatalogue.find((item) => item.id === templateId);
  const data = {
    label: template?.label || "System Component",
    category: template?.category || "Architecture",
    description: template?.description || "Architecture component",
    icon: template?.icon || "boxes",
    accent: template?.accent || "#38bdf8",
    meta: template?.category || "Component",
    monthlyCost: overrides.monthlyCost ?? getEstimatedMonthlyCost(template),
    expenseEnabled: overrides.expenseEnabled ?? getEstimatedMonthlyCost(template) > 0,
    ...overrides,
  };

  return {
    id: overrides.id || templateId,
    type: "architectureNode",
    position,
    data,
  };
}

function getEstimatedMonthlyCost(template) {
  const categoryCost = {
    Frontend: 650,
    Backend: 1200,
    Application: 900,
    Data: 1800,
    Messaging: 650,
    Infrastructure: 950,
    Cloud: 800,
    Security: 900,
    DevOps: 500,
    Observability: 700,
    Integration: 450,
    AI: 2200,
    Business: 0,
  };

  const idOverrides = {
    customer: 0,
    operator: 0,
    database: 2200,
    postgres: 1900,
    mysql: 1700,
    "data-warehouse": 3600,
    "vector-db": 2400,
    cache: 760,
    cdn: 420,
    kubernetes: 2600,
    "bare-metal": 3200,
    "cloud-service": 1100,
    "ai-model": 4200,
  };

  if (!template) return 500;
  return idOverrides[template.id] ?? categoryCost[template.category] ?? 500;
}

function nodeToArchitectureExpense(node) {
  return {
    id: node.id,
    name: node.data?.label || "Architecture node",
    category: node.data?.category || "Infrastructure",
    monthlyCost: Number(node.data?.monthlyCost) || 0,
    enabled: node.data?.expenseEnabled !== false && Number(node.data?.monthlyCost) > 0,
    notes: node.data?.description || "",
  };
}

function buildDroppedNode(template, position) {
  const monthlyCost = template.monthlyCost ?? getEstimatedMonthlyCost(template);

  return makeNode(
    template.id,
    position,
    {
      id: `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: template.label,
      category: template.category,
      description: template.description,
      icon: template.icon || "cloud",
      iconifyName: template.iconifyName,
      iconifyId: template.iconifyId,
      accent: template.accent,
      meta: template.category,
      monthlyCost,
      expenseEnabled: template.expenseEnabled ?? monthlyCost > 0,
    },
  );
}

function CatalogueItem({ item, onAdd }) {
  const Icon = architectureIconMap[item.icon] || Boxes;

  const handleDragStart = (event) => {
    event.dataTransfer.setData("application/system-architecture-node", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onAdd(item)}
      variant="ghost"
      className="group flex h-auto min-h-[72px] w-full shrink items-start justify-start gap-3 whitespace-normal rounded-lg border border-border bg-surface-card p-3 text-left transition hover:border-border-strong hover:bg-surface-active"
    >
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
        style={{
          color: item.accent,
          backgroundColor: `${item.accent}14`,
          borderColor: `${item.accent}40`,
        }}
      >
        {item.iconifyName ? (
          <IconifyLogo name={item.iconifyName} className="h-5 w-5" />
        ) : (
          <Icon className="h-4.5 w-4.5" />
        )}
      </span>
      <span className="min-w-0 flex-1 whitespace-normal">
        <span className="block truncate text-sm font-medium text-foreground">
          {item.label}
        </span>
        <span className="mt-1 block line-clamp-2 break-words text-xs leading-4 text-text-secondary">
          {item.description}
        </span>
      </span>
    </Button>
  );
}

function CatalogueSection({ items, categories, activeCategory, onCategoryChange, onAdd }) {
  const groupedItems = useMemo(() => {
    return items.reduce((groups, item) => {
      const key = item.category || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["All", ...categories].map((category) => (
          <Button
            key={category}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={cn(
              "h-8 shrink-0 rounded-md border px-3 text-xs font-medium transition",
              activeCategory === category
                ? "border-foreground bg-primary text-primary-foreground"
                : "border-border bg-surface-card text-muted-foreground hover:border-border-strong hover:bg-surface-active hover:text-foreground",
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                {category}
              </span>
              <span className="text-[11px] text-text-tertiary">{categoryItems.length}</span>
            </div>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <CatalogueItem key={item.id} item={item} onAdd={onAdd} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostInput({ value, onChange, disabled }) {
  const numericValue = Number(value) || 0;
  const updateValue = (nextValue) => onChange(Math.max(0, Number(nextValue) || 0));

  return (
    <div className={cn("rounded-lg border border-border bg-background", disabled && "opacity-50")}>
      <div className="flex h-10 items-center">
        <span className="flex h-full w-10 items-center justify-center border-r border-border text-sm font-semibold text-text-secondary">
          $
        </span>
        <Input
          type="number"
          min="0"
          step="50"
          disabled={disabled}
          value={numericValue}
          onChange={(event) => updateValue(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-semibold text-foreground shadow-none focus-visible:ring-0 disabled:cursor-not-allowed"
        />
        <span className="border-l border-border px-3 text-xs font-medium text-text-secondary">
          /mo
        </span>
      </div>
      <div className="flex border-t border-border">
        {[-100, 100].map((step) => (
          <Button
            key={step}
            type="button"
            disabled={disabled}
            variant="ghost"
            onClick={() => updateValue(numericValue + step)}
            className="flex h-8 flex-1 items-center justify-center text-xs font-medium text-muted-foreground transition hover:bg-surface-active hover:text-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground first:border-r first:border-border"
          >
            {step < 0 ? "-$100" : "+$100"}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function SystemArchitectureScreen() {
  const { resolvedTheme } = useTheme();
  const { syncArchitectureExpenses, updateArchitectureExpense } = useProjectBudget();
  const [nodes, setNodes] = useState(starterNodes);
  const [edges, setEdges] = useState(starterEdges);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLogoCategory, setActiveLogoCategory] = useState("All");
  const [catalogueOpen, setCatalogueOpen] = useState(true);
  const [expensePanelNodeId, setExpensePanelNodeId] = useState(null);
  const [expenseDescriptionDraft, setExpenseDescriptionDraft] = useState("");
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    syncArchitectureExpenses(nodes.map(nodeToArchitectureExpense));
  }, [nodes, syncArchitectureExpenses]);

  const filteredCatalogue = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return architectureNodeCatalogue.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.label} ${item.category} ${item.description}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const filteredLogoCatalogue = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return providerLogoCatalogue.filter((item) => {
      const matchesCategory =
        activeLogoCategory === "All" || item.category === activeLogoCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.label} ${item.category} ${item.description} ${item.iconifyId}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeLogoCategory, query]);

  const onNodesChange = useCallback((changes) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((current) => addEdge({ ...params, ...defaultEdgeOptions }, current));
  }, []);

  const addNodeToCenter = useCallback(
    (item) => {
      const viewport = reactFlowInstance?.getViewport();
      const zoom = viewport?.zoom || 1;
      const position = {
        x: ((wrapperRef.current?.clientWidth || 1200) / 2 - (viewport?.x || 0)) / zoom - 115,
        y: ((wrapperRef.current?.clientHeight || 760) / 2 - (viewport?.y || 0)) / zoom - 55,
      };

      setNodes((current) => [...current, buildDroppedNode(item, position)]);
    },
    [reactFlowInstance],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const raw = event.dataTransfer.getData("application/system-architecture-node");
      if (!raw) return;

      const item = JSON.parse(raw);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((current) => [...current, buildDroppedNode(item, position)]);
    },
    [reactFlowInstance],
  );

  const selectedNode = useMemo(() => nodes.find((node) => node.selected), [nodes]);

  const expensePanelOpen = Boolean(selectedNode && expensePanelNodeId === selectedNode.id);

  const updateSelectedNodeExpense = useCallback(
    (updates) => {
      if (!selectedNode) return;

      setNodes((current) => {
        return current.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                },
              }
            : node,
        );
      });

      updateArchitectureExpense(selectedNode.id, updates);
    },
    [selectedNode, updateArchitectureExpense],
  );

  const saveExpenseDescription = useCallback(() => {
    updateSelectedNodeExpense({
      description: expenseDescriptionDraft,
      notes: expenseDescriptionDraft,
    });
  }, [expenseDescriptionDraft, updateSelectedNodeExpense]);

  const openExpensePanel = useCallback(() => {
    if (!selectedNode) return;
    setExpenseDescriptionDraft(selectedNode.data?.description || "");
    setExpensePanelNodeId(selectedNode.id);
  }, [selectedNode]);

  const closeExpensePanel = useCallback(() => {
    setExpensePanelNodeId(null);
  }, []);

  const zoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const fitCanvas = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.22, maxZoom: 0.9 });
  }, [reactFlowInstance]);

  return (
    <div ref={wrapperRef} className="relative h-full min-h-[640px] w-full overflow-hidden bg-background text-foreground">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          setZoomLevel(instance.getViewport().zoom);
        }}
        onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.22, maxZoom: 0.9 }}
        minZoom={0.08}
        maxZoom={2.2}
        proOptions={proOptions}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Shift"
        selectionMode={SelectionMode.Partial}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        className="system-architecture-canvas"
      >
        <Background color="var(--canvas-dots)" gap={18} size={1} variant="dots" />
        <Panel position="top-left" className="!m-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2 shadow-2xl">
            <Network className="h-4 w-4" />
            <div>
              <h1 className="text-sm font-semibold leading-4 text-foreground">System Architecture</h1>
              <p className="text-[11px] text-text-secondary">{nodes.length} Nodes | {edges.length} Links</p>
            </div>
          </div>
        </Panel>
        <Panel position="bottom-right" className="!m-4">
          <div className="flex overflow-hidden rounded-lg border border-border bg-surface-card shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              className="h-10 w-10 rounded-none border-r border-border text-muted-foreground hover:bg-surface-active hover:text-foreground"
              title="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={fitCanvas}
              className="flex h-10 min-w-20 items-center justify-center gap-2 border-r border-border px-3 text-xs font-semibold text-foreground transition hover:bg-surface-active hover:text-foreground"
              title="Fit canvas"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              {Math.round(zoomLevel * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              className="h-10 w-10 rounded-none text-muted-foreground hover:bg-surface-active hover:text-foreground"
              title="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Panel>
      </ReactFlow>

      <Sheet open={catalogueOpen} onOpenChange={setCatalogueOpen} modal={false}>
        <SheetContent
          side="right"
          showOverlay={false}
          showCloseButton={false}
          className="top-14 bottom-0 h-[calc(100dvh-3.5rem)] w-[380px] gap-0 border-l border-border bg-surface-card p-0 text-foreground shadow-2xl sm:max-w-none"
        >
          <SheetHeader className="h-16 shrink-0 border-b border-border bg-surface-card p-4">
            <div className="flex h-full items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="truncate text-sm font-semibold text-foreground">
                    Node Catalogue
                  </SheetTitle>
                  <span className="text-xs text-text-secondary">
                    {filteredCatalogue.length + filteredLogoCatalogue.length}
                  </span>
                </div>
              </div>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-text-secondary hover:bg-surface-active hover:text-foreground"
                  title="Hide catalogue"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="shrink-0 border-b border-border bg-surface-subtle p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services, databases, security..."
                className="h-10 w-full border-border bg-background pl-10 pr-10 text-sm leading-5 text-foreground placeholder:text-text-secondary focus-visible:border-border-strong focus-visible:ring-0"
              />
              {query ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-active hover:text-foreground"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-surface-card px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Accordion
              type="multiple"
              defaultValue={["entities", "provider-logos"]}
              className="space-y-3"
            >
              <AccordionItem value="entities" className="border-b-0">
                <AccordionTrigger className="border-b border-border no-underline hover:no-underline">
                  <span className="flex items-center gap-2">
                    Architecture entities
                    <span className="text-xs font-normal text-text-secondary">{filteredCatalogue.length}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-3 pb-0">
                  <CatalogueSection
                    items={filteredCatalogue}
                    categories={architectureCategories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    onAdd={addNodeToCenter}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="provider-logos" className="border-b-0">
                <AccordionTrigger className="border-b border-border hover:no-underline">
                  <span className="flex items-center gap-2">
                    Cloud and service logos
                    <span className="text-xs font-normal text-text-secondary">{filteredLogoCatalogue.length}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-3 pb-0">
                  <CatalogueSection
                    items={filteredLogoCatalogue}
                    categories={providerLogoCategories}
                    activeCategory={activeLogoCategory}
                    onCategoryChange={setActiveLogoCategory}
                    onAdd={addNodeToCenter}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>

      {selectedNode && !expensePanelOpen ? (
        <Button
          variant="ghost"
          onClick={openExpensePanel}
          className="absolute bottom-4 left-4 z-40 h-10 gap-2 border border-border bg-surface-card px-3 text-foreground shadow-2xl hover:border-border-strong hover:bg-surface-active hover:text-foreground"
        >
          <DollarSign className="h-4 w-4" />
          Expense
        </Button>
      ) : null}

      {selectedNode && expensePanelOpen ? (
        <aside className="absolute bottom-4 left-4 z-40 w-[340px] overflow-hidden rounded-lg border border-border bg-surface-card shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-active p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedNode.data?.label}</p>
              <p className="mt-1 text-xs text-text-secondary">{selectedNode.data?.category} expense settings</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeExpensePanel}
              className="h-8 w-8 shrink-0 text-text-secondary hover:bg-surface-hover hover:text-foreground"
              title="Close expense settings"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-subtle p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Track as infrastructure expense</p>
                <p className="mt-1 text-xs text-text-secondary">Reflect this node in Budget.</p>
              </div>
              <Switch
                checked={selectedNode.data?.expenseEnabled !== false}
                onCheckedChange={(checked) => updateSelectedNodeExpense({ expenseEnabled: checked })}
              />
            </div>

            <Label className="block space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Monthly infrastructure cost</span>
              <CostInput
                value={selectedNode.data?.monthlyCost ?? 0}
                disabled={selectedNode.data?.expenseEnabled === false}
                onChange={(monthlyCost) => updateSelectedNodeExpense({ monthlyCost })}
              />
            </Label>

            <Label className="block space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Node description</span>
              <Textarea
                value={expenseDescriptionDraft}
                onChange={(event) => setExpenseDescriptionDraft(event.target.value)}
                rows={3}
                className="min-h-20 resize-none border-border bg-background text-sm leading-5 text-foreground placeholder:text-text-secondary focus-visible:border-border-strong focus-visible:ring-0"
                placeholder="Describe this architecture node..."
              />
            </Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-surface-subtle p-3">
                <p className="text-xs text-text-secondary">Monthly</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  ${Number(selectedNode.data?.monthlyCost || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface-subtle p-3">
                <p className="text-xs text-text-secondary">Annual</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  ${(Number(selectedNode.data?.monthlyCost || 0) * 12).toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={saveExpenseDescription}
              disabled={expenseDescriptionDraft === (selectedNode.data?.description || "")}
              className="h-9 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save description
            </Button>
            <p className="text-xs leading-5 text-text-secondary">
              Use the close button to hide this editor. Reopen it by selecting any architecture node.
            </p>
          </div>
        </aside>
      ) : null}

      {!catalogueOpen ? (
        <Button
          variant="ghost"
          onClick={() => setCatalogueOpen(true)}
          className="absolute right-4 top-4 z-40 h-10 gap-2 border border-border bg-surface-card px-3 text-foreground shadow-2xl hover:border-border-strong hover:bg-surface-active hover:text-foreground"
        >
          <ChevronsLeft className="h-4 w-4" />
          Catalogue
        </Button>
      ) : null}

      <style jsx global>{`
        .system-architecture-canvas .react-flow__edge-path {
          transition: stroke 0.2s ease, stroke-width 0.2s ease;
        }
        .system-architecture-canvas .react-flow__edge.selected .react-flow__edge-path {
          stroke: var(--foreground);
          stroke-width: 2.4;
        }
      `}</style>
    </div>
  );
}
