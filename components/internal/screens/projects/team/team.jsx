"use client";

import React, { useState, useEffect } from "react";
import {
  Users2,
  Plus,
  Mail,
  MoreHorizontal,
  Edit,
  DeleteIcon,
  Delete,
  Trash,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/internal/dilouges/teams/invitemember_dilouge";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/project-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function TeamScreen() {
  const { project } = useProject();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!project?.id) return;
      const supabase = createClient();
      console.log("[flow_teams] fetching team for project:", project.id);
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
        // Handle specific error codes if necessary, e.g., if row not found
        if (error.code === "PGRST116") {
          // Example: code for no rows found
          setMembers([]); // Gracefully handle missing row by setting empty members
        }
      }

      if (data && data.members) {
        setMembers(
          Array.isArray(data.members)
            ? data.members
            : Object.values(data.members),
        );
      } else {
        setMembers([]); // Gracefully handle missing 'members' property or no data
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

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#e7e7e7] tracking-tight">
          Team Members
        </h1>
        <InviteMemberDialog onInvite={handleInvite}>
          <button className="bg-[#e7e7e7] hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4 text-black font-bold stroke-[3]" />
            Invite member
          </button>
        </InviteMemberDialog>
      </div>

      <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl overflow-hidden w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1a1a1a] border-[#2a2a2a]">
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-zinc-500"
                >
                  Loading team members...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-zinc-500"
                >
                  No members found. Invite someone to your team.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member, i) => (
                <TableRow
                  key={i}
                  className="border-[#2a2a2a] hover:bg-[#242424]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center text-xs font-medium text-white ring-1 ring-[#474747] uppercase">
                        {member.name ? member.name.charAt(0) : "?"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#e7e7e7] capitalize">
                          {member.name}
                        </div>
                        <div className="text-xs text-[#a3a3a3] flex items-center gap-1">
                          <Mail className="w-3 h-3 opacity-50" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-[#c0c0c0] bg-[#2a2a2a] px-2 py-1 rounded border border-[#333333] capitalize">
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-sm text-green-400 font-medium capitalize">
                        {member.status || "Active"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]"
                      >
                        <InviteMemberDialog
                          defaultEmail={member.email}
                          defaultRole={member.role}
                          isEditMode={true}
                          onInvite={(email, role) =>
                            handleEditRole(email, role)
                          }
                        >
                          <button className="w-full text-left flex gap-2 px-2 py-1.5 text-sm hover:bg-[#2a2a2a] hover:text-white transition-colors rounded-sm cursor-default">
                            <Edit className="w-4 h-4" /> Edit Role
                          </button>
                        </InviteMemberDialog>
                        <DropdownMenuItem
                          className="hover:bg-[#2a2a2a]  flex gap-2 focus:bg-[#2a2a2a] focus:text-white cursor-pointer text-red-700 focus:text-red-400"
                          onClick={() => handleRemove(member.email)}
                        >
                          <Trash className="w-4 h-4  text-red-700" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </MainScreenWrapper>
  );
}
