"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";
import { Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";
import {
  listMyPasskeys,
  passkeyErrorMessage,
  passkeysSupported,
  registerPasskey,
  removePasskey,
} from "@/features/vault/passkeys";

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : "Never";
}

// The signed-in member's own passkeys. They work for every passkey secret they're allowed to open, in any project.
export function PasskeysDialog({ open = false, onOpenChange = () => {} }) {
  const [passkeys, setPasskeys] = useState(null);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const supported = passkeysSupported();

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    void listMyPasskeys().then((rows) => {
      if (cancelled) return;
      if (rows === null) toast.error("Couldn't load your passkeys.");
      setPasskeys(rows ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleAdd = async () => {
    setAdding(true);
    const result = await registerPasskey(name);
    setAdding(false);
    if (result?.ok) {
      setPasskeys((prev) => [...(prev ?? []), {
        id: result.passkey.id,
        name: result.passkey.name,
        backedUp: result.passkey.backed_up,
        createdAt: result.passkey.created_at,
        lastUsedAt: result.passkey.last_used_at,
      }]);
      setName("");
      toast.success("Passkey added");
    } else if (result?.error !== "cancelled") {
      toast.error(passkeyErrorMessage(result?.error));
    }
  };

  const handleRemove = async (id) => {
    const previous = passkeys;
    setConfirmId(null);
    setPasskeys((prev) => prev.filter((passkey) => passkey.id !== id));
    if (await removePasskey(id)) {
      toast.success("Passkey removed");
    } else {
      setPasskeys(previous);
      toast.error("Couldn't remove the passkey.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto bg-background text-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Your Passkeys
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            Use a passkey to open vault secrets that ask for one. Passkeys belong to your account, so they work in
            every project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {passkeys === null ? (
            <p className="text-xs text-text-secondary">Loading…</p>
          ) : passkeys.length === 0 ? (
            <p className="text-xs text-text-secondary">You haven&apos;t added a passkey yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface-subtle">
              {passkeys.map((passkey) => (
                <li key={passkey.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Fingerprint className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{passkey.name}</p>
                    <p className="text-xs text-text-secondary">
                      Added {formatDate(passkey.createdAt)} · Last used {formatDate(passkey.lastUsedAt)}
                    </p>
                  </div>
                  {confirmId === passkey.id ? (
                    <Button
                      size="sm"
                      onClick={() => handleRemove(passkey.id)}
                      className="h-7 bg-red-500/90 text-white hover:bg-red-500"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${passkey.name}`}
                      onClick={() => setConfirmId(passkey.id)}
                      className="text-text-tertiary hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {supported ? (
            <Field label="New passkey name" hint="Optional, such as the device it's on">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g. Work laptop"
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 flex-1 bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary"
                />
                <Button
                  onClick={handleAdd}
                  disabled={adding}
                  className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Add passkey
                </Button>
              </div>
            </Field>
          ) : (
            <p className="text-xs text-text-secondary">
              This browser doesn&apos;t support passkeys, so you can&apos;t add one here.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-9">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
