"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { createClient } from "@/lib/supabase/client";
import {
  ROLE_STORAGE_KEY,
  WORKSPACE_PERMISSIONS,
  mergeWorkspaceRoles,
  normalizeRoleId,
} from "@/lib/rbac";

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
            Add a role to the workspace, then expand it in the table to manage
            permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Finance reviewer"
              className="bg-surface-card border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-description">Responsibility</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Can review project usage and reporting"
              className="bg-surface-card border-border text-foreground"
            />
          </div>
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
    if (!needle) return roles;

    return roles.filter((role) =>
      `${role.name} ${role.description || ""}`.toLowerCase().includes(needle),
    );
  }, [query, roles]);

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
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-foreground">
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Accesses
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage workspace roles and permission groups.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <div className="relative w-full sm:w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search groups"
              className="!h-9 w-full rounded-lg border-border bg-surface-card !pl-9 !pr-3 text-sm text-foreground placeholder:text-text-secondary"
            />
          </div>
          <RoleCreateDialog onCreate={handleCreateRole} />
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-surface-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-surface-subtle">
              <TableHead className="w-[38%]">Roles</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Controls</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-12 text-right">
                <Plus className="ml-auto h-4 w-4 text-text-secondary" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              return (
                <React.Fragment key={role.id}>
                  <TableRow className="border-border hover:bg-surface-active">
                    <TableCell>
                      <Button
                        type="button"
                        onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-foreground">{role.name}</span>
                        {role.system && (
                          <ShieldCheck className="h-3.5 w-3.5 text-text-secondary" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {roleUsage[role.id] || 0}
                    </TableCell>
                    <TableCell>{countPermissions(role, "view.")}</TableCell>
                    <TableCell>
                      {role.permissions.length - countPermissions(role, "view.")}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-muted-foreground">
                        {role.system ? "System" : "Custom"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="rounded-md p-1 text-text-secondary hover:bg-surface-hover hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-border bg-surface-subtle text-foreground"
                        >
                          <DropdownMenuItem
                            onClick={() => setExpandedRoleId(role.id)}
                            className="focus:bg-surface-hover focus:text-foreground"
                          >
                            Manage permissions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="border-border bg-surface-subtle hover:bg-surface-subtle">
                      <TableCell colSpan={6} className="p-0">
                        <div className="grid gap-0 divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                          {Object.entries(permissionGroups).map(
                            ([group, permissions]) => (
                              <div key={group} className="space-y-3 p-5">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                    {group}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {role.description}
                                  </p>
                                </div>
                                {permissions.map((permission) => (
                                  <div
                                    key={permission.key}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <Label
                                      htmlFor={`${role.id}-${permission.key}`}
                                      className="text-sm text-foreground"
                                    >
                                      {permission.label}
                                    </Label>
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
                                  </div>
                                ))}
                              </div>
                            ),
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}

            {filteredRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-text-secondary">
                  No roles match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </MainScreenWrapper>
  );
}
