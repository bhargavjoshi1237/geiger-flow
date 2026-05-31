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
        <Button className="h-9 rounded-lg bg-[#e7e7e7] px-4 text-sm font-semibold text-black hover:bg-zinc-200">
          Add new
          <Plus className="ml-1 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#161616] border-[#2a2a2a] text-[#ededed]">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
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
              className="bg-[#202020] border-[#333333] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-description">Responsibility</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Can review project usage and reporting"
              className="bg-[#202020] border-[#333333] text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:bg-[#202020] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-[#ededed] text-black hover:bg-zinc-300"
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
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#ededed] md:text-3xl">
            Accesses
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            Manage workspace roles and permission groups.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <div className="relative w-full sm:w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search groups"
              className="!h-9 w-full rounded-lg border-[#333333] bg-[#202020] !pl-9 !pr-3 text-sm text-[#ededed] placeholder:text-[#737373]"
            />
          </div>
          <RoleCreateDialog onCreate={handleCreateRole} />
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#202020]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2a2a] bg-[#1a1a1a]">
              <TableHead className="w-[38%]">Roles</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Controls</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-12 text-right">
                <Plus className="ml-auto h-4 w-4 text-[#737373]" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              return (
                <React.Fragment key={role.id}>
                  <TableRow className="border-[#2a2a2a] hover:bg-[#242424]">
                    <TableCell>
                      <Button
                        type="button"
                        onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[#a3a3a3]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#a3a3a3]" />
                        )}
                        <span className="font-medium text-[#ededed]">{role.name}</span>
                        {role.system && (
                          <ShieldCheck className="h-3.5 w-3.5 text-[#737373]" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-[#ededed]">
                      {roleUsage[role.id] || 0}
                    </TableCell>
                    <TableCell>{countPermissions(role, "view.")}</TableCell>
                    <TableCell>
                      {role.permissions.length - countPermissions(role, "view.")}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-[#c0c0c0]">
                        {role.system ? "System" : "Custom"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="rounded-md p-1 text-[#737373] hover:bg-[#2a2a2a] hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-[#2a2a2a] bg-[#1a1a1a] text-[#ededed]"
                        >
                          <DropdownMenuItem
                            onClick={() => setExpandedRoleId(role.id)}
                            className="focus:bg-[#2a2a2a] focus:text-white"
                          >
                            Manage permissions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="border-[#2a2a2a] bg-[#1b1b1b] hover:bg-[#1b1b1b]">
                      <TableCell colSpan={6} className="p-0">
                        <div className="grid gap-0 divide-y divide-[#2a2a2a] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                          {Object.entries(permissionGroups).map(
                            ([group, permissions]) => (
                              <div key={group} className="space-y-3 p-5">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                                    {group}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-xs text-[#8f8f8f]">
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
                                      className="text-sm text-[#d4d4d4]"
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
                <TableCell colSpan={6} className="py-10 text-center text-[#737373]">
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
