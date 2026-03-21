"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Filter,
  MailOpen,
  Inbox,
  User as UserIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationItem } from "./notification_item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function InboxScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      const { data, error } = await supabase
        .from("flow_notifications")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("time", { ascending: false });

      if (error) {
        console.error("[flow_notifications] fetch error:", error);
      }

      if (data) {
        setNotifications(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    // Optimistic UI update
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    if (selectedNotification?.id === id) {
      setSelectedNotification({ ...selectedNotification, read: true });
    }
    const supabase = createClient();
    await supabase
      .from("flow_notifications")
      .update({ read: true })
      .eq("id", id);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    if (selectedNotification && !selectedNotification.read) {
      setSelectedNotification({ ...selectedNotification, read: true });
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await supabase
        .from("flow_notifications")
        .update({ read: true })
        .eq("user_id", userData.user.id)
        .eq("read", false);
    }
  };

  const handleDelete = async (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    if (selectedNotification?.id === id) {
      setIsSheetOpen(false);
      setTimeout(() => setSelectedNotification(null), 300);
    }
    const supabase = createClient();
    await supabase.from("flow_notifications").delete().eq("id", id);
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsSheetOpen(true);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ? true : activeTab === "unread" ? !n.read : true; // "archived" logic can be added if schema supports it
    return matchesSearch && matchesTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const DetailIconComponent =
    selectedNotification?.icon && LucideIcons[selectedNotification.icon]
      ? LucideIcons[selectedNotification.icon]
      : LucideIcons.Bell;

  let formattedDetailDate = "";
  let fullDateStr = "";
  try {
    if (selectedNotification?.time) {
      const d = new Date(selectedNotification.time);
      if (!isNaN(d.getTime())) {
        formattedDetailDate = new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }).format(d);
        fullDateStr = d.toISOString();
      }
    }
  } catch (e) {}

  return (
    <div className="flex flex-col gap-8 w-full px-2 lg:px-0 lg:w-[75%] my-3 mx-auto text-[#e7e7e7] h-full overflow-hidden relative">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-semibold text-primary tracking-tight flex items-center gap-3">
            Inbox
          </h1>
          <p className="text-secondary text-sm mt-1.5 font-medium">
            Stay updated with all notifications and alerts across your
            workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="text-sm font-medium text-secondary hover:text-primary bg-surface-elevated hover:bg-surface-active border border-border px-3.5 py-2 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-surface-elevated disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MailOpen className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 shrink-0 z-10 sticky top-0 pb-2">
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1 border border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "all"
                ? "bg-[#2a2a2a] text-[#e7e7e7] shadow-sm"
                : "text-[#737373] hover:text-[#e7e7e7] hover:bg-[#202020]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === "unread"
                ? "bg-[#2a2a2a] text-[#e7e7e7] shadow-sm"
                : "text-[#737373] hover:text-[#e7e7e7] hover:bg-[#202020]"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={`w-2 h-2 rounded-full ${
                  activeTab === "unread" ? "bg-blue-500" : "bg-blue-500/60"
                }`}
              ></span>
            )}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Filter notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-subtle text-primary text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emphasis transition-all focus:ring-1 focus:ring-emphasis placeholder:text-zinc-500"
            />
          </div>
          <button className="flex items-center justify-center p-2 rounded-lg bg-surface border border-subtle text-text-tertiary hover:text-primary hover:bg-surface-hover transition-colors">
            <Filter className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto min-h-0 pr-1 pb-10 flex flex-col gap-3 [&::-webkit-scrollbar]:hidden [&]:-ms-overflow-style:none [&]:scrollbar-width:none"
        style={{ scrollbarWidth: "none", scrollbarColor: "transparent transparent" }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-[200px] text-text-muted">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-text-muted border border-dashed border-subtle rounded-2xl bg-surface/50">
            <Inbox
              className="w-12 h-12 mb-4 text-zinc-600"
              strokeWidth={1.5}
            />
            <p className="text-lg font-medium text-primary">All caught up!</p>
            <p className="text-sm mt-1.5 text-text-tertiary">
              You don't have any notifications right now.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onClick={handleNotificationClick}
            />
          ))
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-[#141414] border-l border-[#1f1f1f] text-[#e7e7e7] p-0 w-full max-w-md shadow-2xl flex flex-col [&>button]:right-5 [&>button]:top-5 [&>button]:text-[#555555] hover:[&>button]:text-white">
          {selectedNotification && (
            <>
              {/* Header */}
              <div className="px-6 pt-12 pb-5 border-b border-[#1f1f1f] shrink-0 bg-[#171717]">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                      selectedNotification.bg_color ||
                      selectedNotification.bgColor ||
                      "bg-surface-elevated"
                    } border border-white/[0.06]`}
                  >
                    <DetailIconComponent
                      className={`w-5 h-5 ${
                        selectedNotification.icon_color ||
                        selectedNotification.iconColor ||
                        "text-text-muted"
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted bg-surface-elevated px-2 py-1 rounded-md border border-subtle">
                        {selectedNotification.type}
                      </span>
                      <span className="text-[11px] text-zinc-500 shrink-0">
                        {formattedDetailDate || "Just now"}
                      </span>
                    </div>
                  </div>
                </div>
                <SheetTitle className="text-lg font-semibold text-primary leading-tight pr-6">
                  {selectedNotification.title}
                </SheetTitle>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 bg-surface">
                <div className="space-y-5">
                  {/* Description */}
                  <p className="text-[14px] text-text-tertiary leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.description}
                  </p>

                  {/* Extra Content */}
                  {(() => {
                    let extraContent = null;
                    try {
                      if (selectedNotification.extra) {
                        extraContent = typeof selectedNotification.extra === "string" 
                          ? JSON.parse(selectedNotification.extra) 
                          : selectedNotification.extra;
                      }
                    } catch {}
                    
                    if (!extraContent) return null;

                    if (extraContent.type === "comment") {
                      return (
                        <div className="bg-surface border border-subtle rounded-lg p-4">
                          <p className="text-[13px] text-zinc-400 leading-relaxed">
                            {extraContent.text}
                          </p>
                        </div>
                      );
                    }

                    if (extraContent.type === "file" && extraContent.files?.length > 0) {
                      return (
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase font-semibold text-zinc-500 tracking-wider">
                            Attachments
                          </p>
                          {extraContent.files.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 border border-subtle rounded-lg bg-surface hover:border-border-default transition-colors"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded flex items-center justify-center bg-surface-elevated text-[10px] font-semibold text-text-muted">
                                  {f.name.split('.').pop().toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[13px] text-text-secondary truncate">{f.name}</div>
                                  <div className="text-[11px] text-zinc-500">{f.size}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    if (extraContent.type === "actions") {
                      return (
                        <div className="flex items-center gap-2 pt-2">
                          <button className="flex-1 py-2 rounded-lg border border-subtle text-[13px] font-medium text-zinc-400 hover:bg-surface-hover hover:text-primary transition-colors">
                            {extraContent.options?.[0] || "Decline"}
                          </button>
                          <button className="flex-1 py-2 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground hover:bg-primary/80 transition-colors">
                            {extraContent.options?.[1] || "Accept"}
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {/* Metadata Card */}
                  <div className="bg-surface rounded-lg border border-subtle p-4">
                    <div className="grid grid-cols-2 gap-y-3 text-[12px]">
                      <div className="text-zinc-500">Received</div>
                      <div className="text-text-tertiary text-right">
                        {formattedDetailDate || "Unknown"}
                      </div>
                      <div className="text-zinc-500">Status</div>
                      <div className="flex items-center justify-end gap-2 text-text-tertiary">
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedNotification.read ? "bg-zinc-500" : "bg-blue-500"}`} />
                        {selectedNotification.read ? "Read" : "Unread"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-subtle bg-surface-elevated flex gap-2 shrink-0">
                {!selectedNotification.read && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setIsSheetOpen(false);
                    }}
                    className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[13px]"
                  >
                    <MailOpen className="w-4 h-4" />
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedNotification.id)}
                  className="w-10 h-10 border border-subtle text-text-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 rounded-lg flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  <LucideIcons.Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
