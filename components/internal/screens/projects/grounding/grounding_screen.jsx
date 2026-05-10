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
  Pin,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const CHANNELS = [
  {
    id: "broadcast",
    name: "Project Broadcast",
    description: "Pinned delivery updates",
    unread: 2,
    locked: false,
    members: 28,
    lastActive: "4m",
  },
  {
    id: "decisions",
    name: "Delivery Decisions",
    description: "Scope, owners, and approvals",
    unread: 4,
    locked: false,
    members: 12,
    lastActive: "18m",
  },
  {
    id: "risks",
    name: "Risk & Blockers",
    description: "Escalations and mitigation",
    unread: 1,
    locked: false,
    members: 16,
    lastActive: "31m",
  },
  {
    id: "admin",
    name: "Admin Announcements",
    description: "Moderator-only notices",
    unread: 0,
    locked: true,
    members: 5,
    lastActive: "2h",
  },
];

const MESSAGES = [
  {
    id: "msg_1",
    channelId: "broadcast",
    author: "Aadit Joshi",
    role: "Project Admin",
    initials: "AJ",
    time: "9:14 AM",
    tone: "emerald",
    type: "Broadcast",
    body: "Onboarding milestone is complete. Please review the Exploring Nifty checklist before the afternoon sync.",
    replies: 6,
    acknowledgements: 21,
    pinned: true,
  },
  {
    id: "msg_2",
    channelId: "broadcast",
    author: "Priya Shah",
    role: "Product Lead",
    initials: "PS",
    time: "9:28 AM",
    tone: "sky",
    type: "Question",
    body: "Can we confirm whether the custom fields rollout is part of this sprint or the next one?",
    replies: 3,
    acknowledgements: 8,
    pinned: false,
  },
  {
    id: "msg_3",
    channelId: "broadcast",
    author: "Sam Lee",
    role: "Engineering",
    initials: "SL",
    time: "9:44 AM",
    tone: "violet",
    type: "Decision",
    body: "I can own the data shape for custom fields. UI can proceed with local state first, then we wire persistence.",
    replies: 2,
    acknowledgements: 11,
    pinned: false,
  },
  {
    id: "msg_4",
    channelId: "decisions",
    author: "Priya Shah",
    role: "Product Lead",
    initials: "PS",
    time: "10:06 AM",
    tone: "sky",
    type: "Decision",
    body: "We will keep templates out of this sprint and use the saved view work as the release boundary.",
    replies: 4,
    acknowledgements: 10,
    pinned: true,
  },
  {
    id: "msg_5",
    channelId: "risks",
    author: "Riley Park",
    role: "QA Lead",
    initials: "RP",
    time: "10:22 AM",
    tone: "amber",
    type: "Blocker",
    body: "Mobile regression pass is blocked until staging gets the latest activity dialog build.",
    replies: 5,
    acknowledgements: 7,
    pinned: false,
  },
  {
    id: "msg_6",
    channelId: "admin",
    author: "Aadit Joshi",
    role: "Project Admin",
    initials: "AJ",
    time: "Yesterday",
    tone: "emerald",
    type: "Notice",
    body: "Guest posting is paused for external reviewers until the security checklist is complete.",
    replies: 0,
    acknowledgements: 5,
    pinned: true,
  },
];

const toneClasses = {
  amber: "bg-amber-300 text-amber-950",
  emerald: "bg-emerald-300 text-emerald-950",
  sky: "bg-sky-300 text-sky-950",
  violet: "bg-violet-300 text-violet-950",
};

function ChannelButton({ channel, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-[#3a3a3a] bg-[#242424] text-[#ededed]"
          : "border-transparent text-[#a3a3a3] hover:border-[#2a2a2a] hover:bg-[#202020] hover:text-[#ededed]",
      )}
    >
      <div className="flex items-center gap-2.5">
        {channel.locked ? <Lock className="h-3.5 w-3.5 shrink-0 text-[#737373]" /> : <Hash className="h-3.5 w-3.5 shrink-0 text-[#737373]" />}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{channel.name}</span>
        {channel.unread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[10px] font-bold text-emerald-950">
            {channel.unread}
          </span>
        ) : null}
      </div>
      <p className="mt-1 truncate pl-6 text-xs text-[#737373]">
        {channel.description} | {channel.members} members | {channel.lastActive}
      </p>
    </button>
  );
}

function ChannelRail({ selectedChannel, onSelectChannel }) {
  return (
    <aside className="hidden h-full w-[286px] shrink-0 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] xl:flex xl:flex-col">
      <div className="shrink-0 border-b border-[#2a2a2a] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#ededed]">Channels</h2>
            <p className="mt-0.5 text-xs text-[#737373]">Project-wide context</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#737373] hover:bg-[#242424] hover:text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]" />
          <input
            placeholder="Search channels..."
            className="h-9 w-full rounded-md border border-[#333333] bg-[#202020] py-2 pl-9 pr-3 text-sm text-[#ededed] outline-none placeholder:text-[#737373] focus:border-[#474747] focus:ring-2 focus:ring-[#333333]/50"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CHANNELS.map((channel) => (
          <ChannelButton
            key={channel.id}
            channel={channel}
            active={selectedChannel === channel.id}
            onClick={() => onSelectChannel(channel.id)}
          />
        ))}
      </div>
    </aside>
  );
}

