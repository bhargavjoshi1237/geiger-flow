"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  CalendarDays,
  Copy,
  Crown,
  Mail,
  MailPlus,
  Plus,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { LogoLoading } from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { createClient } from "@/lib/supabase/client";
import {
  ROLE_STORAGE_KEY,
  mergeWorkspaceRoles,
} from "@/lib/rbac";

const initialMembers = [];

const MEMBER_STATUS_MAP = {
  Active: { label: "Active", variant: "success" },
};

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
  const [roleFilter, setRoleFilter] = useState("all");

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

  const handleCopyEmail = async (member) => {
    try {
      await navigator.clipboard.writeText(member.email);
      toast.success("Email copied to clipboard.");
    } catch {
      toast.error("Couldn't copy the email.");
    }
  };

  const roleFilterOptions = useMemo(
    () => [
      { value: "all", label: "All Roles" },
      ...roles.map((role) => ({ value: role.id, label: role.name })),
    ],
    [roles],
  );

  const visibleMembers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members.filter((member) => {
      if (roleFilter !== "all" && member.role !== roleFilter) return false;
      if (!needle) return true;
      return [member.name, member.email, member.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [members, query, roleFilter]);

  const pager = usePagination(visibleMembers, {
    resetKey: `${query}|${roleFilter}`,
  });

  const stats = useMemo(() => {
    const activeToday = members.filter((m) => m.lastActive === "Today").length;
    const owners = members.filter((m) => m.role === "workspace_owner").length;
    return [
      {
        label: "Total users",
        value: String(members.length),
        footer: `${activeToday} active today`,
      },
      {
        label: "Active today",
        value: String(activeToday),
        footer: "Seen in the last 24h",
      },
      {
        label: "Workspace roles",
        value: String(roles.length),
        footer: "Available to assign",
      },
      {
        label: "Owners",
        value: String(owners),
        footer: "Full workspace access",
      },
    ];
  }, [members, roles]);

  const roleName = (roleId) =>
    roles.find((role) => role.id === roleId)?.name || "Manager";

  const columns = [
    {
      key: "name",
      header: "User name",
      render: (member) => (
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
      ),
    },
    {
      key: "access",
      header: "Access",
      render: (member) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="success">
            <RoleBadgeIcon roleId={member.role} />
            {roleName(member.role)}
          </Badge>
          <Badge variant="info">
            <Workflow className="mr-1 h-3 w-3" />
            Workspace
          </Badge>
        </div>
      ),
    },
    {
      key: "role",
      header: "Workspace role",
      render: (member) => (
        <Select
          value={member.role}
          onValueChange={(roleId) => handleMemberRoleChange(member.id, roleId)}
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
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (member) => (
        <StatusPill status={member.status || "Active"} map={MEMBER_STATUS_MAP} />
      ),
    },
    {
      key: "lastActive",
      header: "Last active",
      render: (member) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          {member.lastActive || "Today"}
        </span>
      ),
    },
    {
      key: "dateAdded",
      header: "Date added",
      render: (member) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-text-secondary" />
          {member.dateAdded || "Workspace"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (member) => (
        <ActionMenu
          label={`Actions for ${member.name}`}
          items={[
            {
              icon: Copy,
              label: "Copy email",
              onSelect: () => handleCopyEmail(member),
            },
            {
              icon: MailPlus,
              label: "Send email",
              href: `mailto:${member.email}`,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="User management"
        description="Manage your team members and their account permissions here."
        actions={
          <Button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4 text-primary-foreground" />
            Add user
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={roleFilter}
            onValueChange={setRoleFilter}
            options={roleFilterOptions}
            height="h-9"
          />
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search users…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} label="Loading team members" />
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(m) => m.id}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Users}
                  title={
                    members.length
                      ? "No users match your filters"
                      : "No users yet"
                  }
                  description={
                    members.length
                      ? "Try clearing the search or filters."
                      : "Workspace members will appear here once they join."
                  }
                  action={
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4" /> Add user
                    </Button>
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="users" />
        </div>
      )}
    </MainScreenWrapper>
  );
}

export default TeamScreen;
