"use client";

import React from "react";
import { Users2, Plus, Mail } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/internal/notfound/not_found";

export function TeamScreen() {
  const members = [];

  if (members.length === 0) {
    const avatarStack = (
      <div className="flex -space-x-4 items-center -mr-0.5">
        <Avatar className="w-12 h-12 bg-[#2a2a2a] ring-4 ring-[#121212]">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar className="w-12 h-12 bg-[#2a2a2a] ring-4 ring-[#121212]">
          <AvatarImage src="https://github.com/nutlope.png" />
          <AvatarFallback>MK</AvatarFallback>
        </Avatar>
        <Avatar className="w-12 h-12 bg-[#2a2a2a] ring-4 ring-[#121212]">
           <AvatarImage src="https://avatar.vercel.sh/shadcn" />
           <AvatarFallback>R</AvatarFallback>
        </Avatar>
      </div>
    );

    return (
      <div className="flex flex-col gap-8 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-[#e7e7e7]">
        <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-3">
        <h1 className="text-3xl font-semibold text-[#e7e7e7]">
          Team Members
        </h1>
        <p className="text-[#a3a3a3] text-sm mt-1.5 font-medium">
            Stay updated with all notifications and alerts across your
            workspace.
          </p>
        </div>
        <button className="bg-[#e7e7e7] hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4 text-black font-bold stroke-[3]" />
          Invite member
        </button>
      </div>
      <div className="bg-transparent rounded-2xl overflow-hidden w-full">
        <EmptyState
          icon={avatarStack}
          title="No Team Members"
          description="Invite your team to collaborate on this project."
          actionLabel="Invite Members"
          onAction={() => console.log("Invite clicked")}
        /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-[#e7e7e7]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#e7e7e7] tracking-tight">
          Team Members
        </h1>
        <button className="bg-[#e7e7e7] hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4 text-black font-bold stroke-[3]" />
          Invite member
        </button>
      </div>

      <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl overflow-hidden w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1a1a1a] border-[#2a2a2a]">
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>XP</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, i) => (
              <TableRow key={i} className="border-[#2a2a2a] hover:bg-[#242424]">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center text-xs font-medium text-white ring-1 ring-[#474747]">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#e7e7e7]">
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
                  <span className="text-xs font-medium text-[#c0c0c0] bg-[#2a2a2a] px-2 py-1 rounded border border-[#333333]">
                    {member.role}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <span className="text-sm text-green-400 font-medium">
                      {member.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <button className="text-xs font-medium text-[#737373] hover:text-[#e7e7e7] transition-colors">
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
