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
import { Plus, Key, Database, Link, Mail, Server, Terminal, Box, Eye, EyeOff, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

const VAULT_TYPES = [
  { value: "password", label: "Password", icon: Key },
  { value: "api_key", label: "API Key", icon: Key },
  { value: "database", label: "Database", icon: Database },
  { value: "oauth", label: "OAuth", icon: Link },
  { value: "smtp", label: "SMTP", icon: Mail },
  { value: "certificate", label: "Certificate", icon: Server },
  { value: "ssh_key", label: "SSH Key", icon: Terminal },
  { value: "other", label: "Other", icon: Box },
];

const INITIAL_FORM_STATE = {
  name: "",
  type: "password",
  secret: "",
  url: "",
  notes: "",
};

export function AddVaultItemDialog({
  children,
  item = null,
  open = false,
  onOpenChange = () => {},
  onSave = () => {},
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showSecret, setShowSecret] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open if provided, otherwise use internal state
  const isControlled = open !== false;
  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = isControlled ? onOpenChange : (open) => {
    setInternalOpen(open);
    onOpenChange(open);
  };

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        type: item.type || "password",
        secret: item.password || item.apiKey || item.secret || "",
        url: item.url || "",
        notes: item.notes || "",
      });
    } else if (!dialogOpen) {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [item, dialogOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemToSave = {
      ...formData,
      id: item?.id || null,
      // Map secret to appropriate field based on type
      password: formData.type === "password" || formData.type === "database" || formData.type === "smtp" || formData.type === "certificate" || formData.type === "ssh_key" ? formData.secret : "",
      apiKey: formData.type === "api_key" ? formData.secret : "",
      username: "",
    };
    onSave(itemToSave);
    setFormData(INITIAL_FORM_STATE);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={dialogOnOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-[#161616] text-[#ededed] border border-[#2a2a2a]">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-semibold flex items-center gap-2.5 text-white">
            {item ? (
              <>
                <Edit3 className="w-5 h-5 text-[#737373]" />
                Edit Secret
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-[#737373]" />
                Add New Secret
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-[#737373] pt-1 text-xs">
            {item ? "Update the details for this secret." : "Add a new secret to your project vault."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="">
          <div className="space-y-5">
            {/* Secret Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Secret Name</Label>
              <Input
                placeholder="e.g. Production API Key"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a] h-9 transition-all duration-200"
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] focus:border-[#3a3a3a] h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
                  {VAULT_TYPES.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      className="focus:bg-[#2a2a2a] focus:text-[#ededed]"
                    >
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secret Value */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
                {formData.type === "api_key" ? "API Key" : "Secret Value"}
              </Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder={formData.type === "api_key" ? "sk_live_..." : "Enter secret value"}
                  value={formData.secret}
                  onChange={(e) => handleInputChange("secret", e.target.value)}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a] h-9 pr-10 font-mono transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#ededed] transition-colors duration-200"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* URL (Optional) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">URL / Endpoint <span className="text-[#525252]">(optional)</span></Label>
              <Input
                placeholder="e.g. https://console.aws.amazon.com"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a] h-9 transition-all duration-200"
              />
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Notes <span className="text-[#525252]">(optional)</span></Label>
              <Textarea
                placeholder="Add any notes about this secret..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] min-h-[80px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialogOnOpenChange(false)}
              className="flex-1 border-[#2a2a2a] text-[#737373] hover:text-white hover:bg-[#202020] hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#ededed] text-[#161616] hover:bg-white h-9 text-sm font-medium transition-all duration-200"
            >
              {item ? "Save Changes" : "Add Secret"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
