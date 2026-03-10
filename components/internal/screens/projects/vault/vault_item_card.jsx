// filepath: components/internal/screens/projects/vault/vault_item_card.jsx
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const VAULT_TYPE_ICONS = {
  database: Database,
  api_key: Key,
  oauth: Link,
  smtp: Mail,
  password: Key,
  certificate: Server,
  ssh_key: Terminal,
  other: Box,
};

const VAULT_TYPE_STYLES = {
  database: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  api_key: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  oauth: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  smtp: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400" },
  password: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  certificate: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
  ssh_key: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
  other: { bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-zinc-400" },
};

const ACCESS_TYPE_LABELS = {
  team: { label: "Team", color: "text-blue-400" },
  roles: { label: "Roles", color: "text-purple-400" },
  users: { label: "Users", color: "text-green-400" },
  positions: { label: "Positions", color: "text-amber-400" },
};

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

  const TypeIcon = VAULT_TYPE_ICONS[item.type] || VAULT_TYPE_ICONS.other;
  const typeStyle = VAULT_TYPE_STYLES[item.type] || VAULT_TYPE_STYLES.other;
  const accessType = ACCESS_TYPE_LABELS[item.accessControl?.type];

  const handleCopy = () => {
    const textToCopy = item.password || item.apiKey || item.username || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const secretValue = item.password || item.apiKey || "";
  const hasSecret = secretValue.length > 0;

  return (
    <div className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#3a3a3a] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", typeStyle.bg, typeStyle.border)}>
            <TypeIcon className={cn("w-4 h-4", typeStyle.text)} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-medium text-white truncate">
              {item.name}
            </h3>
            <p className="text-[12px] text-[#737373] truncate">
              {item.username || item.url || "No details"}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#202020] opacity-0 group-hover:opacity-100 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white w-44">
            <DropdownMenuItem onClick={onEdit} className="text-[13px] focus:bg-[#2a2a2a] focus:text-white">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate} className="text-[13px] focus:bg-[#2a2a2a] focus:text-white">
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onViewAccessControl} className="text-[13px] focus:bg-[#2a2a2a] focus:text-white">
              Access Control
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            <DropdownMenuItem onClick={onDelete} className="text-[13px] focus:bg-red-900/20 focus:text-red-400 text-red-400">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Secret Preview */}
      {hasSecret && (
        <div className="flex items-center gap-2 bg-[#161616] rounded-lg px-3 py-2.5 mb-4 border border-[#2a2a2a]">
          <code className="flex-1 text-[12px] text-[#a3a3a3] truncate font-mono">
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
                <span className="text-[11px] font-medium text-green-400">Copied</span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {accessType && (
          <span className={cn("text-[11px] font-medium px-2 py-1 rounded-md bg-[#202020] border border-[#2a2a2a]", accessType.color)}>
            {accessType.label}
          </span>
        )}
        {item.ttl && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTTL(item.ttl)}
          </span>
        )}
        {item.keylessEntry ? (
          <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1">
            <Unlock className="w-3 h-3" />
            Keyless
          </span>
        ) : (
          <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-[#202020] border border-[#2a2a2a] text-[#737373] flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Secured
          </span>
        )}
      </div>

      {/* Notes */}
      {item.notes && (
        <p className="text-[12px] text-[#737373] line-clamp-2 mb-4">
          {item.notes}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a]">
        <span className="text-[11px] text-[#525252]">
          Updated {formatDate(item.updatedAt)}
        </span>
        <button
          onClick={onViewAccessControl}
          className="text-[11px] text-[#737373] hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Shield className="w-3 h-3" />
          Access
        </button>
      </div>
    </div>
  );
}
