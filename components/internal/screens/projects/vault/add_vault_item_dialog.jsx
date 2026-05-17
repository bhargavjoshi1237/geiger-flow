// filepath: components/internal/screens/projects/vault/add_vault_item_dialog.jsx
"use client";

import React, { useState } from "react";
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
import {
  Plus,
  Key,
  Database,
  Link,
  Mail,
  Server,
  Terminal,
  Box,
  Eye,
  EyeOff,
  Edit3,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
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
  accessSetup: {
    method: "pin",
    pin: "",
    password: "",
    sessionMinutes: "15",
  },
};

const SETUP_METHODS = [
  {
    value: "pin",
    label: "PIN",
    description: "Fast numeric unlock for this secret",
    icon: LockKeyhole,
  },
  {
    value: "password",
    label: "Password",
    description: "Require a secret access password",
    icon: Key,
  },
  {
    value: "passkey",
    label: "Hardware passkey",
    description: "Use passkey or hardware authenticator",
    icon: Fingerprint,
  },
];

function buildInitialFormState(item) {
  if (!item) {
    return {
      ...INITIAL_FORM_STATE,
      accessSetup: { ...INITIAL_FORM_STATE.accessSetup },
    };
  }

  return {
    name: item.name || "",
    type: item.type || "password",
    secret: item.password || item.apiKey || item.secret || "",
    url: item.url || "",
    notes: item.notes || "",
    accessSetup: {
      ...INITIAL_FORM_STATE.accessSetup,
      ...(item.accessSetup || {}),
      method:
        item.accessSetup?.method ||
        item.accessSetup?.methods?.[0] ||
        INITIAL_FORM_STATE.accessSetup.method,
    },
  };
}

export function AddVaultItemDialog({
  children,
  item = null,
  open,
  onOpenChange = () => {},
  onSave = () => {},
}) {
  const [formData, setFormData] = useState(() => buildInitialFormState(item));
  const [showSecret, setShowSecret] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open if provided, otherwise use internal state
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = isControlled ? onOpenChange : (open) => {
    setInternalOpen(open);
    onOpenChange(open);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectSetupMethod = (method) => {
    setFormData((prev) => ({
      ...prev,
      accessSetup: {
        ...prev.accessSetup,
        method,
      },
    }));
  };

  const handleAccessSetupChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      accessSetup: {
        ...prev.accessSetup,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const accessMethod = formData.accessSetup.method || "pin";
    const itemToSave = {
      ...(item || {}),
      ...formData,
      id: item?.id || null,
      accessSetup: {
        ...formData.accessSetup,
        method: accessMethod,
        methods: [accessMethod],
        pin: accessMethod === "pin" ? formData.accessSetup.pin : "",
        password: accessMethod === "password"
          ? formData.accessSetup.password
          : "",
      },
      // Map secret to appropriate field based on type
      password: formData.type === "password" || formData.type === "database" || formData.type === "smtp" || formData.type === "certificate" || formData.type === "ssh_key" ? formData.secret : "",
      apiKey: formData.type === "api_key" ? formData.secret : "",
      username: "",
    };
    onSave(itemToSave);
    setFormData(buildInitialFormState(null));
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={dialogOnOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
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

            <div className="space-y-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg border border-[#333333] bg-[#202020]">
                  <ShieldCheck className="size-4 text-[#a3a3a3]" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
                    Access Secret
                  </Label>
                  <p className="mt-1 text-xs leading-5 text-[#737373]">
                    Configure the single method required to access this secret.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                {SETUP_METHODS.map((method) => {
                  const MethodIcon = method.icon;
                  const isSelected = formData.accessSetup.method === method.value;

                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => selectSetupMethod(method.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        isSelected
                          ? "border-[#474747] bg-[#242424] text-white"
                          : "border-[#2a2a2a] bg-[#161616] text-[#a3a3a3] hover:border-[#3a3a3a]",
                      )}
                    >
                      <MethodIcon className="size-4 shrink-0 text-[#a3a3a3]" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{method.label}</span>
                        <span className="block truncate text-xs text-[#737373]">
                          {method.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          isSelected ? "bg-emerald-400" : "bg-[#3a3a3a]",
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {formData.accessSetup.method === "pin" && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
                    PIN
                  </Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="4-8 digits"
                    value={formData.accessSetup.pin}
                    onChange={(e) => handleAccessSetupChange("pin", e.target.value.replace(/\D/g, ""))}
                    className="bg-[#161616] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] h-9"
                  />
                </div>
              )}

              {formData.accessSetup.method === "password" && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
                    Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Set access password"
                    value={formData.accessSetup.password}
                    onChange={(e) => handleAccessSetupChange("password", e.target.value)}
                    className="bg-[#161616] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] h-9"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wide">
                  Session TTL
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.accessSetup.sessionMinutes}
                  onChange={(e) => handleAccessSetupChange("sessionMinutes", e.target.value)}
                  className="bg-[#161616] border-[#2a2a2a] text-[#ededed] h-8"
                />
              </div>
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
