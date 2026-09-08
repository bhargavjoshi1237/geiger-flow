"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";
import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_KEY_SCOPE_OPTIONS } from "@/features/security/constants";

// Mints a short NON-SECRET prefix client-side (format: gfk_ab12cd). The full
// key is never generated or stored here — only this display prefix persists.
function generateKeyPrefix() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `gfk_${hex.slice(0, 6)}`;
}

const EMPTY_FORM = {
  name: "",
  scopes: [],
  expiresAt: "",
};

export function NewApiKeyDialog({ children, open, onOpenChange, onCreate }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [keyPrefix, setKeyPrefix] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    // Deferred so the effect body itself stays free of synchronous setState.
    void Promise.resolve().then(() => {
      setFormData(EMPTY_FORM);
      setKeyPrefix(generateKeyPrefix());
    });
  }, [open]);

  const toggleScope = (scope) =>
    setFormData((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((entry) => entry !== scope)
        : [...prev.scopes, scope],
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !keyPrefix) {
      return;
    }

    setSubmitting(true);
    try {
      await onCreate?.({
        name: formData.name,
        scopes: formData.scopes,
        expiresAt: formData.expiresAt || null,
        keyPrefix,
      });
    } finally {
      setSubmitting(false);
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg bg-background border-border text-foreground p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl flex items-center gap-2 font-semibold">
            <KeyRound className="w-5 h-5 text-muted-foreground" />
            Create API Key
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Only a short identifying prefix is stored — the full secret never
            leaves your machine.
          </DialogDescription>
        </DialogHeader>

        <form
          id="new-api-key-form"
          onSubmit={handleSubmit}
          className="grid gap-4 px-6 py-4"
        >
          <Field label="Name *" htmlFor="api-key-name">
            <Input
              id="api-key-name"
              placeholder="e.g., CI deploy token"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
            />
          </Field>

          <Field
            label="Scopes"
            hint="Grant the narrowest scopes that still let the integration work."
          >
            <div className="flex flex-wrap gap-2">
              {API_KEY_SCOPE_OPTIONS.map((scope) => {
                const selected = formData.scopes.includes(scope);
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      selected
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-surface-card text-text-secondary hover:bg-surface-hover hover:text-foreground",
                    )}
                  >
                    {scope}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Key prefix" htmlFor="api-key-prefix">
              <Input
                id="api-key-prefix"
                readOnly
                value={keyPrefix}
                className="bg-surface-subtle border-border text-muted-foreground h-10 text-sm font-mono"
              />
            </Field>
            <Field label="Expires" htmlFor="api-key-expiry">
              <Input
                id="api-key-expiry"
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))
                }
                className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
              />
            </Field>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange?.(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-surface-card"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-api-key-form"
            disabled={!formData.name.trim() || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary min-w-[120px]"
          >
            {submitting ? "Creating..." : "Create Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
