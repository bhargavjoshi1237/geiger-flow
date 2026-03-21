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
      <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
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
              className="bg-input border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full justify-between bg-input border-border text-foreground hover:bg-accent hover:text-foreground"
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
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-popover border-border text-foreground"
                align="start"
              >
                <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <DropdownMenuRadioItem
                      key={key}
                      value={key}
                      className="flex flex-col items-start gap-0.5 py-2 focus:bg-accent focus:text-foreground cursor-pointer"
                    >
                      <span className="text-sm font-medium">{label}</span>
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
            className="text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInvite}
            disabled={!email}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isEditMode ? "Save Changes" : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
