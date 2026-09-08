"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Crown,
  Loader2,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";
import { InviteMemberDialog } from "@/components/internal/dilouges/teams/invitemember_dilouge";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/project-context";
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
import { ActionMenu } from "@geiger/ui";
import { Avatar, AvatarFallback } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";

const MEMBER_ROLE_MAP = {
  admin: { label: "Admin", variant: "success" },
  member: { label: "Member", variant: "info" },
  viewer: { label: "Viewer", variant: "neutral" },
  manager: { label: "Manager", variant: "purple" },
};

const MEMBER_STATUS_MAP = {
  Active: { label: "Active", variant: "success" },
  Invited: { label: "Invited", variant: "warning" },
};

const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

function RoleBadgeIcon({ role }) {
  const iconClassName = "mr-1 h-3 w-3";
  const iconByRole = {
    admin: Crown,
    member: Users,
    viewer: UserRound,
    manager: BriefcaseBusiness,
  };
  const Icon = iconByRole[role] || ShieldCheck;

  return <Icon className={iconClassName} />;
}

export function TeamScreen() {
  const { project } = useProject();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!project?.id) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("flow_teams")
        .select("*")
        .eq("id", project.id)
        .maybeSingle();

      if (error) {
        console.error(
          "[flow_teams] fetch error:",
          error.message || error,
          error.code,
        );
        if (error.code === "PGRST116") {
          setMembers([]);
        }
      }

      if (data && data.members) {
        setMembers(
          Array.isArray(data.members)
            ? data.members
            : Object.values(data.members),
        );
      } else {
        setMembers([]);
      }
      setLoading(false);
    };
    fetchTeam();
  }, [project?.id]);

  const saveMembers = async (newMembers) => {
    setMembers(newMembers);
    if (!project?.id) return;
    const supabase = createClient();
    await supabase
      .from("flow_teams")
      .upsert({ id: project.id, members: newMembers });
  };

  const handleInvite = (email, role) => {
    const newMember = {
      name: email.split("@")[0],
      email,
      role,
      status: "Active",
    };
    saveMembers([...members, newMember]);
  };

  const handleEditRole = (email, newRole) => {
    saveMembers(
      members.map((m) => (m.email === email ? { ...m, role: newRole } : m)),
    );
  };

  const handleRemove = (email) => {
    saveMembers(members.filter((m) => m.email !== email));
  };

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && (m.role || "member") !== roleFilter)
        return false;
      if (
        needle &&
        !`${m.name || ""} ${m.email || ""}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [members, search, roleFilter]);

  const pager = usePagination(filtered, {
    resetKey: `${search}|${roleFilter}`,
  });

  const stats = useMemo(() => {
    const admins = members.filter((m) => m.role === "admin").length;
    const active = members.filter(
      (m) => (m.status || "Active") === "Active",
    ).length;
    return [
      {
        label: "Total members",
        value: String(members.length),
        footer: `${active} active now`,
      },
      {
        label: "Admins",
        value: String(admins),
        footer: "Full project access",
      },
      {
        label: "Members",
        value: String(members.filter((m) => m.role === "member").length),
        footer: "Project collaborators",
      },
      {
        label: "Viewers",
        value: String(members.filter((m) => m.role === "viewer").length),
        footer: "Read-only access",
      },
    ];
  }, [members]);

  const columns = [
    {
      key: "member",
      header: "Member",
      render: (member) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 bg-surface-strong ring-1 ring-ring">
            <AvatarFallback className="bg-surface-strong text-xs font-medium uppercase text-foreground">
              {member.name ? member.name.charAt(0) : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium capitalize text-foreground">
              {member.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 opacity-50" />
              {member.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "access",
      header: "Access",
      render: (member) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={MEMBER_ROLE_MAP[member.role]?.variant || "info"}>
            <RoleBadgeIcon role={member.role} />
            {MEMBER_ROLE_MAP[member.role]?.label ||
              member.role ||
              "Member"}
          </Badge>
          <Badge variant="info">
            <Workflow className="mr-1 h-3 w-3" />
            Project
          </Badge>
        </div>
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
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (member) => (
        <ActionMenu
          label={`Actions for ${member.email}`}
          items={[
            {
              icon: Pencil,
              label: "Edit Role",
              onSelect: () => setEditingMember(member),
            },
            { separator: true },
            {
              icon: Trash2,
              label: "Remove",
              destructive: true,
              onSelect: () => setDeleteTarget(member),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Team"
        description="Manage your team members and their roles."
        actions={
          <Button
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => setIsInviteOpen(true)}
          >
            <Plus className="h-4 w-4 font-bold text-primary-foreground stroke-[3]" />
            Invite member
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={roleFilter}
            onValueChange={setRoleFilter}
            options={ROLE_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search members…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading team members…
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(m, i) => m.email || i}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Users}
                  title={
                    members.length
                      ? "No members match your filters"
                      : "No Team Members"
                  }
                  description={
                    members.length
                      ? "Try clearing the search or filters."
                      : "Invite your team to collaborate on this project."
                  }
                  action={
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setIsInviteOpen(true)}
                    >
                      <Plus className="h-4 w-4" /> Invite Members
                    </Button>
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="members" />
        </div>
      )}

      <InviteMemberDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        onInvite={handleInvite}
      />

      <InviteMemberDialog
        defaultEmail={editingMember?.email || ""}
        defaultRole={editingMember?.role || "member"}
        isEditMode
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onInvite={(email, role) => {
          handleEditRole(email, role);
          setEditingMember(null);
        }}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.email}
              </span>{" "}
              from this project? They will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => {
                handleRemove(deleteTarget.email);
                setDeleteTarget(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default TeamScreen;
