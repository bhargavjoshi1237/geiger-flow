"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Check,
  Inbox,
  Loader2,
  MailOpen,
  Trash2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { ActionMenu } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { SegmentedTabs } from "@geiger/ui";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { Button } from "@geiger/ui";
import {
  formatNotificationTime,
  getNotificationIcon,
  parseNotificationExtra,
} from "./notification_item";

const INBOX_TABS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
];

const READ_STATUS_MAP = {
  unread: { label: "Unread", variant: "info" },
  read: { label: "Read", variant: "neutral" },
};

export function InboxScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
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
    void Promise.resolve().then(fetchNotifications);
  }, []);

  const handleMarkAsRead = async (id) => {
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

  const typeFilterOptions = useMemo(
    () => [
      { value: "all", label: "All Types" },
      ...Array.from(
        new Set(notifications.map((n) => n.type).filter(Boolean)),
      ).map((type) => ({ value: type, label: type })),
    ],
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchesSearch =
        !needle ||
        n.title.toLowerCase().includes(needle) ||
        n.description.toLowerCase().includes(needle);
      const matchesTab =
        activeTab === "all" ? true : activeTab === "unread" ? !n.read : true;
      const matchesType = typeFilter === "all" || n.type === typeFilter;
      return matchesSearch && matchesTab && matchesType;
    });
  }, [notifications, search, activeTab, typeFilter]);

  const pager = usePagination(filteredNotifications, {
    resetKey: `${search}|${activeTab}|${typeFilter}`,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasFilters =
    search.trim().length > 0 || activeTab !== "all" || typeFilter !== "all";
  const emptyTitle = hasFilters
    ? activeTab === "unread"
      ? "No unread notifications"
      : "No matching notifications"
    : "No notifications yet";
  const emptyDescription = hasFilters
    ? "Try clearing your search or switching filters."
    : "Workspace notifications and alerts will appear here once there is activity.";

  const stats = useMemo(() => {
    const read = notifications.length - unreadCount;
    const types = new Set(
      notifications.map((n) => n.type).filter(Boolean),
    ).size;
    return [
      {
        label: "Total",
        value: String(notifications.length),
        footer: "All notifications",
      },
      {
        label: "Unread",
        value: String(unreadCount),
        footer: "Need your attention",
      },
      {
        label: "Read",
        value: String(read),
        footer: "Already caught up",
      },
      {
        label: "Categories",
        value: String(types),
        footer: "Notification types",
      },
    ];
  }, [notifications, unreadCount]);

  const columns = [
    {
      key: "notification",
      header: "Notification",
      render: (notification) => {
        const IconComponent = getNotificationIcon(notification.icon);
        const bgColor =
          notification.bg_color || notification.bgColor || "bg-surface-hover";
        const iconColor =
          notification.icon_color ||
          notification.iconColor ||
          "text-text-secondary";
        const isUnread = !notification.read;
        const extra = parseNotificationExtra(notification.extra);
        return (
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgColor} border border-foreground/10`}
            >
              <IconComponent
                className={`h-4 w-4 ${iconColor}`}
                strokeWidth={1.8}
              />
            </div>
            <div className="min-w-0">
              <p
                className={`truncate text-[13px] font-medium ${isUnread ? "text-foreground" : "text-muted-foreground"}`}
              >
                {notification.title}
              </p>
              <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                {notification.description}
              </p>
              {extra?.type === "comment" && (
                <p className="mt-1.5 line-clamp-2 rounded-lg border border-border bg-surface-card p-2 text-[12px] leading-relaxed text-muted-foreground">
                  {extra.text}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (notification) => (
        <Badge variant="neutral" className="uppercase">
          {notification.type}
        </Badge>
      ),
    },
    {
      key: "received",
      header: "Received",
      render: (notification) => (
        <span className="whitespace-nowrap text-xs text-text-secondary">
          {formatNotificationTime(notification.time)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (notification) => (
        <StatusPill
          status={notification.read ? "read" : "unread"}
          map={READ_STATUS_MAP}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (notification) => (
        <ActionMenu
          label={`Actions for ${notification.title}`}
          items={[
            !notification.read && {
              icon: Check,
              label: "Mark as read",
              onSelect: () => handleMarkAsRead(notification.id),
            },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => handleDelete(notification.id),
            },
          ]}
        />
      ),
    },
  ];

  const DetailIconComponent =
    selectedNotification?.icon && LucideIcons[selectedNotification.icon]
      ? LucideIcons[selectedNotification.icon]
      : LucideIcons.Bell;

  let formattedDetailDate = "";
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
      }
    }
  } catch {}

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Inbox"
        description="Stay updated with all notifications and alerts across your workspace."
        actions={
          <Button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
            variant="outline"
            className="h-9 rounded-lg border-border bg-surface-card px-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MailOpen className="h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedTabs
            tabs={INBOX_TABS.map((tab) => ({
              ...tab,
              label:
                tab.value === "unread" && unreadCount > 0
                  ? `Unread (${unreadCount})`
                  : tab.label,
            }))}
            value={activeTab}
            onChange={setActiveTab}
          />
          <FilterDropdown
            value={typeFilter}
            onValueChange={setTypeFilter}
            options={typeFilterOptions}
            height="h-9"
          />
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter notifications…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading notifications…
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(n) => n.id}
            onRowClick={handleNotificationClick}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Inbox}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="notifications" />
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-background border-l border-border text-foreground p-0 w-full max-w-md shadow-2xl flex flex-col [&>button]:right-5 [&>button]:top-5 [&>button]:text-text-tertiary hover:[&>button]:text-foreground">
          {selectedNotification && (
            <>
              <div className="px-6 pt-12 pb-5 border-b border-border shrink-0 bg-background">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                      selectedNotification.bg_color ||
                      selectedNotification.bgColor ||
                      "bg-surface-card"
                    } border border-foreground/10`}
                  >
                    <DetailIconComponent
                      className={`w-5 h-5 ${
                        selectedNotification.icon_color ||
                        selectedNotification.iconColor ||
                        "text-text-secondary"
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-text-secondary bg-surface-card px-2 py-1 rounded-md border border-border">
                        {selectedNotification.type}
                      </span>
                      <span className="text-[11px] text-text-tertiary shrink-0">
                        {formattedDetailDate || "Just now"}
                      </span>
                    </div>
                  </div>
                </div>
                <SheetTitle className="text-lg font-semibold text-foreground leading-tight pr-6">
                  {selectedNotification.title}
                </SheetTitle>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 bg-background">
                <div className="space-y-5">
                  <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.description}
                  </p>

                  {(() => {
                    const extraContent = parseNotificationExtra(
                      selectedNotification.extra,
                    );

                    if (!extraContent) return null;

                    if (extraContent.type === "comment") {
                      return (
                        <div className="bg-surface-subtle border border-border rounded-lg p-4">
                          <p className="text-[13px] text-muted-foreground leading-relaxed">
                            {extraContent.text}
                          </p>
                        </div>
                      );
                    }

                    if (extraContent.type === "file" && extraContent.files?.length > 0) {
                      return (
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase font-semibold text-text-tertiary tracking-wider">
                            Attachments
                          </p>
                          {extraContent.files.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface-subtle hover:border-border transition-colors"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded flex items-center justify-center bg-surface-card text-[10px] font-semibold text-text-secondary">
                                  {f.name.split('.').pop().toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[13px] text-muted-foreground truncate">{f.name}</div>
                                  <div className="text-[11px] text-text-tertiary">{f.size}</div>
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
                          <Button className="flex-1 py-2 rounded-lg border border-border text-[13px] font-medium text-muted-foreground hover:bg-surface-card hover:text-foreground transition-colors">
                            {extraContent.options?.[0] || "Decline"}
                          </Button>
                          <Button className="flex-1 py-2 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            {extraContent.options?.[1] || "Accept"}
                          </Button>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  <div className="bg-surface-subtle rounded-lg border border-border p-4">
                    <div className="grid grid-cols-2 gap-y-3 text-[12px]">
                      <div className="text-text-tertiary">Received</div>
                      <div className="text-muted-foreground text-right">
                        {formattedDetailDate || "Unknown"}
                      </div>
                      <div className="text-text-tertiary">Status</div>
                      <div className="flex items-center justify-end gap-2 text-muted-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedNotification.read ? "bg-muted-foreground" : "bg-blue-500"}`} />
                        {selectedNotification.read ? "Read" : "Unread"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border bg-background flex gap-2 shrink-0">
                {!selectedNotification.read && (
                  <Button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setIsSheetOpen(false);
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[13px]"
                  >
                    <MailOpen className="w-4 h-4" />
                    Mark as Read
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(selectedNotification.id)}
                  className="w-10 h-10 border border-border text-text-secondary hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 rounded-lg flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  <LucideIcons.Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainScreenWrapper>
  );
}

export default InboxScreen;
