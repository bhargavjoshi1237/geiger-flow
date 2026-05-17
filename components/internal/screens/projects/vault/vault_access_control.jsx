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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Shield,
  UserCheck,
  Building2,
  Plus,
  X,
  Clock,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FilterDropdown from "../overview/filter_dropdown";

const ALL_ROLES = ["admin", "member", "viewer", "devops", "billing", "security"];
const ALL_POSITIONS = [
  "CTO",
  "Engineering Manager",
  "Tech Lead",
  "Senior Engineer",
  "DevOps Engineer",
  "CFO",
  "Finance Manager",
  "VP of Engineering",
  "Product Manager",
];

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
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-[#161616] text-[#ededed] border border-[#2a2a2a]">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-semibold flex items-center gap-2.5 text-white">
            <Shield className="w-5 h-5 text-[#737373] text-sm" />
            Access Control
          </DialogTitle>
          <DialogDescription className="text-[#737373] pt-1 text-xs">
            Configure who can access {item?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 ">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-[#a3a3a3] tracking-wide">Access Type</Label>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { value: "team", label: "Team", icon: Users },
                { value: "roles", label: "Roles", icon: Shield },
                { value: "users", label: "Users", icon: UserCheck },
                { value: "positions", label: "Positions", icon: Building2 },
              ].map((option) => {
                const isActive = accessControl.type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTypeChange(option.value)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-2 py-3.5 px-3 rounded-lg border text-xs font-medium",
                      isActive
                        ? "border-[#404040] text-white"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-[#737373] hover:border-[#3a3a3a] hover:text-[#a3a3a3]",
                    )}
                  >
                    <div className={cn(
                      "relative p-1.5 rounded-md transition-all duration-300",
                      isActive ? "" : "bg-transparent group-hover:bg-[#2a2a2a]/60"
                    )}>
                      <option.icon className={cn(
                        "w-4 h-4 transition-all duration-300",
                        isActive ? "text-white" : "text-[#666666] group-hover:text-[#999999]"
                      )} />
                    </div>
                    <span className={cn(
                      "transition-all duration-200",
                      isActive && "font-semibold tracking-wide"
                    )}>
                      {option.label}
                    </span>
                     
                  </button>
                );
              })}
            </div>
          </div>

          {accessControl.type === "roles" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Allowed Roles</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium border transition-all duration-200",
                      accessControl.allowedRoles.includes(role)
                        ? "bg-[#202020] border-[#474747] text-white shadow-sm"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-[#737373] hover:border-[#3a3a3a] hover:text-[#a3a3a3] hover:bg-[#1f1f1f]",
                    )}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}


          {accessControl.type === "users" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Email Addresses</Label>
              <div className="space-y-2.5">
                {accessControl.allowedUsers.length > 0 && (
                  <div className="space-y-2">
                    {accessControl.allowedUsers.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-3.5 py-2 border border-[#2a2a2a] group hover:border-[#3a3a3a] transition-all duration-200"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#202020] border border-[#333333] flex items-center justify-center">
                          <UserCheck className="w-3.5 h-3.5 text-[#737373]" />
                        </div>
                        <span className="flex-1 text-sm text-[#ededed]">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleUserRemove(email)}
                          className="text-[#525252] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div 
                  data-slot="input-group" 
                  role="group" 
                  className="group/input-group relative flex w-full min-w-0 items-center rounded-[var(--input-box-radius)] border border-[#2a2a2a] transition-colors outline-none hover:border-[#3a3a3a] has-[[data-slot=input-group-control]:focus-visible]:border-[#3a3a3a] has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-[#3a3a3a]/50"
                >
                  <input 
                    data-slot="input-group-control"
                    placeholder="email@example.com"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-none border-0 bg-transparent px-[var(--input-box-padding-x)] py-[var(--input-box-padding-y)] text-sm leading-5 text-[#ededed] outline-none ring-0 placeholder:text-[#525252] focus-visible:ring-0"
                  />
                  <div 
                    role="group" 
                    data-slot="input-group-addon" 
                    data-align="inline-end"
                    className="flex h-auto cursor-text items-center justify-center gap-[var(--input-box-icon-gap)] py-[var(--input-box-padding-y)] pl-[var(--input-box-icon-gap)] text-sm font-medium text-[#737373] select-none order-last pr-[var(--input-box-padding-x)]"
                  >
                    <button
                      type="button"
                      onClick={handleUserAdd}
                      className="flex size-5 items-center justify-center rounded-full bg-[#ededed] text-[#161616] hover:bg-white transition-all duration-200"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {accessControl.type === "positions" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Positions</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_POSITIONS.map((position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => handlePositionToggle(position)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium border transition-all duration-200",
                      accessControl.allowedPositions.includes(position)
                        ? "bg-[#202020] border-[#474747] text-white shadow-sm"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-[#737373] hover:border-[#3a3a3a] hover:text-[#a3a3a3] hover:bg-[#1f1f1f]",
                    )}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8" />
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div>
                  <Label className="text-sm text-[#a3a3a3]">Keyless Entry</Label>
                </div>
              </div>
              <Switch
                checked={keylessEntry}
                onCheckedChange={setKeylessEntry}
                className="data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333333]"
              >
                <Switch.Thumb className="data-[state=checked]:bg-[#161616] data-[state=unchecked]:bg-[#737373]" />
              </Switch>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
<div>
                  <Label className="text-sm text-[#a3a3a3]">Time To Live</Label>
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
            className="flex-1 border-[#2a2a2a] text-[#737373] hover:text-white hover:bg-[#202020] hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-[#ededed] text-[#161616] hover:bg-white h-9 text-sm font-medium transition-all duration-200"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
