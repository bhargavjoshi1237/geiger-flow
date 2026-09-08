"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Copy,
  Hash,
  Lock,
  Megaphone,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Avatar, AvatarFallback } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { cn } from "@/lib/utils";
import {
  MESSAGE_TYPE_FILTER_OPTIONS,
  MESSAGE_TYPE_PILL_MAP,
} from "@/features/grounding/constants";

const CHANNELS = [];

const MESSAGES = [];

const toneClasses = {
  amber: "bg-amber-300 text-amber-950",
  emerald: "bg-emerald-300 text-emerald-950",
  sky: "bg-sky-300 text-sky-950",
  violet: "bg-violet-300 text-violet-950",
};

function ChannelButton({ channel, active, collapsed, onClick }) {
  const ChannelIcon = channel.locked ? Lock : Hash;

  if (collapsed) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        title={channel.name}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
          active
            ? "border-border-strong bg-surface-active text-foreground"
            : "border-transparent text-muted-foreground hover:border-border hover:bg-surface-card hover:text-foreground",
        )}
      >
        <ChannelIcon className="h-4 w-4" />
        {channel.unread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[9px] font-bold text-emerald-950">
            {channel.unread}
          </span>
        ) : null}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-auto w-full flex-col items-stretch justify-start rounded-lg border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-border-strong bg-surface-active text-foreground"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-surface-card hover:text-foreground",
      )}
    >
      <div className="flex items-center gap-2.5">
        <ChannelIcon className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{channel.name}</span>
        {channel.unread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[10px] font-bold text-emerald-950">
            {channel.unread}
          </span>
        ) : null}
      </div>
      <p className="mt-1 truncate pl-6 text-xs text-text-secondary">
        {channel.description} | {channel.members} members | {channel.lastActive}
      </p>
    </Button>
  );
}

function ChannelRail({ selectedChannel, collapsed, onToggleCollapsed, onSelectChannel }) {
  if (collapsed) {
    return (
      <aside className="hidden h-full w-10 shrink-0 xl:flex xl:flex-col xl:items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          className="h-9 w-9 rounded-lg border border-border bg-surface-subtle text-muted-foreground shadow-sm hover:bg-surface-active hover:text-foreground"
          title="Expand channels"
          aria-label="Expand channels"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside
      className="hidden h-full w-[286px] shrink-0 rounded-xl border border-border bg-surface-subtle transition-[width] duration-200 xl:flex xl:flex-col"
    >
      <div className="shrink-0 border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Channels</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Project-wide context</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleCollapsed}
            className="h-8 w-8 text-text-secondary hover:bg-surface-active hover:text-foreground"
            title="Collapse channels"
            aria-label="Collapse channels"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search channels..."
            className="h-9 w-full border-border bg-surface-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-text-secondary focus-visible:border-border-strong focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CHANNELS.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-card px-3 py-6 text-center text-xs text-text-secondary">
            Channels will appear here after backend data is connected.
          </div>
        ) : (
          CHANNELS.map((channel) => (
            <ChannelButton
              key={channel.id}
              channel={channel}
              active={selectedChannel === channel.id}
              collapsed={false}
              onClick={() => onSelectChannel(channel.id)}
            />
          ))
        )}
      </div>
      <div className="border-t border-border p-2">
        <Button variant="ghost" className="h-8 w-full justify-start gap-2 text-xs text-text-secondary hover:bg-surface-active hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
          Add channel
        </Button>
      </div>
    </aside>
  );
}

