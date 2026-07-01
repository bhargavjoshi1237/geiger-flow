"use client";

import React, { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Crown,
  Filter,
  Mail,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { createClient } from "@/lib/supabase/client";
import {
  ROLE_STORAGE_KEY,
  mergeWorkspaceRoles,
} from "@/lib/rbac";

const initialMembers = [];

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "?") + (parts[1]?.[0] || "");
}

function RoleBadgeIcon({ roleId }) {
  const iconClassName = "mr-1 h-3 w-3";
  const iconByRole = {
    workspace_owner: Crown,
    lead: Users,
    manager: BriefcaseBusiness,
  };
  const Icon = iconByRole[roleId] || ShieldCheck;

  return <Icon className={iconClassName} />;
}

export function TeamScreen({ roles: externalRoles = [] }) {
  const [members, setMembers] = useState(initialMembers);
  const [roles, setRoles] = useState(externalRoles);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchWorkspaceTeam = async () => {
      setLoading(true);
      let storedRoles = [];

      try {
        storedRoles = JSON.parse(localStorage.getItem(ROLE_STORAGE_KEY) || "[]");
      } catch {
        storedRoles = [];
      }

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

        const { data: dbRoles } = profile?.organization_id
          ? await supabase
              .from("flow_workspace_roles")
              .select("*")
              .eq("organization_id", profile.organization_id)
              .order("created_at", { ascending: true })
          : { data: null };

        setRoles(
          mergeWorkspaceRoles(
            dbRoles?.length
              ? dbRoles.map((role) => ({
                  id: role.role_key,
                  name: role.name,
                  description: role.description,
                  permissions: role.permissions,
                  system: role.is_system,
                }))
              : storedRoles,
          ),
        );

        const { data: profiles } = profile?.organization_id
          ? await supabase
              .from("flow_profiles")
              .select("id, display_name, email, avatar_url, role, position")
              .eq("organization_id", profile.organization_id)
              .order("display_name", { ascending: true })
          : { data: null };

        if (profiles?.length) {
          setMembers(
            profiles.map((member) => ({
              id: member.id,
              name: member.display_name || member.email?.split("@")[0] || "Member",
              email: member.email || "No email",
              avatar: member.avatar_url,
              role: member.role || "manager",
              position: member.position,
              status: "Active",
              lastActive: "Today",
              dateAdded: "Workspace",
            })),
          );
        }
      } catch (error) {
        setRoles(mergeWorkspaceRoles(storedRoles));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceTeam();
  }, []);

  const handleMemberRoleChange = async (memberId, roleId) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === memberId ? { ...member, role: roleId } : member,
      ),
    );

    try {
      const supabase = createClient();
      await supabase.from("flow_profiles").update({ role: roleId }).eq("id", memberId);
    } catch (error) {
      console.warn("[team] member role save failed:", error?.message || error);
    }
  };

  const visibleMembers = members.filter((member) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;

    return [member.name, member.email, member.role]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(needle));
  });

  const roleName = (roleId) =>
    roles.find((role) => role.id === roleId)?.name || "Manager";

  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-foreground">
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            User management
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Manage your team members and their account permissions here.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end"> 
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="!h-9 w-full rounded-lg border-border bg-surface-card !pl-9 !pr-3 text-sm text-foreground placeholder:text-text-secondary"
              />
            </div>
            <Button
              variant="outline"
              className="h-9 rounded-lg border-border bg-surface-card px-3 text-sm font-semibold text-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4 text-primary-foreground" />
              Add user
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-surface-subtle">
              <TableHead>User name</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Workspace role</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead>Date added</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-text-secondary">
                  Loading team members...
                </TableCell>
              </TableRow>
            ) : (
              visibleMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-border hover:bg-surface-active"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-surface-strong ring-1 ring-ring">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-surface-strong text-xs uppercase text-foreground">
                          {initials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 opacity-50" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                        <RoleBadgeIcon roleId={member.role} />
                        {roleName(member.role)}
                      </Badge>
                      <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-300">
                        <Workflow className="mr-1 h-3 w-3" />
                        Workspace
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(roleId) =>
                        handleMemberRoleChange(member.id, roleId)
                      }
                    >
                      <SelectTrigger className="h-8 min-w-40 border-border bg-surface-subtle text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-surface-subtle text-foreground">
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      {member.lastActive || "Today"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-text-secondary" />
                      {member.dateAdded || "Workspace"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button className="rounded-md p-1 text-text-secondary hover:bg-surface-hover hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && visibleMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-text-secondary">
                  No users match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </MainScreenWrapper>
  );
}
