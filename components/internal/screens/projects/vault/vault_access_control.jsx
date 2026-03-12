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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [ttl, setTtl] = useState("");
  const [keylessEntry, setKeylessEntry] = useState(false);

  useEffect(() => {
    if (item) {
      setAccessControl(
        item.accessControl || {
          type: "team",
          allowedRoles: [],
          allowedUsers: [],
          allowedPositions: [],
        },
      );
      setTtl(item.ttl || "");
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

  const handleUserAdd = (email) => {
    if (email && !accessControl.allowedUsers.includes(email)) {
      setAccessControl((prev) => ({
        ...prev,
        allowedUsers: [...prev.allowedUsers, email],
      }));
    }
  };

  const handleUserRemove = (email) => {
    setAccessControl((prev) => ({
      ...prev,
      allowedUsers: prev.allowedUsers.filter((u) => u !== email),
    }));
  };

  const handleSave = () => {
    onSave({
      ...item,
      accessControl,
      ttl: ttl || null,
      keylessEntry,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-[#161616] border-[#2a2a2a] text-white rounded-2xl">
        <DialogHeader className="pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            Access Control
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3] text-sm">
            Configure who can access "{item?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Access Type */}
          <div className="space-y-3">
            <Label className="text-[13px] font-medium text-[#a3a3a3]">Access Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "team", label: "Team", icon: Users },
                { value: "roles", label: "Roles", icon: Shield },
                { value: "users", label: "Users", icon: UserCheck },
                { value: "positions", label: "Positions", icon: Building2 },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTypeChange(option.value)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border text-[13px] font-medium transition-all",
                    accessControl.type === option.value
                      ? "bg-[#202020] border-[#474747] text-white"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#3a3a3a]",
                  )}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          {accessControl.type === "roles" && (
            <div className="space-y-3">
              <Label className="text-[13px] font-medium text-[#a3a3a3]">Allowed Roles</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                      accessControl.allowedRoles.includes(role)
                        ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-[#a3a3a3]",
                    )}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Selection */}
          {accessControl.type === "users" && (
            <div className="space-y-3">
              <Label className="text-[13px] font-medium text-[#a3a3a3]">Email Addresses</Label>
              <div className="space-y-2">
                {accessControl.allowedUsers.map((email, index) => (
                  <div key={index} className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-[#2a2a2a]">
                    <UserCheck className="w-4 h-4 text-green-400" />
                    <span className="flex-1 text-[13px] text-white">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleUserRemove(email)}
                      className="text-[#737373] hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUserAdd(e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      handleUserAdd(input.value);
                      input.value = "";
                    }}
                    className="border-[#2a2a2a] text-[#a3a3a3] hover:text-white hover:bg-[#202020]"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Position Selection */}
          {accessControl.type === "positions" && (
            <div className="space-y-3">
              <Label className="text-[13px] font-medium text-[#a3a3a3]">Positions</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_POSITIONS.map((position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => handlePositionToggle(position)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                      accessControl.allowedPositions.includes(position)
                        ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-[#a3a3a3]",
                    )}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-[#2a2a2a]" />

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="text-[13px] font-medium text-white">Security</h3>

            {/* Keyless Entry */}
            <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                {keylessEntry ? (
                  <Unlock className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-[#737373]" />
                )}
                <div>
                  <Label className="text-[13px] font-medium text-white">Keyless Entry</Label>
                  <p className="text-[11px] text-[#737373]">
                    {keylessEntry ? "Anyone can view" : "Password required"}
                  </p>
                </div>
              </div>
              <Switch
                checked={keylessEntry}
                onCheckedChange={setKeylessEntry}
              />
            </div>

            {/* TTL */}
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-[#a3a3a3] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Expires
              </Label>
              <Select value={ttl || "none"} onValueChange={setTtl}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectItem value="none" className="focus:bg-[#2a2a2a]">Never</SelectItem>
                  <SelectItem value="1h" className="focus:bg-[#2a2a2a]">1 hour</SelectItem>
                  <SelectItem value="6h" className="focus:bg-[#2a2a2a]">6 hours</SelectItem>
                  <SelectItem value="24h" className="focus:bg-[#2a2a2a]">24 hours</SelectItem>
                  <SelectItem value="7d" className="focus:bg-[#2a2a2a]">7 days</SelectItem>
                  <SelectItem value="30d" className="focus:bg-[#2a2a2a]">30 days</SelectItem>
                  <SelectItem value="90d" className="focus:bg-[#2a2a2a]">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a2a2a] text-[#a3a3a3] hover:text-white hover:bg-[#202020]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-white text-black hover:bg-[#e5e5e5]"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