function MobileChannelPicker({ selectedChannel, onSelectChannel }) {
  const activeChannel = CHANNELS.find((channel) => channel.id === selectedChannel);

  return (
    <div className="mb-3 rounded-xl border border-border bg-surface-subtle p-3 xl:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Channel</p>
          <h2 className="mt-1 truncate text-sm font-semibold text-foreground">
            {activeChannel?.name || "No channels"}
          </h2>
        </div>
        <ChevronDown className="h-4 w-4 text-text-secondary" />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {CHANNELS.length === 0 ? (
          <span className="text-xs text-text-secondary">Backend channels are not connected yet.</span>
        ) : (
          CHANNELS.map((channel) => (
            <Button
              key={channel.id}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectChannel(channel.id)}
              className={cn(
                "h-8 shrink-0 rounded-md border px-3 text-xs font-medium",
                selectedChannel === channel.id
                  ? "border-border-strong bg-surface-hover text-foreground"
                  : "border-border bg-surface-card text-muted-foreground",
              )}
            >
              {channel.name}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}

function MessageItem({ message, onReply, onTogglePin, onCopyText, onArchive }) {
  const typeKey = String(message.type || "message").toLowerCase();

  return (
    <article className="rounded-xl border border-border bg-surface-subtle px-4 py-3 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 rounded-md">
          <AvatarFallback className={cn("rounded-md text-[11px] font-bold", toneClasses[message.tone])}>
            {message.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">{message.author}</h3>
              <span className="text-xs text-text-tertiary">|</span>
              <p className="truncate text-xs text-text-secondary">{message.role}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusPill status={typeKey} map={MESSAGE_TYPE_PILL_MAP} />
              <span className="text-xs text-text-tertiary">|</span>
              <span className="text-xs text-text-secondary">{message.time}</span>
              {message.pinned ? (
                <Pin className="h-3.5 w-3.5 text-emerald-300" />
              ) : null}
            </div>
          </div>

          <p className="mt-2 text-sm leading-6 text-foreground">{message.body}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageSquare className="h-3 w-3" />
              {message.replies} replies
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Check className="h-3 w-3" />
              {message.acknowledgements} acknowledged
            </span>
            <Button variant="ghost" size="sm" className="ml-auto h-6 px-2 text-xs text-muted-foreground hover:bg-surface-active hover:text-foreground">
              Reply
            </Button>
            <ActionMenu
              label={`Actions for message from ${message.author}`}
              items={[
                { icon: Reply, label: "Reply in thread", onSelect: () => onReply?.(message) },
                { icon: Pin, label: message.pinned ? "Unpin message" : "Pin message", onSelect: () => onTogglePin?.(message) },
                { icon: Copy, label: "Copy text", onSelect: () => onCopyText?.(message) },
                { separator: true },
                { icon: Trash2, label: "Archive", destructive: true, onSelect: () => onArchive?.(message) },
              ]}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export function GroundingScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);
  const [mode, setMode] = useState("message");
  const [messageQuery, setMessageQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const activeChannel = CHANNELS.find((channel) => channel.id === selectedChannel);
  const visibleMessages = useMemo(
    () => messages.filter((messageItem) => messageItem.channelId === selectedChannel),
    [messages, selectedChannel],
  );

  const filteredMessages = useMemo(() => {
    const query = messageQuery.trim().toLowerCase();
    return visibleMessages.filter((item) => {
      if (typeFilter !== "all" && String(item.type || "").toLowerCase() !== typeFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [item.author, item.role, item.body]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query));
    });
  }, [visibleMessages, messageQuery, typeFilter]);

  const stats = useMemo(() => {
    const pinned = messages.filter((item) => item.pinned).length;
    const broadcasts = messages.filter(
      (item) => String(item.type || "").toLowerCase() === "broadcast",
    ).length;
    return [
      { label: "Channels", value: String(CHANNELS.length), footer: "Project-wide context" },
      { label: "Messages", value: String(messages.length), footer: activeChannel ? `In ${activeChannel.name}` : "Select a channel" },
      { label: "Pinned", value: String(pinned), footer: "Saved highlights" },
      { label: "Broadcasts", value: String(broadcasts), footer: "Announcements" },
    ];
  }, [messages, activeChannel]);

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !activeChannel || activeChannel.locked) {
      return;
    }

    const sentAt = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg_${Date.now()}`,
        channelId: activeChannel.id,
        author: "You",
        role: "Project Member",
        initials: "YO",
        time: sentAt,
        tone: "emerald",
        type: mode === "broadcast" ? "Broadcast" : "Message",
        body: trimmedMessage,
        replies: 0,
        acknowledgements: 0,
        pinned: false,
      },
    ]);
    setMessage("");
  };

  const handleTogglePin = (target) => {
    setMessages((current) =>
      current.map((item) =>
        item.id === target.id ? { ...item, pinned: !item.pinned } : item,
      ),
    );
  };

  const handleCopyText = async (target) => {
    try {
      await navigator.clipboard.writeText(target.body);
      toast.success("Message copied");
    } catch {
      toast.error("Couldn't copy message");
    }
  };

  const handleReply = (target) => {
    setMessage((current) => (current ? `${current} @${target.author} ` : `@${target.author} `));
  };

  const handleArchive = (target) => {
    setMessages((current) => current.filter((item) => item.id !== target.id));
    toast.success("Message archived");
  };

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Grounding"
        description="Project broadcasts, decisions, blockers, and admin-moderated context."
        actions={
          <>
            <Button
              variant="outline"
              className="border-border bg-transparent text-muted-foreground hover:bg-surface-active hover:text-foreground"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setMode((current) => (current === "broadcast" ? "message" : "broadcast"))}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Broadcast
            </Button>
          </>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={typeFilter}
            onValueChange={setTypeFilter}
            options={MESSAGE_TYPE_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={messageQuery}
          onChange={setMessageQuery}
          placeholder="Search messages…"
        />
      </Toolbar>

      <div className="relative flex h-[calc(100dvh-250px)] min-h-[500px] gap-4">
        <ChannelRail
          selectedChannel={selectedChannel}
          collapsed={channelsCollapsed}
          onToggleCollapsed={() => setChannelsCollapsed((current) => !current)}
          onSelectChannel={setSelectedChannel}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileChannelPicker selectedChannel={selectedChannel} onSelectChannel={setSelectedChannel} />

          <section className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!activeChannel ? (
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Megaphone}
                  title="No channels yet"
                  description="Create or fetch channels from the backend to start grounding discussions."
                />
              </div>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((item) => (
                <MessageItem
                  key={item.id}
                  message={item}
                  onReply={handleReply}
                  onTogglePin={handleTogglePin}
                  onCopyText={handleCopyText}
                  onArchive={handleArchive}
                />
              ))
            ) : (
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={MessageSquare}
                  title={visibleMessages.length ? "No matching messages" : "No messages yet"}
                  description={
                    visibleMessages.length
                      ? "Try clearing the search or type filter."
                      : "Messages will appear here after backend data is connected."
                  }
                />
              </div>
            )}
          </section>

          <section className="mt-3 shrink-0 flex gap-3">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={activeChannel ? `Write a ${mode} for ${activeChannel.name}...` : "Connect backend channels to start messaging..."}
              className="min-h-[50px] resize-none border-border bg-surface-card text-foreground placeholder:text-text-secondary"
            />
             <div className="flex flex-wrap items-center justify-between ">
              <Button
                type="button"
                className="h-full bg-primary text-sm text-primary-foreground hover:bg-primary/90"
                disabled={!message.trim() || !activeChannel || activeChannel.locked}
                onClick={handleSendMessage}
              >
                <Send className="h-2 w-2" />
                </Button>
            </div>
          </section>
        </main>

      </div>
    </MainScreenWrapper>
  );
}

export default GroundingScreen;
