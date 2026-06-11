"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Shield,
  UserCheck,
  Building2,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FilterDropdown from "../overview/filter_dropdown";

const TTL_OPTIONS = [
  { value: "none", label: "Never" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export function VaultAccessControl({
  item,
  open = false,
  onOpenChange = () => {},
  onSave = () => {},
  roles = [],
  positions = [],
}) {
  const [accessControl, setAccessControl] = useState({
    type: "team",
    allowedRoles: [],
    allowedUsers: [],
    allowedPositions: [],
  });
  const [ttl, setTtl] = useState("none");
  const [keylessEntry, setKeylessEntry] = useState(false);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (item && open) {
      setAccessControl(
        item.accessControl || {
          type: "team",
          allowedRoles: [],
          allowedUsers: [],
          allowedPositions: [],
        }
      );
      setTtl(item.ttl || "none");
      setKeylessEntry(item.keylessEntry || false);
    }
  }, [item, open]);

  const handleTypeChange = (type) => {
    setAccessControl((prev) => ({
      ...prev,
      type,
      allowedRoles: type === "roles" ? prev.allowedRoles : [],
      allowedUsers: type === "users" ? prev.allowedUsers : [],
      allowedPositions: type === "positions" ? prev.allowedPositions : [],
    }));
  };

  const handleRoleToggle = (role) => {
    setAccessControl((prev) => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter((r) => r !== role)
        : [...prev.allowedRoles, role],
    }));
  };

  const handlePositionToggle = (position) => {
    setAccessControl((prev) => ({
      ...prev,
      allowedPositions: prev.allowedPositions.includes(position)
        ? prev.allowedPositions.filter((p) => p !== position)
        : [...prev.allowedPositions, position],
    }));
  };

  const handleUserAdd = () => {
    if (userInput && !accessControl.allowedUsers.includes(userInput)) {
      setAccessControl((prev) => ({
        ...prev,
        allowedUsers: [...prev.allowedUsers, userInput],
      }));
      setUserInput("");
    }
  };

  const handleUserRemove = (email) => {
    setAccessControl((prev) => ({
      ...prev,
      allowedUsers: prev.allowedUsers.filter((u) => u !== email),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUserAdd();
    }
  };

  const handleSave = () => {
    onSave({
      ...item,
      accessControl,
      ttl: ttl === "none" ? null : ttl,
      keylessEntry,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-background text-foreground border border-border">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-semibold flex items-center gap-2.5 text-foreground">
            <Shield className="w-5 h-5 text-text-secondary text-sm" />
            Access Control
          </DialogTitle>
          <DialogDescription className="text-text-secondary pt-1 text-xs">
            Configure who can access {item?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 ">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground tracking-wide">Access Type</Label>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { value: "team", label: "Team", icon: Users },
                { value: "roles", label: "Roles", icon: Shield },
                { value: "users", label: "Users", icon: UserCheck },
                { value: "positions", label: "Positions", icon: Building2 },
              ].map((option) => {
                const isActive = accessControl.type === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    onClick={() => handleTypeChange(option.value)}
                    className={cn(
                      "relative h-auto flex-col items-center justify-center gap-2 py-3.5 px-3 rounded-lg border text-xs font-medium",
                      isActive
                        ? "border-border-strong text-foreground"
                        : "bg-surface-subtle border-border text-text-secondary hover:border-border-strong hover:text-muted-foreground",
                    )}
                  >
                    <div className={cn(
                      "relative p-1.5 rounded-md transition-all duration-300",
                      isActive ? "" : "bg-transparent group-hover:bg-surface-hover/60"
                    )}>
                      <option.icon className={cn(
                        "w-4 h-4 transition-all duration-300",
                        isActive ? "text-foreground" : "text-text-secondary group-hover:text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "transition-all duration-200",
                      isActive && "font-semibold tracking-wide"
                    )}>
                      {option.label}
                    </span>
                     
                  </Button>
                );
              })}
            </div>
          </div>

          {accessControl.type === "roles" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Allowed Roles</Label>
              <div className="flex flex-wrap gap-2">
                {roles.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-surface-subtle px-3 py-3 text-xs text-text-secondary">
                    No roles available yet. Roles will appear here after backend data is connected.
                  </p>
                ) : (
                  roles.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRoleToggle(role)}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-medium border transition-all duration-200",
                        accessControl.allowedRoles.includes(role)
                          ? "bg-surface-card border-border-strong text-foreground shadow-sm"
                          : "bg-surface-subtle border-border text-text-secondary hover:border-border-strong hover:text-muted-foreground hover:bg-surface-card",
                      )}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}


          {accessControl.type === "users" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Addresses</Label>
              <div className="space-y-2.5">
                {accessControl.allowedUsers.length > 0 && (
                  <div className="space-y-2">
                    {accessControl.allowedUsers.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-surface-subtle rounded-lg px-3.5 py-2 border border-border group hover:border-border-strong transition-all duration-200"
                      >
                        <div className="w-7 h-7 rounded-full bg-surface-card border border-border flex items-center justify-center">
                          <UserCheck className="w-3.5 h-3.5 text-text-secondary" />
                        </div>
                        <span className="flex-1 text-sm text-foreground">{email}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleUserRemove(email)}
                          className="text-text-tertiary hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div 
                  data-slot="input-group" 
                  role="group" 
                  className="group/input-group relative flex w-full min-w-0 items-center rounded-md border border-border transition-colors outline-none hover:border-border-strong has-[[data-slot=input-group-control]:focus-visible]:border-border-strong has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50"
                >
                  <Input
                    data-slot="input-group-control"
                    placeholder="email@example.com"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-none border-0 bg-transparent px-3 py-2 text-sm leading-5 text-foreground shadow-none placeholder:text-text-tertiary focus-visible:ring-0"
                  />
                  <div 
                    role="group" 
                    data-slot="input-group-addon" 
                    data-align="inline-end"
                    className="order-last flex cursor-text items-center justify-center gap-2 py-2 pl-2 pr-3 text-sm font-medium text-text-secondary select-none"
                  >
                    <Button
                      type="button"
                      size="icon-xs"
                      onClick={handleUserAdd}
                      className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {accessControl.type === "positions" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Positions</Label>
              <div className="flex flex-wrap gap-2">
                {positions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-surface-subtle px-3 py-3 text-xs text-text-secondary">
                    No positions available yet. Positions will appear here after backend data is connected.
                  </p>
                ) : (
                  positions.map((position) => (
                    <Button
                      key={position}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePositionToggle(position)}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-medium border transition-all duration-200",
                        accessControl.allowedPositions.includes(position)
                          ? "bg-surface-card border-border-strong text-foreground shadow-sm"
                          : "bg-surface-subtle border-border text-text-secondary hover:border-border-strong hover:text-muted-foreground hover:bg-surface-card",
                      )}
                    >
                      {position}
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mt-8" />
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Keyless Entry</Label>
                </div>
              </div>
              <Switch
                checked={keylessEntry}
                onCheckedChange={setKeylessEntry}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-strong"
              >
                <Switch.Thumb className="data-[state=checked]:bg-background data-[state=unchecked]:bg-muted-foreground" />
              </Switch>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
<div>
                  <Label className="text-sm text-muted-foreground">Time To Live</Label>
                </div>
                <FilterDropdown
                value={ttl}
                onValueChange={setTtl}
                options={TTL_OPTIONS}
                placeholder="Select expiration"
                height="h-9"
              />
              </div> 
             
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-border text-text-secondary hover:text-foreground hover:bg-surface-card hover:border-border-strong h-9 text-sm font-medium transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium transition-all duration-200"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
