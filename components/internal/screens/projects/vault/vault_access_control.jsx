"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";
import { Plus, UserCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCESS_MODES, isEmail, normalizeEmails } from "@/features/vault/constants";
import { listVaultAccessEvents } from "@/features/vault/actions";

const OUTCOME_LABELS = {
  opened: { label: "Opened", className: "text-emerald-600 dark:text-emerald-400" },
  failed: { label: "Wrong code", className: "text-amber-600 dark:text-amber-400" },
  locked: { label: "Locked", className: "text-red-600 dark:text-red-400" },
};

const METHOD_LABELS = { pin: "PIN", password: "Password", passkey: "Passkey" };

function formatWhen(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Who may open a secret, plus its access history. Shown only to the secret's managers.
export function VaultAccessControl({ item, open = false, onOpenChange = () => {}, onSave = () => {} }) {
  const [mode, setMode] = useState(item?.accessMode || "project");
  const [emails, setEmails] = useState(item?.allowedEmails || []);
  const [emailInput, setEmailInput] = useState("");
  const [events, setEvents] = useState(null);

  useEffect(() => {
    if (!open || !item?.id) {
      return;
    }
    let cancelled = false;
    void listVaultAccessEvents(item.id).then((rows) => {
      if (!cancelled) setEvents(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [open, item?.id]);

  const emailInvalid = emailInput.trim() !== "" && !isEmail(emailInput);

  const addEmail = () => {
    if (!emailInput.trim() || emailInvalid) {
      return;
    }
    setEmails((prev) => normalizeEmails([...prev, emailInput]));
    setEmailInput("");
  };

  const peopleMissing = mode === "people" && emails.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-background text-foreground border border-border">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-semibold text-foreground">
            Access Control
          </DialogTitle>
          <DialogDescription className="text-text-secondary pt-1 text-xs">
            Choose who can open {item?.name}. They still need its PIN, password or their own passkey.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold text-muted-foreground tracking-wide">Who Can Open It</Label>
            <div className="grid gap-2" role="radiogroup" aria-label="Who can open it">
              {ACCESS_MODES.map((option) => {
                const OptionIcon = option.icon;
                const isActive = mode === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    variant="ghost"
                    onClick={() => setMode(option.value)}
                    className={cn(
                      "flex h-auto items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "border-border-strong bg-surface-active text-foreground"
                        : "border-border bg-surface-subtle text-muted-foreground hover:border-border-strong",
                    )}
                  >
                    <OptionIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className="block truncate text-xs text-text-secondary">{option.description}</span>
                    </span>
                    <span className={cn("size-2 rounded-full", isActive ? "bg-emerald-400" : "bg-surface-strong")} />
                  </Button>
                );
              })}
            </div>
          </div>

          {mode === "people" && (
            <Field label="People" hint="Email addresses of people in your organization">
              <div className="space-y-2.5">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface-subtle px-3.5 py-2"
                  >
                    <UserCheck className="size-3.5 text-text-secondary" />
                    <span className="flex-1 truncate text-sm text-foreground">{email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${email}`}
                      onClick={() => setEmails((prev) => prev.filter((entry) => entry !== email))}
                      className="text-text-tertiary hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmail();
                      }
                    }}
                    className="h-9 flex-1 bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={addEmail}
                    disabled={!emailInput.trim() || emailInvalid}
                    className="h-9 border border-border"
                  >
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>
                {emailInvalid && (
                  <p className="text-xs text-red-600 dark:text-red-400">Enter a full email address.</p>
                )}
              </div>
            </Field>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground tracking-wide">Access History</Label>
            {events === null ? (
              <p className="text-xs text-text-secondary">Loading…</p>
            ) : events.length === 0 ? (
              <p className="text-xs text-text-secondary">Nobody has opened this secret yet.</p>
            ) : (
              <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-lg border border-border bg-surface-subtle">
                {events.map((event) => {
                  const outcome = OUTCOME_LABELS[event.outcome] ?? OUTCOME_LABELS.opened;
                  return (
                    <li key={event.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                      <span className="min-w-0 flex-1 truncate text-foreground">{event.email || "Unknown"}</span>
                      <span className="text-text-secondary">{METHOD_LABELS[event.method] ?? event.method}</span>
                      <span className={outcome.className}>{outcome.label}</span>
                      <span className="text-text-tertiary">{formatWhen(event.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 text-sm font-medium transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave({ id: item.id, accessMode: mode, allowedEmails: mode === "people" ? emails : [] })}
            disabled={peopleMissing}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium transition-all duration-200"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
