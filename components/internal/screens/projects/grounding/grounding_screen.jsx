"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Hash,
  Lock,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

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

function MessageItem({ message }) {
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
              <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {message.type}
              </span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-text-secondary hover:bg-surface-active hover:text-foreground">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 rounded-lg border-border bg-surface-subtle text-foreground"
              >
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs focus:bg-surface-active focus:text-foreground">
                  <Reply className="h-3.5 w-3.5" />
                  Reply in thread
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs focus:bg-surface-active focus:text-foreground">
                  <Pin className="h-3.5 w-3.5" />
                  {message.pinned ? "Unpin message" : "Pin message"}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs focus:bg-surface-active focus:text-foreground">
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-surface-hover" />
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

  const activeChannel = CHANNELS.find((channel) => channel.id === selectedChannel);
  const visibleMessages = useMemo(
    () => messages.filter((messageItem) => messageItem.channelId === selectedChannel),
    [messages, selectedChannel],
  );

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

  return (
    <MainScreenWrapper className="text-foreground">
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Grounding</h1>
              <p className="mt-1 text-muted-foreground">Project broadcasts, decisions, blockers, and admin-moderated context.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="border-border bg-transparent text-muted-foreground hover:bg-surface-active hover:text-foreground"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary">
            <Megaphone className="mr-2 h-4 w-4" />
            Broadcast
          </Button>
        </div>
      </div>

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
            {activeChannel ? (
              visibleMessages.length > 0 ? (
                visibleMessages.map((item) => (
                  <MessageItem key={item.id} message={item} />
                ))
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">No messages yet</p>
                    <p className="mt-1 text-xs text-text-secondary">Messages will appear here after backend data is connected.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-center">
                <div>
                  <p className="text-sm font-medium text-foreground">No channels yet</p>
                  <p className="mt-1 text-xs text-text-secondary">Create or fetch channels from the backend to start grounding discussions.</p>
                </div>
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
