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

  const typeStyle = { bg: 'bg-[#202020]', border: 'border-[#2a2a2a]', text: 'text-[#a3a3a3]' };

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
          <div className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                 
                <div className="min-w-0">
                  <h3 className="text-[15px] font-medium text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-[12px] text-[#737373] truncate">
                    {item.username || item.url || "No details"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
              {accessLabel && (
                <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-[#202020] border border-[#2a2a2a] text-[#a3a3a3]">
                  {accessLabel}
                </span>
              )}
              {item.ttl && (
                <span className=" text-[11px] font-medium px-2 py-1 rounded-md bg-[#202020] border border-[#2a2a2a] text-[#a3a3a3] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTTL(item.ttl)}
                </span>
              )}
              {item.keylessEntry ? (
                <span className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-[#202020] border border-[#2a2a2a] text-[#a3a3a3] flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-[#202020] border border-[#2a2a2a] text-[#737373] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                </span>
              )}
            </div>
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
                      <span className="text-[11px] font-medium text-[#a3a3a3]">Copied</span>
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
              <p className="text-[12px] text-[#737373] line-clamp-2">
                {item.notes}
              </p>
            )}
             <button
                onClick={onViewAccessControl}
                className="text-[11px] text-[#737373] hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <FingerprintPattern className="w-3 h-3" />
                Access
              </button>
            </div>
          </div>
        </div>
     
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-[#212121] border-[#2a2a2a] text-[#e7e7e7] w-44 p-1">
        <ContextMenuItem onClick={onEdit} className="cursor-pointer focus:bg-[#323232] focus:text-[#e7e7e7] flex items-center gap-2 px-2 py-1.5">
          <Pencil className="w-3.5 h-3.5" />
          <span className="text-xs">Edit</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate} className="cursor-pointer focus:bg-[#323232] focus:text-[#e7e7e7] flex items-center gap-2 px-2 py-1.5">
          <Copy className="w-3.5 h-3.5" />
          <span className="text-xs">Duplicate</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
