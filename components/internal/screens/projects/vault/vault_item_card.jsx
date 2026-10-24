"use client";

import React from "react";
import {
  Box,
  Copy,
  Database,
  Fingerprint,
  Key,
  Link,
  LockKeyhole,
  Mail,
  Pencil,
  Server,
  Shield,
  Terminal,
  Trash2,
} from "lucide-react";
import { ActionMenu, Button } from "@geiger/ui";
import { ACCESS_MODE_LABELS } from "@/features/vault/constants";

const METHOD_META = {
  pin: { label: "PIN", icon: LockKeyhole },
  password: { label: "Password", icon: Key },
  passkey: { label: "Passkey", icon: Fingerprint },
};

function VaultTypeIcon({ type }) {
  switch (type) {
    case "database":
      return <Database className="w-4 h-4" />;
    case "api_key":
      return <Key className="w-4 h-4" />;
    case "oauth":
      return <Link className="w-4 h-4" />;
    case "smtp":
      return <Mail className="w-4 h-4" />;
    case "password":
      return <Key className="w-4 h-4" />;
    case "certificate":
      return <Server className="w-4 h-4" />;
    case "ssh_key":
      return <Terminal className="w-4 h-4" />;
    default:
      return <Box className="w-4 h-4" />;
  }
}

// Why the Access button is unavailable, or null when it works.
function accessBlockedReason(item) {
  if (!item.canOpen) return "You don't have access to this secret";
  if (!item.hasSecret) return "No secret is saved";
  if (item.accessMethod !== "passkey" && !item.hasCode) return "No PIN or password is set yet";
  return null;
}

export function VaultItemCard({ item, onEdit, onDelete, onDuplicate, onAccessCredential, onAccessControl }) {
  const accessLabel = ACCESS_MODE_LABELS[item.accessMode];
  const method = METHOD_META[item.accessMethod] ?? METHOD_META.pin;
  const MethodIcon = method.icon;
  const blocked = accessBlockedReason(item);

  return (
    <div className="min-w-0">
      <div className="group flex h-full min-w-0 flex-col bg-surface-subtle border border-border rounded-xl p-4 hover:border-border-strong transition-all duration-200 sm:p-5">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-card border border-border text-muted-foreground flex shrink-0 items-center justify-center">
              <VaultTypeIcon type={item.type} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-medium text-foreground truncate">{item.name}</h3>
              <p className="text-[12px] text-text-secondary truncate">
                {item.username || item.url || "No details"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {accessLabel && (
              <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-surface-card border border-border text-muted-foreground">
                {accessLabel}
              </span>
            )}
            <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-surface-card border border-border text-muted-foreground flex items-center gap-1">
              <MethodIcon className="w-3 h-3" />
              {method.label}
            </span>
            {item.canManage && (
              <ActionMenu
                label={`Actions for ${item.name}`}
                items={[
                  { icon: Pencil, label: "Edit", onSelect: onEdit },
                  { icon: Copy, label: "Duplicate", onSelect: onDuplicate },
                  { icon: Shield, label: "Access Control", onSelect: onAccessControl },
                  { separator: true },
                  { icon: Trash2, label: "Remove", destructive: true, onSelect: onDelete },
                ]}
              />
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-end sm:justify-between">
          {item.notes && (
            <p className="text-[12px] text-text-secondary line-clamp-2 sm:pr-3">{item.notes}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={Boolean(blocked)}
            title={blocked ?? undefined}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAccessCredential();
            }}
            className="ml-auto text-[11px] text-text-secondary hover:text-foreground flex shrink-0 items-center gap-1.5 transition-colors"
          >
            <MethodIcon className="w-3 h-3" />
            Access
          </Button>
        </div>
      </div>
    </div>
  );
}
