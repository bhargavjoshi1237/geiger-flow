"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Crown,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { InviteMemberDialog } from "@/components/internal/dilouges/teams/invitemember_dilouge";
import { useProject } from "@/context/project-context";
import {
  inviteMember,
  listMembers,
  softDeleteMember,
  updateMemberRole,
} from "@/features/team/actions";
import {
  MEMBER_ROLE_MAP,
  MEMBER_STATUS_MAP,
  ROLE_FILTER_OPTIONS,
} from "@/features/team/constants";
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
import { LogoLoading } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";

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
  const { id: projectId } = project ?? {};
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!projectId) {
      return undefined;
    }

    let cancelled = false;

    void listMembers(projectId).then((rows) => {
      if (cancelled) {
        return;
      }
      setMembers(rows ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleInvite = async (email, role) => {
    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      toast.error("Enter an email address");
      return;
    }
    if (!projectId) {
      toast.error("Couldn't invite member");
      return;
    }

    const optimistic = {
      id: crypto.randomUUID(),
      projectId,
      userId: null,
      email: trimmedEmail,
      name: trimmedEmail.split("@")[0],
      role,
      status: "Active",
    };
    setMembers((current) => [...current, optimistic]);

    const created = await inviteMember(projectId, {
      id: optimistic.id,
      email: trimmedEmail,
      role,
      name: optimistic.name,
    });

    if (created) {
      setMembers((current) =>
        current.map((m) => (m.id === optimistic.id ? created : m)),
      );
      toast.success("Member invited");
    } else {
      setMembers((current) =>
        current.filter((m) => m.id !== optimistic.id),
      );
      toast.error("Couldn't invite member");
    }
  };

  const handleEditRole = async (email, newRole) => {
    const target = members.find((m) => m.email === email);
    if (!target) {
      return;
    }

    const previousRole = target.role;
    setMembers((current) =>
      current.map((m) => (m.id === target.id ? { ...m, role: newRole } : m)),
    );

    const updated = await updateMemberRole(target.id, newRole);
    if (updated) {
      setMembers((current) =>
        current.map((m) => (m.id === target.id ? updated : m)),
      );
      toast.success("Member role updated");
    } else {
      setMembers((current) =>
        current.map((m) =>
          m.id === target.id ? { ...m, role: previousRole } : m,
        ),
      );
      toast.error("Couldn't update member role");
    }
  };

  const handleRemove = async (email) => {
    const target = members.find((m) => m.email === email);
    if (!target) {
      return;
    }

    setMembers((current) => current.filter((m) => m.id !== target.id));

    const ok = await softDeleteMember(target.id);
    if (ok) {
      toast.success("Member removed");
    } else {
      setMembers((current) => {
        const next = [...current, target];
        next.sort((a, b) =>
          String(a.createdAt ?? "") < String(b.createdAt ?? "") ? -1 : 1,
        );
        return next;
      });
      toast.error("Couldn't remove member");
    }
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
          <LogoLoading size={40} />
          Loading team members…
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(m, i) => m.id || m.email || i}
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
          void handleEditRole(email, role);
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
                void handleRemove(deleteTarget.email);
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
