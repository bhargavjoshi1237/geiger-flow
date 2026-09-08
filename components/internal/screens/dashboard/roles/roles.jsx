"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ListChecks,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Switch } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import {
  EmptyState,
  Field,
  ScreenHeader,
  SearchInput,
  SectionCard,
  SettingRow,
  SettingsList,
  StatsBar,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { createClient } from "@/lib/supabase/client";
import {
  ROLE_STORAGE_KEY,
  WORKSPACE_PERMISSIONS,
  mergeWorkspaceRoles,
  normalizeRoleId,
} from "@/lib/rbac";

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "system", label: "System" },
  { value: "custom", label: "Custom" },
];

function RoleCreateDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    const roleId = normalizeRoleId(name);
    if (!roleId) return;

    onCreate({
      id: roleId,
      name: name.trim(),
      description: description.trim() || "Custom workspace role.",
      permissions: ["view.overview", "view.projects", "view.team"],
      system: false,
    });
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Add new
          <Plus className="ml-1 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a role to the workspace, then expand it in the list to manage
            permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Role name" htmlFor="role-name">
            <Input
              id="role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Finance reviewer"
              className="bg-surface-card border-border text-foreground"
            />
          </Field>
          <Field label="Responsibility" htmlFor="role-description">
            <Input
              id="role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Can review project usage and reporting"
              className="bg-surface-card border-border text-foreground"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:bg-surface-card hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RolesScreen({
  roles: externalRoles = [],
  onRolesChange,
}) {
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleUsage, setRoleUsage] = useState({});
  const roles = externalRoles;

  const permissionGroups = useMemo(() => {
    return WORKSPACE_PERMISSIONS.reduce((groups, permission) => {
      groups[permission.group] = groups[permission.group] || [];
      groups[permission.group].push(permission);
      return groups;
    }, {});
  }, []);

  const filteredRoles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return roles.filter((role) => {
      if (typeFilter === "system" && !role.system) return false;
      if (typeFilter === "custom" && role.system) return false;
      if (
        needle &&
        !`${role.name} ${role.description || ""}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [query, roles, typeFilter]);

  const pager = usePagination(filteredRoles, {
    resetKey: `${query}|${typeFilter}`,
  });

  const stats = useMemo(() => {
    const assigned = Object.values(roleUsage).reduce((s, n) => s + n, 0);
    return [
      {
        label: "Total roles",
        value: String(roles.length),
        footer: `${assigned} users assigned`,
      },
      {
        label: "System roles",
        value: String(roles.filter((r) => r.system).length),
        footer: "Shipped with the workspace",
      },
      {
        label: "Custom roles",
        value: String(roles.filter((r) => !r.system).length),
        footer: "Created by your team",
      },
      {
        label: "Permissions",
        value: String(WORKSPACE_PERMISSIONS.length),
        footer: "Across all groups",
      },
    ];
  }, [roles, roleUsage]);

  useEffect(() => {
    const fetchRoleUsage = async () => {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        const { data: profile } = userId
          ? await supabase
              .from("flow_profiles")
              .select("organization_id")
              .eq("id", userId)
              .maybeSingle()
          : { data: null };

        const { data: profiles } = profile?.organization_id
          ? await supabase
              .from("flow_profiles")
              .select("role")
              .eq("organization_id", profile.organization_id)
          : { data: null };

        const counts =
          profiles?.reduce((acc, profile) => {
            const roleId = profile.role || "manager";
            acc[roleId] = (acc[roleId] || 0) + 1;
            return acc;
          }, {}) || {};

        setRoleUsage(counts);
      } catch (error) {
        console.warn("[rbac] role usage unavailable:", error?.message || error);
      }
    };

    fetchRoleUsage();
  }, []);

  const persistRoles = async (nextRoles) => {
    onRolesChange?.(nextRoles);
    const customRoles = nextRoles.filter((role) => !role.system);
    localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(customRoles));

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      const { data: profile } = userId
        ? await supabase
            .from("flow_profiles")
            .select("organization_id")
            .eq("id", userId)
            .maybeSingle()
        : { data: null };

      if (profile?.organization_id && customRoles.length) {
        await supabase.from("flow_workspace_roles").upsert(
          customRoles.map((role) => ({
            organization_id: profile.organization_id,
            role_key: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            is_system: false,
          })),
          { onConflict: "organization_id,role_key" },
        );
      }

    } catch (error) {
      console.warn("[rbac] role save stayed local:", error?.message || error);
    }
  };

  const handleCreateRole = (role) => {
    const nextRoles = mergeWorkspaceRoles([...roles, role]);
    persistRoles(nextRoles);
    setExpandedRoleId(role.id);
  };

  const handlePermissionToggle = (roleId, permissionKey, checked) => {
    persistRoles(
      roles.map((role) => {
        if (role.id !== roleId) return role;

        const permissions = checked
          ? Array.from(new Set([...role.permissions, permissionKey]))
          : role.permissions.filter((key) => key !== permissionKey);

        return { ...role, permissions };
      }),
    );
  };

  const countPermissions = (role, prefix) =>
    role.permissions.filter((permission) => permission.startsWith(prefix)).length;

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Accesses"
        description="Manage workspace roles and permission groups."
        actions={<RoleCreateDialog onCreate={handleCreateRole} />}
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={typeFilter}
            onValueChange={setTypeFilter}
            options={TYPE_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search roles…"
        />
      </Toolbar>

      <div className="space-y-5">
        {pager.pageItems.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-subtle">
            <EmptyState
              icon={SlidersHorizontal}
              title={roles.length ? "No roles match your search" : "No roles yet"}
              description={
                roles.length
                  ? "Try clearing the search or filters."
                  : "Create your first custom role to get started."
              }
              action={<RoleCreateDialog onCreate={handleCreateRole} />}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {pager.pageItems.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              return (
                <SectionCard
                  key={role.id}
                  title={
                    <span className="inline-flex items-center gap-2">
                      {role.name}
                      {role.system && (
                        <ShieldCheck className="h-3.5 w-3.5 text-text-secondary" />
                      )}
                    </span>
                  }
                  description={`${roleUsage[role.id] || 0} users · ${countPermissions(role, "view.")} views · ${role.permissions.length - countPermissions(role, "view.")} controls · ${role.system ? "System" : "Custom"}`}
                  action={
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={isExpanded ? "Collapse permissions" : "Expand permissions"}
                        onClick={() =>
                          setExpandedRoleId(isExpanded ? null : role.id)
                        }
                        className="text-muted-foreground hover:bg-surface-active hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <ActionMenu
                        label={`Actions for ${role.name}`}
                        items={[
                          !isExpanded && {
                            icon: ListChecks,
                            label: "Manage permissions",
                            onSelect: () => setExpandedRoleId(role.id),
                          },
                          isExpanded && {
                            icon: ChevronDown,
                            label: "Collapse",
                            onSelect: () => setExpandedRoleId(null),
                          },
                        ]}
                      />
                    </div>
                  }
                >
                  {isExpanded && (
                    <div className="grid gap-6 pt-1 lg:grid-cols-3">
                      {Object.entries(permissionGroups).map(
                        ([group, permissions]) => (
                          <div key={group} className="space-y-1">
                            <div className="pb-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                {group}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {role.description}
                              </p>
                            </div>
                            <SettingsList>
                              {permissions.map((permission) => (
                                <SettingRow
                                  key={permission.key}
                                  title={permission.label}
                                  control={
                                    <Switch
                                      id={`${role.id}-${permission.key}`}
                                      checked={Boolean(
                                        role.permissions.includes(permission.key),
                                      )}
                                      onCheckedChange={(checked) =>
                                        handlePermissionToggle(
                                          role.id,
                                          permission.key,
                                          checked,
                                        )
                                      }
                                    />
                                  }
                                />
                              ))}
                            </SettingsList>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </SectionCard>
              );
            })}
          </div>
        )}
        <ListPagination {...pager} itemLabel="roles" />
      </div>
    </MainScreenWrapper>
  );
}

export default RolesScreen;
