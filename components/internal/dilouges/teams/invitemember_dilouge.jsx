"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Button } from "@geiger/ui";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";

export function InviteMemberDialog({
  children,
  defaultEmail = "",
  defaultRole = "member",
  isEditMode = false,
  onInvite,
  open: controlledOpen,
  onOpenChange,
  isOpen,
  onClose,
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [role, setRole] = useState(defaultRole);
  const [internalOpen, setInternalOpen] = useState(false);

  const roleLabels = {
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };

  const isControlled = controlledOpen !== undefined || isOpen !== undefined;
  const open = controlledOpen ?? isOpen ?? internalOpen;

  // Reset the form every time the dialog opens (and forget the session when
  // it closes). Adjusted during render — React's recommended answer to
  // "reset when a prop changes" — instead of an effect.
  const [lastDefaultsKey, setLastDefaultsKey] = useState(null);
  const defaultsKey = open ? `${defaultEmail}|${defaultRole}` : null;
  if (defaultsKey !== lastDefaultsKey) {
    setLastDefaultsKey(defaultsKey);
    if (open) {
      setEmail(defaultEmail);
      setRole(defaultRole);
    }
  }

  const setOpen = (next) => {
    const value = typeof next === "function" ? next(open) : next;
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
    if (!value) onClose?.();
  };

  const handleInvite = () => {
    if (onInvite) {
      onInvite(email, role);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? "Edit Member Role" : "Invite Team Member"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditMode
              ? "Change the role of an existing team member."
              : "Invite a new member to your team via email."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Field label="Email Address" htmlFor="invite-email">
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditMode}
              className="bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </Field>

          <Field label="Set Role">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-surface-card border-border text-foreground hover:bg-surface-active hover:text-foreground"
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
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-surface-subtle border-border text-foreground"
                align="start"
              >
                <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <DropdownMenuRadioItem
                      key={key}
                      value={key}
                      className="flex flex-col items-start gap-0.5 py-2 focus:bg-surface-hover focus:text-foreground cursor-pointer"
                    >
                      <span className="text-sm font-medium">{label}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
        </div>

        <DialogFooter className="sm:justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-surface-card border border-transparent"
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
