"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  UserX,
  Users,
} from "lucide-react";
import { Button } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { SegmentedTabs } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { LogoLoading } from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { useProject } from "@/context/project-context";
import {
  listAllocations,
  createAllocation,
  updateAllocation,
  softDeleteAllocation,
  listRequests,
  createRequest,
  updateRequest,
  softDeleteRequest,
} from "@/features/resources/actions";
import {
  ALLOCATION_STATUS_FILTER_OPTIONS,
  REQUEST_STATUS_FILTER_OPTIONS,
  HIGH_ALLOCATION_THRESHOLD,
  allocationStatusPillMap,
  requestStatusPillMap,
  formatDateLabel,
} from "@/features/resources/constants";
import { AllocationDialog } from "./allocation_dialog";
import { RequestDialog } from "./request_dialog";

const TABS = [
  { label: "Allocations", value: "allocations", icon: Users },
  { label: "Requests", value: "requests", icon: ClipboardList },
];

export function ResourceAllocationScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [activeTab, setActiveTab] = useState("allocations");
  const [allocations, setAllocations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [requestFilter, setRequestFilter] = useState("all");

  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    void Promise.all([listAllocations(projectId), listRequests(projectId)]).then(
      ([allocationRows, requestRows]) => {
        if (cancelled) {
          return;
        }
        setAllocations(allocationRows ?? []);
        setRequests(requestRows ?? []);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const filteredAllocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allocations.filter((resource) => {
      const matchesFilter =
        activeFilter === "all" || resource.status === activeFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [resource.member, resource.role, resource.notes, resource.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeFilter, allocations, query]);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((item) => {
      const matchesFilter =
        requestFilter === "all" || item.status === requestFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [item.request, item.requester, item.target, item.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [requests, query, requestFilter]);

  const allocPager = usePagination(filteredAllocations, {
    resetKey: `allocations|${query}|${activeFilter}`,
  });
  const reqPager = usePagination(filteredRequests, {
    resetKey: `requests|${query}|${requestFilter}`,
  });

  const stats = useMemo(() => {
    const totalLoad = allocations.reduce((sum, item) => sum + item.allocation, 0);
    const overloadedCount = allocations.filter(
      (item) => item.allocation > HIGH_ALLOCATION_THRESHOLD && item.status !== "completed",
    ).length;
    const activeCount = allocations.filter((item) => item.status === "active").length;
    const plannedCount = allocations.filter((item) => item.status === "planned").length;
    const pendingRequests = requests.filter((item) => item.status === "pending").length;

    return [
      {
        label: "Total load",
        value: `${totalLoad}%`,
        footer: `${overloadedCount} over ${HIGH_ALLOCATION_THRESHOLD}%`,
      },
      { label: "Active", value: String(activeCount), footer: "Currently assigned" },
      { label: "Planned", value: String(plannedCount), footer: "Starting soon" },
      { label: "Pending requests", value: String(pendingRequests), footer: "Awaiting review" },
    ];
  }, [allocations, requests]);

  // --- Allocations ---

  const saveAllocation = async (input) => {
    if (!projectId) {
      toast.error("No project selected.");
      return;
    }

    if (editingAllocation) {
      const saved = await updateAllocation(editingAllocation.id, input);
      if (!saved) {
        toast.error("Couldn't save the allocation.");
        return;
      }
      setAllocations((prev) => prev.map((row) => (row.id === saved.id ? saved : row)));
      setAllocationDialogOpen(false);
      setEditingAllocation(null);
      toast.success("Allocation updated");
      return;
    }

    const optimisticId = crypto.randomUUID();
    const optimistic = { id: optimisticId, projectId, ...input };

    setAllocations((prev) => [optimistic, ...prev]);
    setAllocationDialogOpen(false);

    const created = await createAllocation(projectId, input, { id: optimisticId });
    if (!created) {
      setAllocations((prev) => prev.filter((row) => row.id !== optimisticId));
      toast.error("Couldn't save the allocation.");
      return;
    }

    setAllocations((prev) => [
      created,
      ...prev.filter((row) => row.id !== optimisticId),
    ]);
    toast.success("Allocation created");
  };

  const deleteAllocation = async (resource) => {
    const previous = allocations;
    setAllocations((prev) => prev.filter((row) => row.id !== resource.id));
    setPendingDelete(null);

    const ok = await softDeleteAllocation(resource.id);
    if (!ok) {
      setAllocations(previous);
      toast.error("Couldn't delete the allocation.");
      return;
    }
    toast.success("Allocation deleted");
  };

  // --- Requests ---

  const saveRequest = async (input) => {
    if (!projectId) {
      toast.error("No project selected.");
      return;
    }

    const optimisticId = crypto.randomUUID();
    const optimistic = {
      ...input,
      id: optimisticId,
      projectId,
      status: "pending",
      resolvedAt: null,
    };

    setRequests((prev) => [optimistic, ...prev]);
    setRequestDialogOpen(false);

    const created = await createRequest(projectId, input, { id: optimisticId });
    if (!created) {
      setRequests((prev) => prev.filter((row) => row.id !== optimisticId));
      toast.error("Couldn't save the request.");
      return;
    }

    setRequests((prev) => [created, ...prev.filter((row) => row.id !== optimisticId)]);
    toast.success("Request submitted");
  };

  const resolveRequest = async (request, status) => {
    const previous = requests;
    const resolvedAt = status === "pending" ? null : new Date().toISOString();

    setRequests((prev) =>
      prev.map((row) =>
        row.id === request.id ? { ...row, status, resolvedAt } : row,
      ),
    );

    const saved = await updateRequest(request.id, { status });
    if (!saved) {
      setRequests(previous);
      toast.error("Couldn't update the request.");
      return;
    }
    setRequests((prev) => prev.map((row) => (row.id === saved.id ? saved : row)));

    if (status === "approved") {
      toast.success("Request approved");
    } else if (status === "denied") {
      toast.success("Request denied");
    }
  };

  const deleteRequest = async (request) => {
    const previous = requests;
    setRequests((prev) => prev.filter((row) => row.id !== request.id));
    setPendingDelete(null);

    const ok = await softDeleteRequest(request.id);
    if (!ok) {
      setRequests(previous);
      toast.error("Couldn't delete the request.");
      return;
    }
    toast.success("Request deleted");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      if (pendingDelete.kind === "allocation") {
        await deleteAllocation(pendingDelete.item);
      } else {
        await deleteRequest(pendingDelete.item);
      }
    } finally {
      setDeleting(false);
    }
  };

  const hasAnyAllocations = allocations.length > 0;

  const allocationColumns = [
    {
      key: "resource",
      header: "Resource",
      render: (resource) => {
        const overloaded =
          resource.allocation > HIGH_ALLOCATION_THRESHOLD && resource.status !== "completed";
        return (
          <div className="flex min-w-[180px] flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{resource.member}</span>
              {overloaded ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
              ) : null}
            </div>
            <p className="line-clamp-1 text-xs text-text-secondary">{resource.role || "—"}</p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (resource) => (
        <StatusPill status={resource.status} map={allocationStatusPillMap} />
      ),
    },
    {
      key: "load",
      header: "Load",
      render: (resource) => (
        <div className="w-[130px] space-y-1.5">
          <Progress
            value={resource.allocation}
            className="h-1.5 rounded-full bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
          />
          <p className="text-xs tabular-nums text-text-secondary">{resource.allocation}%</p>
        </div>
      ),
    },
    {
      key: "starts",
      header: "Starts",
      render: (resource) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-text-secondary" />
          {formatDateLabel(resource.startsOn)}
        </span>
      ),
    },
    {
      key: "ends",
      header: "Ends",
      render: (resource) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-text-secondary" />
          {formatDateLabel(resource.endsOn)}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (resource) => (
        <span className="block max-w-[220px] truncate text-xs text-muted-foreground">
          {resource.notes || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (resource) => (
        <ActionMenu
          label={`Actions for ${resource.member}`}
          items={[
            {
              icon: Pencil,
              label: "Edit",
              onSelect: () => {
                setEditingAllocation(resource);
                setAllocationDialogOpen(true);
              },
            },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setPendingDelete({ kind: "allocation", item: resource }),
            },
          ]}
        />
      ),
    },
  ];

  const requestColumns = [
    {
      key: "request",
      header: "Request",
      render: (item) => (
        <div className="flex min-w-[240px] flex-col gap-1">
          <span className="font-medium text-foreground">{item.request}</span>
          <span className="text-xs text-text-secondary">
            {item.requester}
            {item.target ? ` · ${item.target}` : ""} · Requested {formatDateLabel(item.requestedOn)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusPill status={item.status} map={requestStatusPillMap} />,
    },
    {
      key: "requested",
      header: "Requested on",
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-text-secondary" />
          {formatDateLabel(item.requestedOn)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (item) => (
        <ActionMenu
          label={`Actions for request ${item.request}`}
          items={[
            item.status === "pending" && {
              icon: CheckCircle2,
              label: "Approve",
              onSelect: () => resolveRequest(item, "approved"),
            },
            item.status === "pending" && {
              icon: UserX,
              label: "Deny",
              onSelect: () => resolveRequest(item, "denied"),
            },
            item.status !== "pending" && {
              icon: Circle,
              label: "Reopen",
              onSelect: () => resolveRequest(item, "pending"),
            },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setPendingDelete({ kind: "request", item }),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Resource Allocation"
        description="Assign people to project work and track resource requests."
        actions={
          activeTab === "allocations" ? (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setEditingAllocation(null);
                setAllocationDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New Allocation
            </Button>
          ) : (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setRequestDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> New Request
            </Button>
          )
        }
      />

      <StatsBar stats={stats} />

      <SegmentedTabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === "allocations" ? (
        <>
          <Toolbar>
            <div className="flex items-center gap-2">
              <FilterDropdown
                value={activeFilter}
                onValueChange={setActiveFilter}
                options={ALLOCATION_STATUS_FILTER_OPTIONS}
                height="h-9"
              />
            </div>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by member, role or notes"
            />
          </Toolbar>

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
              <LogoLoading size={40} />
              Loading allocations…
            </div>
          ) : (
            <div className="space-y-5">
              <DataTable
                columns={allocationColumns}
                data={allocPager.pageItems}
                getRowKey={(row) => row.id}
                empty={
                  <div className="rounded-xl border border-border bg-surface-subtle">
                    <EmptyState
                      icon={Users}
                      title={
                        hasAnyAllocations
                          ? "No resources match your filters"
                          : "No allocations yet"
                      }
                      description={
                        hasAnyAllocations
                          ? "Clear the search or switch status filters."
                          : "Create the first allocation to assign a member to project work."
                      }
                      action={
                        hasAnyAllocations ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setQuery("");
                              setActiveFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => {
                              setEditingAllocation(null);
                              setAllocationDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4" /> New Allocation
                          </Button>
                        )
                      }
                    />
                  </div>
                }
              />
              <ListPagination {...allocPager} itemLabel="allocations" />
            </div>
          )}
        </>
      ) : (
        <>
          <Toolbar>
            <div className="flex items-center gap-2">
              <FilterDropdown
                value={requestFilter}
                onValueChange={setRequestFilter}
                options={REQUEST_STATUS_FILTER_OPTIONS}
                height="h-9"
              />
            </div>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search requests, requesters…"
            />
          </Toolbar>

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
              <LogoLoading size={40} />
              Loading requests…
            </div>
          ) : (
            <div className="space-y-5">
              <DataTable
                columns={requestColumns}
                data={reqPager.pageItems}
                getRowKey={(row) => row.id}
                empty={
                  <div className="rounded-xl border border-border bg-surface-subtle">
                    <EmptyState
                      icon={ClipboardList}
                      title={
                        requests.length
                          ? "No requests match your filters"
                          : "No resource requests yet"
                      }
                      description={
                        requests.length
                          ? "Clear the search or switch status filters."
                          : "Ask for extra capacity — requests stay pending until approved or denied."
                      }
                      action={
                        requests.length ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setQuery("");
                              setRequestFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setRequestDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" /> New Request
                          </Button>
                        )
                      }
                    />
                  </div>
                }
              />
              <ListPagination {...reqPager} itemLabel="requests" />
            </div>
          )}
        </>
      )}

      <AllocationDialog
        key={`allocation-${editingAllocation?.id ?? "new"}-${allocationDialogOpen}`}
        allocation={editingAllocation}
        open={allocationDialogOpen}
        onOpenChange={(open) => {
          setAllocationDialogOpen(open);
          if (!open) setEditingAllocation(null);
        }}
        onSave={(input) => void saveAllocation(input)}
      />

      <RequestDialog
        key={`request-${requestDialogOpen}`}
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSave={(input) => void saveRequest(input)}
      />

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md border-border bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {pendingDelete?.kind === "allocation" ? "Delete allocation?" : "Delete request?"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {pendingDelete?.kind === "allocation"
                ? `“${pendingDelete?.item?.member}” will be removed. This can’t be undone from here.`
                : `“${pendingDelete?.item?.request}” will be removed. This can’t be undone from here.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default ResourceAllocationScreen;
