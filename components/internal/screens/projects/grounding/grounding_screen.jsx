"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  Copy,
  Hash,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { LogoLoading } from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EmptyState,
  Field,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MESSAGE_TYPE,
  MESSAGE_TYPE_FILTER_OPTIONS,
  MESSAGE_TYPE_PILL_MAP,
  avatarToneClasses,
  formatChannelDescription,
  formatMessageTime,
  initialsOf,
  toneForText,
} from "@/features/grounding/constants";
import {
  createChannel,
  createMessage,
  listChannels,
  listMessages,
  normalizeMessage,
  softDeleteMessage,
  updateMessage,
} from "@/features/grounding/actions";
import { useProject } from "@/context/project-context";
import { createClient } from "@/lib/supabase/client";

function ChannelButton({ channel, active, collapsed, onClick }) {
  const ChannelIcon = channel.isLocked ? Lock : Hash;

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
      </div>
      <p className="mt-1 truncate pl-6 text-xs text-text-secondary">
        {formatChannelDescription(channel)}
      </p>
    </Button>
  );
}

function ChannelRail({
  channels,
  loading,
  selectedChannel,
  collapsed,
  onToggleCollapsed,
  onSelectChannel,
  onAddChannel,
}) {
  const [channelQuery, setChannelQuery] = useState("");

  const filteredChannels = useMemo(() => {
    const query = channelQuery.trim().toLowerCase();
    if (!query) {
      return channels;
    }
    return channels.filter((channel) =>
      String(channel.name || "").toLowerCase().includes(query),
    );
  }, [channels, channelQuery]);

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
            value={channelQuery}
            onChange={(event) => setChannelQuery(event.target.value)}
            placeholder="Search channels..."
            className="h-9 w-full border-border bg-surface-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-text-secondary focus-visible:border-border-strong focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-text-secondary">
            <LogoLoading size={32} />
            Loading channels…
          </div>
        ) : channels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-card px-3 py-6 text-center text-xs text-text-secondary">
            No channels yet. Create one to get started.
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-card px-3 py-6 text-center text-xs text-text-secondary">
            No matching channels.
          </div>
        ) : (
          filteredChannels.map((channel) => (
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
        <Button
          variant="ghost"
          onClick={onAddChannel}
          className="h-8 w-full justify-start gap-2 text-xs text-text-secondary hover:bg-surface-active hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add channel
        </Button>
      </div>
    </aside>
  );
}

function MobileChannelPicker({ channels, selectedChannel, onSelectChannel }) {
  const activeChannel = channels.find((channel) => channel.id === selectedChannel);

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
        {channels.length === 0 ? (
          <span className="text-xs text-text-secondary">No channels yet.</span>
        ) : (
          channels.map((channel) => (
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
  const typeKey = String(message.messageType || "message").toLowerCase();
  const authorName = message.authorName || "Member";
  const tone = toneForText(authorName);

  return (
    <article className="rounded-xl border border-border bg-surface-subtle px-4 py-3 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 rounded-md">
          <AvatarFallback className={cn("rounded-md text-[11px] font-bold", avatarToneClasses[tone])}>
            {initialsOf(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">{authorName}</h3>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusPill status={typeKey} map={MESSAGE_TYPE_PILL_MAP} />
              <span className="text-xs text-text-tertiary">|</span>
              <span className="text-xs text-text-secondary">{formatMessageTime(message.createdAt)}</span>
              {message.isPinned ? (
                <Pin className="h-3.5 w-3.5 text-emerald-300" />
              ) : null}
            </div>
          </div>

          <p className="mt-2 text-sm leading-6 text-foreground">{message.body}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply?.(message)}
              className="ml-auto h-6 px-2 text-xs text-muted-foreground hover:bg-surface-active hover:text-foreground"
            >
              Reply
            </Button>
            <ActionMenu
              label={`Actions for message from ${authorName}`}
              items={[
                { icon: Reply, label: "Reply in thread", onSelect: () => onReply?.(message) },
                { icon: Pin, label: message.isPinned ? "Unpin message" : "Pin message", onSelect: () => onTogglePin?.(message) },
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
  const { project } = useProject();
  const { id: projectId } = project ?? {};

  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [message, setMessage] = useState("");
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);
  const [mode, setMode] = useState(DEFAULT_MESSAGE_TYPE);
  const [messageQuery, setMessageQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }
      if (!projectId) {
        setChannels([]);
        setChannelsLoading(false);
        setSelectedChannel("");
        return;
      }

      setChannelsLoading(true);
      void listChannels(projectId).then((rows) => {
        if (cancelled) {
          return;
        }
        const next = rows ?? [];
        setChannels(next);
        setSelectedChannel((current) => {
          if (current && next.some((channel) => channel.id === current)) {
            return current;
          }
          return next[0]?.id ?? "";
        });
        setChannelsLoading(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }
      if (!selectedChannel) {
        setMessages([]);
        setMessagesLoading(false);
        return;
      }

      setMessagesLoading(true);
      void listMessages(selectedChannel).then((rows) => {
        if (cancelled) {
          return;
        }
        setMessages(rows ?? []);
        setMessagesLoading(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [selectedChannel]);

  useEffect(() => {
    if (!selectedChannel) {
      return undefined;
    }

    let subscription = null;
    try {
      const supabase = createClient();
      subscription = supabase
        .channel(`grounding:${selectedChannel}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "flow",
            table: "grounding_messages",
            filter: `channel_id=eq.${selectedChannel}`,
          },
          (payload) => {
            const row = payload?.new ? normalizeMessage(payload.new) : null;
            if (!row) {
              void listMessages(selectedChannel).then((rows) => {
                setMessages(rows ?? []);
              });
              return;
            }
            setMessages((current) => {
              if (current.some((item) => item.id === row.id)) {
                return current.map((item) => (item.id === row.id ? row : item));
              }
              return [...current, row];
            });
          },
        )
        .subscribe();
    } catch {
      return undefined;
    }

    return () => {
      try {
        if (subscription) {
          void createClient().removeChannel(subscription);
        }
      } catch {
        // Realtime unavailable — the list fetch already covers the data.
      }
    };
  }, [selectedChannel]);

  const activeChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannel) ?? null,
    [channels, selectedChannel],
  );

  const visibleMessages = useMemo(
    () => messages.filter((messageItem) => messageItem.channelId === selectedChannel),
    [messages, selectedChannel],
  );

  const filteredMessages = useMemo(() => {
    const query = messageQuery.trim().toLowerCase();
    return visibleMessages.filter((item) => {
      if (typeFilter !== "all" && String(item.messageType || "").toLowerCase() !== typeFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [item.authorName, item.body]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query));
    });
  }, [visibleMessages, messageQuery, typeFilter]);

  const stats = useMemo(() => {
    const pinned = messages.filter((item) => item.isPinned).length;
    const broadcasts = messages.filter(
      (item) => String(item.messageType || "").toLowerCase() === "broadcast",
    ).length;
    return [
      { label: "Channels", value: String(channels.length), footer: "Project-wide context" },
      { label: "Messages", value: String(messages.length), footer: activeChannel ? `In ${activeChannel.name}` : "Select a channel" },
      { label: "Pinned", value: String(pinned), footer: "Saved highlights" },
      { label: "Broadcasts", value: String(broadcasts), footer: "Announcements" },
    ];
  }, [channels, messages, activeChannel]);

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !activeChannel || activeChannel.isLocked) {
      return;
    }

    const optimisticId = crypto.randomUUID();
    const optimistic = {
      id: optimisticId,
      channelId: activeChannel.id,
      authorName: "You",
      body: trimmedMessage,
      messageType: mode,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((currentMessages) => [...currentMessages, optimistic]);
    setMessage("");

    const created = await createMessage(activeChannel.id, {
      id: optimisticId,
      body: trimmedMessage,
      messageType: mode,
    });

    if (created) {
      setMessages((currentMessages) =>
        currentMessages.map((item) => (item.id === optimisticId ? created : item)),
      );
    } else {
      setMessages((currentMessages) =>
        currentMessages.filter((item) => item.id !== optimisticId),
      );
      toast.error("Couldn't send message");
    }
  };

  const handleTogglePin = async (target) => {
    const next = !target.isPinned;
    setMessages((current) =>
      current.map((item) =>
        item.id === target.id ? { ...item, isPinned: next } : item,
      ),
    );

    const updated = await updateMessage(target.id, { isPinned: next });
    if (updated) {
      setMessages((current) =>
        current.map((item) => (item.id === target.id ? updated : item)),
      );
    } else {
      setMessages((current) =>
        current.map((item) =>
          item.id === target.id ? { ...item, isPinned: target.isPinned } : item,
        ),
      );
      toast.error("Couldn't update message");
    }
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
    setMessage((current) => (current ? `${current} @${target.authorName} ` : `@${target.authorName} `));
  };

  const handleArchive = async (target) => {
    setMessages((current) => current.filter((item) => item.id !== target.id));
    const ok = await softDeleteMessage(target.id);
    if (ok) {
      toast.success("Message archived");
    } else {
      setMessages((current) => {
        if (current.some((item) => item.id === target.id)) {
          return current;
        }
        return [...current, target];
      });
      toast.error("Couldn't archive message");
    }
  };

  const handleOpenChannelDialog = () => {
    setNewChannelName("");
    setChannelDialogOpen(true);
  };

  const handleCreateChannel = async () => {
    const name = newChannelName.trim();
    if (!name || !projectId || creatingChannel) {
      return;
    }

    const previousSelection = selectedChannel;
    const optimisticId = crypto.randomUUID();
    const now = new Date().toISOString();
    const optimistic = {
      id: optimisticId,
      projectId,
      name,
      description: "",
      isLocked: false,
      metadata: {},
      createdBy: null,
      createdAt: now,
      updatedAt: now,
    };

    setCreatingChannel(true);
    setChannels((current) => [...current, optimistic]);
    setSelectedChannel(optimisticId);

    const created = await createChannel(projectId, { id: optimisticId, name });
    setCreatingChannel(false);

    if (created) {
      setChannels((current) =>
        current.map((channel) => (channel.id === optimisticId ? created : channel)),
      );
      setSelectedChannel(created.id);
      setNewChannelName("");
      setChannelDialogOpen(false);
      toast.success("Channel created");
    } else {
      setChannels((current) => current.filter((channel) => channel.id !== optimisticId));
      setSelectedChannel(previousSelection ?? "");
      toast.error("Couldn't create channel");
    }
  };

  const composerDisabled = !message.trim() || !activeChannel || activeChannel.isLocked;
  const paneLoading = channelsLoading || messagesLoading;

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
          channels={channels}
          loading={channelsLoading}
          selectedChannel={selectedChannel}
          collapsed={channelsCollapsed}
          onToggleCollapsed={() => setChannelsCollapsed((current) => !current)}
          onSelectChannel={setSelectedChannel}
          onAddChannel={handleOpenChannelDialog}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileChannelPicker
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
          />

          <section className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paneLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
                <LogoLoading size={40} />
                Loading messages…
              </div>
            ) : !activeChannel ? (
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Megaphone}
                  title="No channels yet"
                  description="Create your first channel to start grounding discussions."
                  action={
                    <Button
                      onClick={handleOpenChannelDialog}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" /> New channel
                    </Button>
                  }
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
                      : "Be the first to post in this channel."
                  }
                />
              </div>
            )}
          </section>

          <section className="mt-3 shrink-0 flex gap-3">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={activeChannel ? `Write a ${mode} for ${activeChannel.name}...` : channelsLoading ? "Loading channels..." : "Create a channel to start messaging..."}
              disabled={!activeChannel || activeChannel.isLocked}
              className="min-h-[50px] resize-none border-border bg-surface-card text-foreground placeholder:text-text-secondary"
            />
              <div className="flex flex-wrap items-center justify-between ">
              <Button
                type="button"
                className="h-full bg-primary text-sm text-primary-foreground hover:bg-primary/90"
                disabled={composerDisabled}
                onClick={handleSendMessage}
              >
                <Send className="h-2 w-2" />
                </Button>
            </div>
          </section>
        </main>

      </div>

      <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">New channel</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Channels group grounding context for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Name *" htmlFor="grounding-channel-name">
              <Input
                id="grounding-channel-name"
                value={newChannelName}
                onChange={(event) => setNewChannelName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && newChannelName.trim() && !creatingChannel) {
                    event.preventDefault();
                    void handleCreateChannel();
                  }
                }}
                placeholder="e.g. announcements"
                autoFocus
                className="border-border bg-surface-card text-foreground placeholder:text-text-secondary"
              />
            </Field>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setChannelDialogOpen(false)}
              disabled={creatingChannel}
              className="text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={!newChannelName.trim() || creatingChannel}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creatingChannel ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {creatingChannel ? "Creating…" : "Create channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default GroundingScreen;
