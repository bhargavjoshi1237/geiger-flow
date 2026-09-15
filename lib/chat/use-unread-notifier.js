"use client";

// Watches this project's chat for messages the user hasn't seen.
//
// Two jobs: keep a running unread count for the rail's Inbox badge, and raise a
// desktop notification when a message arrives while the tab is in the
// background. Messages I wrote, and messages in conversations I'm not a member
// of, are ignored.
//
// The subscription is realtime-only — it deliberately does not backfill a count
// from history, because "unread" here means "arrived while you were away from
// this tab", which is exactly what the notification is reporting.

import { useCallback, useEffect, useRef, useState } from "react";
import { ME, getPerson } from "@/lib/chat/people-store";
import { ensureIdentity } from "@/lib/chat/identity";
import { listConversations } from "@/features/grounding/chat_conversations";
import { subscribeMessages } from "@/features/grounding/chat_messages";
import { notify, requestPermission, permission } from "@/lib/chat/browser-notifications";

export function useUnreadNotifier(projectId) {
  const [unreadCount, setUnreadCount] = useState(0);
  // Conversation ids I belong to, so a message in someone else's channel never
  // raises a notification. A ref because the subscription closes over it.
  const myConversations = useRef(new Set());
  const conversationNames = useRef(new Map());

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    let unsubscribe = () => {};

    (async () => {
      const me = await ensureIdentity(projectId);
      if (cancelled || !me?.id) return;

      const [dms, channels] = await Promise.all([
        listConversations(me.id, "dm", projectId),
        listConversations(me.id, "channel", projectId),
      ]);
      if (cancelled) return;

      const ids = new Set();
      const names = new Map();
      for (const c of [...(dms ?? []), ...(channels ?? [])]) {
        ids.add(c.id);
        names.set(c.id, c.type === "channel" ? `#${c.name}` : c.name || "Direct message");
      }
      myConversations.current = ids;
      conversationNames.current = names;

      // Ask once, quietly. A browser that has already been answered (granted or
      // denied) short-circuits, so this never nags.
      if (permission() === "default") void requestPermission();

      unsubscribe = subscribeMessages((row, eventType) => {
        if (eventType !== "INSERT" || !row) return;
        if (row.deleted_at) return;
        if (row.author_id === ME.id) return;
        if (!myConversations.current.has(row.conversation_id)) return;

        setUnreadCount((n) => n + 1);

        // Only interrupt when the user isn't already looking at this tab.
        if (typeof document !== "undefined" && !document.hidden) return;

        const author = getPerson(row.author_id);
        const where = conversationNames.current.get(row.conversation_id) || "Chat";
        notify({
          title: author?.name ? `${author.name} in ${where}` : `New message in ${where}`,
          body: row.text || "Sent an attachment",
          tag: `chat-${row.conversation_id}`,
        });
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [projectId]);

  // Clear the badge once the user comes back to the tab and looks at chat.
  const clearUnread = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onVisible = () => {
      if (!document.hidden) setUnreadCount(0);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return { unreadCount, clearUnread };
}
