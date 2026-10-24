"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";
import {
  Box,
  Database,
  Eye,
  EyeOff,
  Key,
  Link,
  Mail,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCESS_METHODS, validateAccessCode } from "@/features/vault/constants";

export const VAULT_TYPES = [
  { value: "password", label: "Password", icon: Key },
  { value: "api_key", label: "API Key", icon: Key },
  { value: "database", label: "Database", icon: Database },
  { value: "oauth", label: "OAuth", icon: Link },
  { value: "smtp", label: "SMTP", icon: Mail },
  { value: "certificate", label: "Certificate", icon: Server },
  { value: "ssh_key", label: "SSH Key", icon: Terminal },
  { value: "other", label: "Other", icon: Box },
];

// The stored secret and code are never sent to the browser, so an edit starts with both empty ("keep current").
function buildInitialFormState(item) {
  return {
    name: item?.name || "",
    type: item?.type || "password",
    secret: "",
    url: item?.url || "",
    notes: item?.notes || "",
    accessMethod: item?.accessMethod || "pin",
    code: "",
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

  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = isControlled ? onOpenChange : (next) => {
    setInternalOpen(next);
    onOpenChange(next);
  };

  const isEdit = Boolean(item);
  const method = formData.accessMethod;
  const usesCode = method !== "passkey";
  // A code is needed for a new secret, when switching to a PIN or password, or when none is stored yet.
  const codeRequired =
    usesCode && (!isEdit || item.accessMethod !== method || !item.hasCode);
  const codeError = formData.code ? validateAccessCode(method, formData.code) : null;
  // A secret whose value never saved must get one now; otherwise a blank field keeps the stored value.
  const secretRequired = !isEdit || !item.hasSecret;
  const secretMissing = secretRequired && !formData.secret;
  const canSubmit =
    formData.name.trim() && !secretMissing && !codeError && (!codeRequired || formData.code);

  const set = (field) => (value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSave({
      id: item?.id || null,
      name: formData.name,
      type: formData.type,
      url: formData.url,
      notes: formData.notes,
      accessMethod: method,
      secret: formData.secret,
      code: usesCode ? formData.code : "",
    });
    setFormData(buildInitialFormState(null));
  };

  const codeLabel = method === "pin" ? "PIN" : "Password";
  const codeHint = isEdit && !codeRequired
    ? "Leave blank to keep the current one"
    : method === "pin"
      ? "4 to 8 digits"
      : "At least 8 characters";

  return (
    <Dialog open={dialogOpen} onOpenChange={dialogOnOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-background text-foreground border border-border">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-semibold text-foreground">
            {isEdit ? "Edit Secret" : "Add New Secret"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary pt-1 text-xs">
            {isEdit
              ? "Update the details for this secret. The stored value stays hidden."
              : "Add a new secret to your project vault. It's encrypted as soon as it's saved."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Field label="Secret Name" htmlFor="vault-secret-name">
              <Input
                id="vault-secret-name"
                placeholder="e.g. Production API Key"
                value={formData.name}
                onChange={(e) => set("name")(e.target.value)}
                required
                className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong focus:ring-1 focus:ring-ring h-9 transition-all duration-200"
              />
            </Field>

            <Field label="Type">
              <Select value={formData.type} onValueChange={set("type")}>
                <SelectTrigger className="bg-surface-subtle border-border text-foreground focus:border-border-strong h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-surface-subtle border-border text-foreground">
                  {VAULT_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="focus:bg-surface-hover focus:text-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={formData.type === "api_key" ? "API Key" : "Secret Value"}
              hint={secretRequired ? undefined : "Leave blank to keep the current value"}
            >
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder={secretRequired ? "Enter secret value" : "Enter a new value to replace it"}
                  value={formData.secret}
                  onChange={(e) => set("secret")(e.target.value)}
                  autoComplete="off"
                  className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong focus:ring-1 focus:ring-ring h-9 pr-10 font-mono transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={showSecret ? "Hide what you typed" : "Show what you typed"}
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground transition-colors duration-200"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </Field>

            <Field label="URL / Endpoint" hint="Optional">
              <Input
                placeholder="e.g. https://console.aws.amazon.com"
                value={formData.url}
                onChange={(e) => set("url")(e.target.value)}
                className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong focus:ring-1 focus:ring-ring h-9 transition-all duration-200"
              />
            </Field>

            <Field label="Notes" hint="Optional">
              <Textarea
                placeholder="Add any notes about this secret..."
                value={formData.notes}
                onChange={(e) => set("notes")(e.target.value)}
                className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong min-h-[80px] resize-none"
              />
            </Field>

            <div className="space-y-3 rounded-xl border border-border bg-surface-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg border border-border bg-surface-card">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Unlock With
                  </p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    What someone must enter or confirm before the secret is shown.
                  </p>
                </div>
              </div>

              <div className="grid gap-2" role="radiogroup" aria-label="Unlock with">
                {ACCESS_METHODS.map((option) => {
                  const OptionIcon = option.icon;
                  const isSelected = method === option.value;

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      variant="ghost"
                      onClick={() => setFormData((prev) => ({ ...prev, accessMethod: option.value, code: "" }))}
                      className={cn(
                        "flex h-auto items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        isSelected
                          ? "border-border-strong bg-surface-active text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-border-strong",
                      )}
                    >
                      <OptionIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{option.label}</span>
                        <span className="block truncate text-xs text-text-secondary">
                          {option.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          isSelected ? "bg-emerald-400" : "bg-surface-strong",
                        )}
                      />
                    </Button>
                  );
                })}
              </div>

              {usesCode ? (
                <Field label={codeLabel} hint={codeHint}>
                  <Input
                    type="password"
                    inputMode={method === "pin" ? "numeric" : undefined}
                    maxLength={method === "pin" ? 8 : undefined}
                    placeholder={method === "pin" ? "4-8 digits" : "Set access password"}
                    value={formData.code}
                    onChange={(e) =>
                      set("code")(method === "pin" ? e.target.value.replace(/\D/g, "") : e.target.value)
                    }
                    autoComplete="new-password"
                    className="bg-background border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong h-9"
                  />
                  {codeError && (
                    <p className="pt-1 text-xs text-red-600 dark:text-red-400">{codeError}</p>
                  )}
                </Field>
              ) : (
                <p className="text-xs leading-5 text-text-secondary">
                  Each person who opens this secret confirms with a passkey registered to their own account. Add
                  yours from <span className="font-medium text-foreground">Passkeys</span> at the top of the Vault.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => dialogOnOpenChange(false)}
              className="flex-1 h-9 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium transition-all duration-200"
            >
              {isEdit ? "Save Changes" : "Add Secret"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
