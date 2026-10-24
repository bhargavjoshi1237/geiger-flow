"use client";

import React, { useState } from "react";
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
import { Copy, Fingerprint, Loader2, TriangleAlert } from "lucide-react";
import { revealVaultSecret } from "@/features/vault/actions";
import { passkeyErrorMessage, passkeysSupported, revealWithPasskey } from "@/features/vault/passkeys";

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Turns a failed vault_reveal result into the sentence shown under the field.
function revealErrorMessage(result, method) {
  const codeName = method === "pin" ? "PIN" : "password";
  switch (result?.error) {
    case "wrong_code":
      return `Wrong ${codeName}. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} left before it locks for 15 minutes.`;
    case "locked":
      return `Too many wrong attempts. Try again after ${formatTime(result.lockedUntil)}.`;
    case "no_code":
      return `No ${codeName} is set for this secret yet. Ask the person who added it to set one.`;
    case "no_secret":
      return "No secret is saved for this item.";
    case "forbidden":
      return "You don't have access to this secret.";
    default:
      return "Couldn't open the secret. Try again.";
  }
}

// The revealed value lives only in this dialog's state and is dropped when the dialog closes.
export function VaultCredentialAccessDialog({
  item,
  open = false,
  onOpenChange = () => {},
  onManagePasskeys = () => {},
}) {
  const method = item?.accessMethod || "pin";
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState(null);
  const [error, setError] = useState("");
  const [needsPasskey, setNeedsPasskey] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pending, setPending] = useState(false);

  const handleCode = async (event) => {
    event.preventDefault();
    if (!code || pending) {
      return;
    }
    setPending(true);
    const result = await revealVaultSecret(item.id, code);
    setPending(false);
    setCode("");

    if (result?.ok) {
      setError("");
      setSecret(result.secret ?? "");
      return;
    }
    setLocked(result?.error === "locked");
    setError(revealErrorMessage(result, method));
  };

  const handlePasskey = async () => {
    if (pending) {
      return;
    }
    setPending(true);
    const result = await revealWithPasskey(item.id);
    setPending(false);

    if (result?.ok) {
      setError("");
      setSecret(result.secret ?? "");
      return;
    }
    if (result?.error === "cancelled") {
      return;
    }
    setNeedsPasskey(result?.error === "no_passkey");
    setError(passkeyErrorMessage(result?.error));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret ?? "");
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy the secret.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-background text-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Access Secret
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            {method === "passkey"
              ? `Confirm with your passkey to open ${item?.name || "this secret"}.`
              : `Enter the ${method === "pin" ? "PIN" : "password"} for ${item?.name || "this secret"}.`}
          </DialogDescription>
        </DialogHeader>

        {secret === null ? (
          <form id="vault-access-form" onSubmit={handleCode} className="grid gap-4">
            {method === "passkey" ? (
              passkeysSupported() ? (
                <Button
                  type="button"
                  onClick={handlePasskey}
                  disabled={pending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9"
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <Fingerprint className="size-4" />}
                  Use passkey
                </Button>
              ) : (
                <p className="text-xs text-text-secondary">
                  This browser doesn&apos;t support passkeys. Open Flow in a browser that does to open this secret.
                </p>
              )
            ) : (
              <Field label={method === "pin" ? "PIN" : "Password"}>
                <Input
                  type="password"
                  inputMode={method === "pin" ? "numeric" : undefined}
                  maxLength={method === "pin" ? 8 : undefined}
                  placeholder={method === "pin" ? "Enter PIN" : "Enter password"}
                  value={code}
                  onChange={(e) =>
                    setCode(method === "pin" ? e.target.value.replace(/\D/g, "") : e.target.value)
                  }
                  disabled={locked || pending}
                  autoComplete="off"
                  autoFocus
                  className="bg-background border-border text-foreground placeholder:text-text-tertiary h-9"
                />
              </Field>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-800 dark:text-red-200">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>
                  {error}
                  {needsPasskey && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={onManagePasskeys}
                      className="ml-1 h-auto p-0 text-xs"
                    >
                      Add a passkey
                    </Button>
                  )}
                </span>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
              <code className="block min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                {secret || "No secret saved"}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Copy secret"
                onClick={handleCopy}
                className="text-text-secondary hover:text-foreground"
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <p className="text-xs leading-5 text-text-secondary">
              Opening this secret was recorded in the project&apos;s activity log and in its access history.
            </p>
          </div>
        )}

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9"
          >
            Close
          </Button>
          {secret === null && method !== "passkey" && (
            <Button
              type="submit"
              form="vault-access-form"
              disabled={!code || locked || pending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Access Secret
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
