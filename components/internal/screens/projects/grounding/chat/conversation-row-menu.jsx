"use client";

import React from "react";
import {
  Pin, BellOff, CheckCheck, Archive, Trash2, Settings, Users, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { getPerson } from "@/lib/chat/people-store";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@geiger/ui";

// Right-click menu for a conversation row. Pin / mark-read / leave persist via
// the callbacks (the screen toasts); settings and members open the conversation's
// details sheet; mute / archive are advisory only.
export function ConversationRowMenu({ conversation, variant, children, onPin, onMarkRead, onLeave, onOpenDetails }) {
  const isChannel = variant === "channel";
  const name = isChannel ? `#${conversation.name}` : getPerson(conversation.participantId).name;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={() => onPin?.(conversation, !conversation.pinned)}>
          <Pin /> {conversation.pinned ? "Unpin" : "Pin to top"}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => toast.success(`Muted ${name}`)}>
          <BellOff /> Mute notifications
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onMarkRead?.(conversation)}>
          <CheckCheck /> Mark as read
        </ContextMenuItem>
        <ContextMenuSeparator />
        {isChannel ? (
          <>
            <ContextMenuItem onSelect={() => onOpenDetails?.(conversation)}>
              <Settings /> Channel settings
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => onOpenDetails?.(conversation)}>
              <Users /> View members
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={() => onLeave?.(conversation)}>
              <LogOut /> Leave channel
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onSelect={() => toast.success(`Archived ${name}`)}>
              <Archive /> Archive conversation
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" onSelect={() => onLeave?.(conversation)}>
              <Trash2 /> Delete conversation
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
