// filepath: components/internal/screens/projects/vault/add_vault_item_dialog.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Key, Database, Link, Mail, Server, Terminal, Box, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const VAULT_TYPES = [
  { value: "database", label: "Database", icon: Database },
  { value: "api_key", label: "API Key", icon: Key },
  { value: "password", label: "Password", icon: Key },
  { value: "oauth", label: "OAuth", icon: Link },
  { value: "smtp", label: "SMTP", icon: Mail },
  { value: "certificate", label: "Certificate", icon: Server },
  { value: "ssh_key", label: "SSH Key", icon: Terminal },
  { value: "other", label: "Other", icon: Box },
];

const INITIAL_FORM_STATE = {
  name: "",
  type: "password",
  username: "",
  password: "",
  apiKey: "",
  url: "",
  notes: "",
  accessControl: {
    type: "team",
    allowedRoles: [],
    allowedUsers: [],
    allowedPositions: [],
  },
  ttl: "",
  keylessEntry: false,
};

export function AddVaultItemDialog({
  children,
  item = null,
  open = false,
  onOpenChange = () => {},
  onSave = () => {},
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        password: item.password || "",
        apiKey: item.apiKey || "",
        accessControl: item.accessControl || INITIAL_FORM_STATE.accessControl,
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [item, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAccessControlChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      accessControl: {
        ...prev.accessControl,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemToSave = {
      ...formData,
      id: item?.id || null,
    };
    onSave(itemToSave);
    setFormData(INITIAL_FORM_STATE);
  };

  const getFieldsForType = (type) => {
    switch (type) {
      case "database":
        return { showUsername: true, showPassword: true, showUrl: true };
      case "api_key":
        return { showUsername: false, showApiKey: true, showUrl: true };
      case "password":
        return { showUsername: true, showPassword: true, showUrl: true };
      case "oauth":
        return { showUsername: true, showUrl: true };
      case "smtp":
        return { showUsername: true, showPassword: true, showUrl: true };
      case "certificate":
        return { showUsername: false, showPassword: true, showUrl: false };
      case "ssh_key":
        return { showUsername: false, showPassword: true, showUrl: false };
      default:
        return { showUsername: true, showPassword: true, showUrl: true };
    }
  };

  const fields = getFieldsForType(formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-[#161616] border-[#2a2a2a] text-white rounded-2xl">
        <DialogHeader className="pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-lg font-semibold">
            {item ? "Edit Secret" : "Add New Secret"}
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3] text-sm">
            {item ? "Update the details for this secret." : "Add a new secret to your project vault."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a] rounded-xl p-1">
              <TabsTrigger value="details" className="text-[13px] rounded-lg data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white">
                Details
              </TabsTrigger>
              <TabsTrigger value="access" className="text-[13px] rounded-lg data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white">
                Access
              </TabsTrigger>
              <TabsTrigger value="security" className="text-[13px] rounded-lg data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white">
                Security
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#a3a3a3]">Secret Name</Label>
                <Input
                  placeholder="e.g. Production Database"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] focus:border-[#474747] h-10"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#a3a3a3]">Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {VAULT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange("type", type.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                        formData.type === type.value
                          ? "bg-[#202020] border-[#474747] text-white"
                          : "bg-[#1a1a1a] border-[#2a2a2a] text-[#737373] hover:border-[#3a3a3a]",
                      )}
                    >
                      <type.icon className="w-4 h-4" strokeWidth={1.8} />
                      <span className="text-[11px]">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {fields.showUsername && (
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#a3a3a3]">Username</Label>
                  <Input
                    placeholder="e.g. admin"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] focus:border-[#474747] h-10"
                  />
                </div>
              )}

              {(fields.showPassword || fields.showApiKey) && (
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#a3a3a3]">
                    {formData.type === "api_key" ? "API Key" : "Password / Secret"}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={formData.type === "api_key" ? "sk_live_..." : "Enter secret value"}
                      value={formData.password || formData.apiKey}
                      onChange={(e) => handleInputChange(formData.type === "api_key" ? "apiKey" : "password", e.target.value)}
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] focus:border-[#474747] h-10 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {fields.showUrl && (
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#a3a3a3]">URL / Endpoint</Label>
                  <Input
                    placeholder="e.g. https://console.aws.amazon.com"
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] focus:border-[#474747] h-10"
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#a3a3a3]">Notes</Label>
                <Textarea
                  placeholder="Optional notes about this secret..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] focus:border-[#474747] min-h-[80px] resize-none"
                />
              </div>
            </TabsContent>

            {/* Access Tab */}
            <TabsContent value="access" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#a3a3a3]">Who can access?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "team", label: "Entire Team" },
                    { value: "roles", label: "By Role" },
                    { value: "users", label: "By User" },
                    { value: "positions", label: "By Position" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleAccessControlChange("type", option.value)}
                      className={cn(
                        "p-3 rounded-xl border text-[13px] font-medium transition-all",
                        formData.accessControl.type === option.value
                          ? "bg-[#202020] border-[#474747] text-white"
                          : "bg-[#1a1a1a] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#3a3a3a]",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.accessControl.type === "roles" && (
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#a3a3a3]">Allowed Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {["admin", "member", "viewer", "devops", "billing"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          const currentRoles = formData.accessControl.allowedRoles || [];
                          const newRoles = currentRoles.includes(role)
                            ? currentRoles.filter((r) => r !== role)
                            : [...currentRoles, role];
                          handleAccessControlChange("allowedRoles", newRoles);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                          formData.accessControl.allowedRoles?.includes(role)
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

              {formData.accessControl.type === "users" && (
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#a3a3a3]">Email Addresses</Label>
                  <div className="space-y-2">
                    {(formData.accessControl.allowedUsers || []).map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...formData.accessControl.allowedUsers];
                            newEmails[index] = e.target.value;
                            handleAccessControlChange("allowedUsers", newEmails);
                          }}
                          placeholder="email@example.com"
                          className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#737373] h-9"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newEmails = formData.accessControl.allowedUsers.filter((_, i) => i !== index);
                            handleAccessControlChange("allowedUsers", newEmails);
                          }}
                          className="text-[#737373] hover:text-red-400"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleAccessControlChange("allowedUsers", [
                          ...(formData.accessControl.allowedUsers || []),
                          "",
                        ]);
                      }}
                      className="border-[#2a2a2a] text-[#a3a3a3] hover:text-white hover:bg-[#202020] text-[12px]"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Email
                    </Button>
                  </div>
                </div>
              )}

              {formData.accessControl.type === "positions" && (
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#a3a3a3]">Positions</Label>
                  <div className="flex flex-wrap gap-2">
                    {["CTO", "Engineering Manager", "Tech Lead", "DevOps Engineer", "CFO", "Finance Manager"].map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => {
                          const current = formData.accessControl.allowedPositions || [];
                          const newPositions = current.includes(position)
                            ? current.filter((p) => p !== position)
                            : [...current, position];
                          handleAccessControlChange("allowedPositions", newPositions);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                          formData.accessControl.allowedPositions?.includes(position)
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
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
                <div>
                  <Label className="text-[13px] font-medium text-white">Keyless Entry</Label>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    View secret without password
                  </p>
                </div>
                <Switch
                  checked={formData.keylessEntry}
                  onCheckedChange={(checked) => handleInputChange("keylessEntry", checked)}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#a3a3a3]">Expires In (TTL)</Label>
                <Select
                  value={formData.ttl || "none"}
                  onValueChange={(value) => handleInputChange("ttl", value === "none" ? "" : value)}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectItem value="none" className="focus:bg-[#2a2a2a]">Never expires</SelectItem>
                    <SelectItem value="1h" className="focus:bg-[#2a2a2a]">1 hour</SelectItem>
                    <SelectItem value="24h" className="focus:bg-[#2a2a2a]">24 hours</SelectItem>
                    <SelectItem value="7d" className="focus:bg-[#2a2a2a]">7 days</SelectItem>
                    <SelectItem value="30d" className="focus:bg-[#2a2a2a]">30 days</SelectItem>
                    <SelectItem value="90d" className="focus:bg-[#2a2a2a]">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a] text-[#a3a3a3] hover:text-white hover:bg-[#202020]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-[#e5e5e5]"
            >
              {item ? "Save Changes" : "Add Secret"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