function MobileChannelPicker({ selectedChannel, onSelectChannel }) {
  const activeChannel = CHANNELS.find((channel) => channel.id === selectedChannel) ?? CHANNELS[0];

  return (
    <div className="mb-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3 xl:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-[#525252]">Channel</p>
          <h2 className="mt-1 truncate text-sm font-semibold text-[#ededed]">{activeChannel.name}</h2>
        </div>
        <ChevronDown className="h-4 w-4 text-[#737373]" />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {CHANNELS.map((channel) => (
          <button
            key={channel.id}
            type="button"
            onClick={() => onSelectChannel(channel.id)}
            className={cn(
              "h-8 shrink-0 rounded-md border px-3 text-xs font-medium",
              selectedChannel === channel.id
                ? "border-[#3a3a3a] bg-[#2a2a2a] text-white"
                : "border-[#2a2a2a] bg-[#202020] text-[#a3a3a3]",
            )}
          >
            {channel.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageItem({ message }) {
  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 transition-colors hover:border-[#3a3a3a]">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold", toneClasses[message.tone])}>
          {message.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-[#ededed]">{message.author}</h3>
              <span className="text-xs text-[#525252]">|</span>
              <p className="truncate text-xs text-[#737373]">{message.role}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-md border border-[#333333] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3]">
                {message.type}
              </span>
              <span className="text-xs text-[#525252]">|</span>
              <span className="text-xs text-[#737373]">{message.time}</span>
              {message.pinned ? (
                <Pin className="h-3.5 w-3.5 text-emerald-300" />
              ) : null}
            </div>
          </div>

          <p className="mt-2 text-sm leading-6 text-[#d4d4d4]">{message.body}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#737373]">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageSquare className="h-3 w-3" />
              {message.replies} replies
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Check className="h-3 w-3" />
              {message.acknowledgements} acknowledged
            </span>
            <Button variant="ghost" size="sm" className="ml-auto h-6 px-2 text-xs text-[#a3a3a3] hover:bg-[#242424] hover:text-white">
              Reply
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[#737373] hover:bg-[#242424] hover:text-white">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 rounded-lg border-[#2a2a2a] bg-[#1a1a1a] text-[#e7e7e7]"
              >
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs focus:bg-[#242424] focus:text-[#e7e7e7]">
                  <Reply className="h-3.5 w-3.5" />
                  Reply in thread
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs focus:bg-[#242424] focus:text-[#e7e7e7]">
                  <Pin className="h-3.5 w-3.5" />
                  {message.pinned ? "Unpin message" : "Pin message"}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs focus:bg-[#242424] focus:text-[#e7e7e7]">
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2a2a2a]" />
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
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0].id);
  const [mode, setMode] = useState("message");

  const activeChannel = CHANNELS.find((channel) => channel.id === selectedChannel) ?? CHANNELS[0];
  const visibleMessages = useMemo(
    () => MESSAGES.filter((messageItem) => messageItem.channelId === selectedChannel),
    [selectedChannel],
  );

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#e7e7e7]">Grounding</h1>
              <p className="mt-1 text-[#a3a3a3]">Project broadcasts, decisions, blockers, and admin-moderated context.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#242424] hover:text-[#e7e7e7]"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Megaphone className="mr-2 h-4 w-4" />
            Broadcast
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100dvh-250px)] min-h-[500px] gap-4">
        <ChannelRail selectedChannel={selectedChannel} onSelectChannel={setSelectedChannel} />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileChannelPicker selectedChannel={selectedChannel} onSelectChannel={setSelectedChannel} />

          <section className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleMessages.map((item) => (
              <MessageItem key={item.id} message={item} />
            ))}
          </section>

          <section className="mt-3 shrink-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center rounded-lg border border-[#2a2a2a] bg-[#202020] p-0.5">
                {["message", "decision", "broadcast"].map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode(item)}
                    className={cn(
                      "h-7 rounded-md px-3 text-xs capitalize",
                      mode === item
                        ? "bg-[#2a2a2a] text-white"
                        : "text-[#737373] hover:bg-transparent hover:text-[#a3a3a3]",
                    )}
                  >
                    {item}
                  </Button>
                ))}
              </div>
              <Button className="h-8 bg-white text-sm text-black hover:bg-[#e7e7e7]" disabled={!message.trim() || activeChannel.locked}>
                <Send className="mr-2 h-2 w-2" />
                <p className="text-sm">Send</p>
              </Button>
            </div>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`Write a ${mode} for ${activeChannel.name}...`}
              className="min-h-[112px] resize-none border-[#333333] bg-[#202020] text-[#ededed] placeholder:text-[#737373]"
            />
          </section>
        </main>

      </div>
    </MainScreenWrapper>
  );
}
