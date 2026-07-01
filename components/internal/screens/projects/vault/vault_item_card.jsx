"use client";

import React from "react";
import {
  Box,
  Clock,
  Copy,
  Database,
  Key,
  Link,
  Lock,
  Mail,
  Pencil,
  Server,
  Shield,
  Terminal,
  Trash2,
  Unlock,
  Fingerprint,
} from "lucide-react";
import { Button } from "@geiger/ui";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@geiger/ui";

function formatTTL(ttl) {
  if (!ttl) return null;
  const match = ttl.match(/^(\d+)([dhms])$/);
  if (!match) return ttl;
  const [, value, unit] = match;
  return `${value}${unit === "d" ? "d" : unit === "h" ? "h" : unit === "m" ? "m" : "s"}`;
}

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

export function VaultItemCard({
  item,
  onEdit,
  onDelete,
  onDuplicate,
  onAccessCredential,
  onAccessControl,
}) {
  const getAccessLabel = () => {
    switch (item.accessControl?.type) {
      case "team":
        return "Team";
      case "roles":
        return "Roles";
      case "users":
        return "Users";
      case "positions":
        return "Positions";
      default:
        return null;
    }
  };
  const accessLabel = getAccessLabel();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="min-w-0">
          <div className="group flex h-full min-w-0 flex-col bg-surface-subtle border border-border rounded-xl p-4 hover:border-border-strong transition-all duration-200 sm:p-5">
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-card border border-border text-muted-foreground flex shrink-0 items-center justify-center">
                  <VaultTypeIcon type={item.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-medium text-foreground truncate">
                    {item.name}
                  </h3>
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
                {item.ttl && (
                  <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-surface-card border border-border text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTTL(item.ttl)}
                  </span>
                )}
                {item.keylessEntry ? (
                  <span className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-surface-card border border-border text-muted-foreground flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-surface-card border border-border text-text-secondary flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-end sm:justify-between">
              {item.notes && (
                <p className="text-[12px] text-text-secondary line-clamp-2 sm:pr-3">
                  {item.notes}
                </p>
              )}
              <Button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onAccessCredential();
                }}
                className="text-[11px] text-text-secondary hover:text-foreground flex shrink-0 items-center gap-1.5 transition-colors"
              >
                <Fingerprint className="w-3 h-3" />
                Access
              </Button>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-surface-card border-border text-foreground w-44 p-1">
        <ContextMenuItem onSelect={onEdit} className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-1.5">
          <Pencil className="w-3.5 h-3.5" />
          <span className="text-xs">Edit</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDuplicate} className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-1.5">
          <Copy className="w-3.5 h-3.5" />
          <span className="text-xs">Duplicate</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onAccessControl} className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs">Access Control</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-surface-hover" />
        <ContextMenuItem onSelect={onDelete} className="cursor-pointer focus:bg-red-500/10 focus:text-red-300 text-red-300 flex items-center gap-2 px-2 py-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-xs">Remove</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
