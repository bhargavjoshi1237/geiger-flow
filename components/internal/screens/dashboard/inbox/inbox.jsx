"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Filter,
  MailOpen,
  Inbox,
  Activity,
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
          <h1 className="text-3xl font-semibold text-[#e7e7e7] tracking-tight flex items-center gap-3">
            Inbox
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1.5 font-medium">
            Stay updated with all notifications and alerts across your
            workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="text-sm font-medium text-[#a3a3a3] hover:text-[#e7e7e7] bg-[#202020] hover:bg-[#2a2a2a] border border-[#2a2a2a] px-3.5 py-2 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-[#202020] disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MailOpen className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 shrink-0 bg-[#161616] z-10 sticky top-0 pb-2">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <Input
              type="text"
              placeholder="Filter notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#e7e7e7] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#474747] transition-all focus:ring-1 focus:ring-[#474747] placeholder:text-[#525252]"
            />
          </div>
          <button className="flex items-center justify-center p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#202020] transition-colors">
            <Filter className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto min-h-0 pr-1 pb-10 flex flex-col gap-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#333 #161616" }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-[200px] text-[#737373]">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-[#737373] border border-dashed border-[#2a2a2a] rounded-2xl bg-[#1a1a1a]/50">
            <Inbox
              className="w-12 h-12 mb-4 text-[#404040]"
              strokeWidth={1.5}
            />
            <p className="text-lg font-medium text-[#e7e7e7]">All caught up!</p>
            <p className="text-sm mt-1.5 text-[#a3a3a3]">
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
        <SheetContent className="bg-[#161616] border-l border-[#2a2a2a] text-[#e7e7e7] p-0 sm:max-w-md w-full shadow-2xl flex flex-col [&>button]:right-6 [&>button]:top-6 [&>button]:text-[#737373] hover:[&>button]:text-white">
          {selectedNotification && (
            <>
              <SheetHeader className="px-6 pt-10 pb-6 border-b border-[#2a2a2a] shrink-0 bg-[#1a1a1a] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                      selectedNotification.bg_color ||
                      selectedNotification.bgColor ||
                      "bg-[#2a2a2a]"
                    } border border-white/10 shadow-sm`}
                  >
                    <DetailIconComponent
                      className={`w-6 h-6 ${
                        selectedNotification.icon_color ||
                        selectedNotification.iconColor ||
                        "text-[#737373]"
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 flex-1 min-w-0 mt-1">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#a3a3a3] bg-[#2a2a2a] px-2 py-0.5 rounded border border-[#3a3a3a] leading-tight flex items-center">
                        {selectedNotification.type}
                      </span>
                      <span className="text-[11px] font-medium text-[#737373] shrink-0">
                        {formattedDetailDate || "Just now"}
                      </span>
                    </div>
                  </div>
                </div>
                <SheetTitle className="text-xl font-semibold text-white mt-2 pr-6 leading-tight relative z-10">
                  {selectedNotification.title}
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar bg-[#161616]">
                <div className="space-y-8">
                  <section>
                    <SheetDescription className="text-[15px] text-[#d4d4d4] leading-relaxed whitespace-pre-wrap">
                      {selectedNotification.description}
                    </SheetDescription>
                  </section>

                  <section className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
                    <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      Metadata
                    </h4>

                    <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
                      <div className="text-[#737373] font-medium">Date</div>
                      <div className="text-[#e7e7e7]" title={fullDateStr}>
                        {formattedDetailDate || "Unknown date"}
                      </div>

                      <div className="text-[#737373] font-medium">Type</div>
                      <div className="text-[#e7e7e7] capitalize">
                        {selectedNotification.type}
                      </div>

                      <div className="text-[#737373] font-medium">Status</div>
                      <div className="flex items-center gap-2 text-[#e7e7e7]">
                        <div
                          className={`w-2 h-2 rounded-full ${selectedNotification.read ? "bg-[#737373]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"}`}
                        ></div>
                        {selectedNotification.read ? "Read" : "Unread"}
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-4 border-t border-[#2a2a2a] bg-[#1a1a1a] flex gap-3 shrink-0">
                {!selectedNotification.read && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setIsSheetOpen(false);
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-black font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <MailOpen className="w-4 h-4" />
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedNotification.id);
                  }}
                  className="w-10 h-10 border border-[#2a2a2a] text-[#a3a3a3] hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-colors shrink-0"
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
