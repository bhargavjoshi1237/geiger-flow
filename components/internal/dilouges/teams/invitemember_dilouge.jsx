"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InviteMemberDialog({
  children,
  defaultEmail = "",
  defaultRole = "member",
  isEditMode = false,
  onInvite,
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [role, setRole] = useState(defaultRole);
  const [isOpen, setIsOpen] = useState(false);

  const roleLabels = {
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };

  const roleDescriptions = {
    admin: "Can manage projects and members",
    member: "Can view and edit projects",
    viewer: "Can only view projects",
  };

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setRole(defaultRole);
    }
  }, [isOpen, defaultEmail, defaultRole]);

  const handleInvite = () => {
    if (onInvite) {
      onInvite(email, role);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#161616] border-[#2a2a2a] text-[#ededed]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? "Edit Member Role" : "Invite Team Member"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {isEditMode
              ? "Change the role of an existing team member."
              : "Invite a new member to your team via email."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 py-4">
          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-zinc-300"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditMode}
              className="bg-[#202020] border-[#333333] text-white focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-medium text-zinc-300">
              Set Role
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-[#202020] border-[#333333] text-white hover:bg-[#252525] hover:text-white"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {roleLabels[role]}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]"
                align="start"
              >
                <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <DropdownMenuRadioItem
                      key={key}
                      value={key}
                      className="flex flex-col items-start gap-0.5 py-2 focus:bg-[#2a2a2a] focus:text-[#ededed] cursor-pointer"
                    >
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-[11px] text-zinc-500 leading-none">
                        {roleDescriptions[key]}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white hover:bg-[#202020] border border-transparent"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInvite}
            disabled={!email}
            className="bg-[#ededed] text-black hover:bg-zinc-300"
          >
            {isEditMode ? "Save Changes" : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
