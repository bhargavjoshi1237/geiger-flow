"use client";

import React, { useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Shield,
  Clock,
  Lock,
  Unlock,
  Database,
  Key,
  Link,
  Mail,
  Server,
  Terminal,
  Box,
  FingerprintIcon,
  Fingerprint,
  FingerprintPattern,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

function formatTTL(ttl) {
  if (!ttl) return null;
  const match = ttl.match(/^(\d+)([dhms])$/);
  if (!match) return ttl;
  const [, value, unit] = match;
  const units = { d: "days", h: "hours", m: "min", s: "sec" };
  return `${value}${unit === "d" ? "d" : unit === "h" ? "h" : unit === "m" ? "m" : "s"}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function VaultItemCard({
  item,
  onEdit,
  onDelete,
  onDuplicate,
  onViewAccessControl,
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const getTypeIcon = () => {
    switch (item.type) {
      case 'database': return Database;
      case 'api_key': return Key;
      case 'oauth': return Link;
      case 'smtp': return Mail;
      case 'password': return Key;
      case 'certificate': return Server;
      case 'ssh_key': return Terminal;
      default: return Box;
    }
  };
  const TypeIcon = getTypeIcon();

  const getAccessLabel = () => {
    switch (item.accessControl?.type) {
      case 'team': return 'Team';
      case 'roles': return 'Roles';
      case 'users': return 'Users';
      case 'positions': return 'Positions';
      default: return null;
    }
  };
  const accessLabel = getAccessLabel();

  const typeStyle = { bg: 'bg-surface-elevated', border: 'border-border', text: 'text-secondary' };

  const handleCopy = () => {
    const textToCopy = item.secret || item.password || item.apiKey || item.username || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const secretValue = item.secret || item.password || item.apiKey || "";
  const hasSecret = secretValue.length > 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>
          <div className="group bg-surface border-border rounded-xl p-5 hover:border-emphasis transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                 
                <div className="min-w-0">
                  <h3 className="text-[15px] font-medium text-foreground truncate">
                    {item.name}
                  </h3>
                  <p className="text-[12px] text-muted truncate">
                    {item.username || item.url || "No details"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
              {accessLabel && (
                <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-surface-elevated border border-text-muted text-secondary">
                  {accessLabel}
                </span>
              )}
              {item.ttl && (
                <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-surface-elevated border border-text-muted text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTTL(item.ttl)}
                </span>
              )}
              {item.keylessEntry ? (
                <span className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-surface-elevated border border-text-muted text-secondary flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-surface-elevated border border-text-muted text-muted flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                </span>
              )}
            </div>
            </div>

            {/* Secret Preview */}
            {hasSecret && (
              <div className="flex items-center gap-2 bg-surface-elevated rounded-lg px-3 py-2.5 mb-4 border border-border">
                <code className="flex-1 text-[12px] text-secondary truncate font-mono">
                  {showSecret ? secretValue : "••••••••••••••••"}
                </code>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="w-7 h-7 rounded flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="w-7 h-7 rounded flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
                  >
                    {copied ? (
                      <span className="text-[11px] font-medium text-secondary">Copied</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tags */}
            

          

            <div className="flex items-center justify-between pt-3">
               {item.notes && (
              <p className="text-[12px] text-muted line-clamp-2">
                {item.notes}
              </p>
            )}
             <button
                onClick={onViewAccessControl}
                className="text-[11px] text-muted hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <FingerprintPattern className="w-3 h-3" />
                Access
              </button>
            </div>
          </div>
        </div>
     
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-popover border-border text-foreground w-44 p-1">
        <ContextMenuItem onClick={onEdit} className="cursor-pointer focus:bg-accent flex items-center gap-2 px-2 py-1.5">
          <Pencil className="w-3.5 h-3.5" />
          <span className="text-xs">Edit</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate} className="cursor-pointer focus:bg-accent flex items-center gap-2 px-2 py-1.5">
          <Copy className="w-3.5 h-3.5" />
          <span className="text-xs">Duplicate</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onViewAccessControl} className="cursor-pointer focus:bg-accent flex items-center gap-2 px-2 py-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs">Access Control</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-border" />
        <ContextMenuItem onClick={onDelete} className="cursor-pointer flex items-center gap-2 px-2 py-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
