import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Download, FileText, Image as ImageIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

export function NotificationsDropdown({ children }) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
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
    };
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    return activeTab === "all" ? true : activeTab === "unread" ? !n.read : true;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button className="w-8 h-8 rounded-full border border-transparent hover:bg-surface-hover flex items-center justify-center transition-colors text-text-tertiary hover:text-primary relative">
            <Bell className="w-[18px] h-[18px] stroke-black dark:stroke-white" strokeWidth={2} />
            {notifications.some((n) => !n.read) && (
              <div className="absolute top-[6px] right-[7px] w-2 h-2 rounded-full bg-blue-500 border border-surface"></div>
            )}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-1 w-[380px] p-0 bg-popover border rounded-2xl overflow-hidden  scrollbar-hide"
      >
        <div className="px-5 pt-5 pb-4 flex flex-col gap-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-foreground">
              Notifications
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-muted w-full justify-center rounded-lg p-1 border">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 text-sm w-full font-medium rounded-md transition-all ${
                  activeTab === "all"
                    ? "bg-[--tab-selected] text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-4 py-1.5 text-sm w-full font-medium rounded-md transition-all flex items-center gap-2 ${
                  activeTab === "unread"
                    ? "bg-[--tab-selected] text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                Unread
                {notifications.some((n) => !n.read) && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === "unread" ? "bg-primary" : "bg-primary/60"
                    }`}
                  ></span>
                )}
              </button>
              {["General", "Mentions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-1.5 text-sm w-full font-medium rounded-md transition-all ${
                    activeTab === tab.toLowerCase()
                      ? "bg-accent text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto pb-2 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] text-muted-foreground">
              No notifications found.
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = LucideIcons[notification.icon] || Bell;
              let formattedTime = notification.time;
              try {
                const date = new Date(notification.time);
                if (!isNaN(date.getTime())) {
                  formattedTime = formatDistanceToNow(date, {
                    addSuffix: true,
                  });
                }
              } catch (e) {}

              let extraContent = null;
              try {
                if (typeof notification.extra === "string") {
                  extraContent = JSON.parse(notification.extra);
                } else if (
                  typeof notification.extra === "object" &&
                  notification.extra !== null
                ) {
                  extraContent = notification.extra;
                }
              } catch (e) {}

              const isUnread = !notification.read;
              const bgColor = notification.bg_color || notification.bgColor || "bg-[#1f1f1f]";
              const iconColor = notification.icon_color || notification.iconColor || "text-[#666666]";

              return (
                <div
                  key={notification.id}
                  className={`px-4 py-3.5 transition-colors relative group cursor-pointer border-b last:border-b-0 ${
                    isUnread
                      ? "bg-accent/30 hover:bg-accent/50"
                      : "hover:bg-accent/20"
                  }`}
                >
                  {isUnread && (
                    <div className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-primary"></div>
                  )}

                  <div className="pl-3 flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${bgColor} border`}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${iconColor}`}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h3
                          className={`text-[13px] font-medium truncate ${
                            isUnread ? "text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                          {formattedTime}
                        </span>
                      </div>
                      <p
                        className={`text-[12px] leading-relaxed ${
                          isUnread ? "text-muted-foreground" : "text-muted-foreground/70"
                        } line-clamp-2`}
                      >
                        {notification.description}
                      </p>

                      {extraContent && (
                        <div className="mt-3">
                          {extraContent.type === "comment" && (
                            <div className="bg-muted border rounded-lg p-3 text-[12px] text-muted-foreground leading-relaxed">
                              {extraContent.text}
                            </div>
                          )}

                          {extraContent.type === "file" &&
                            extraContent.files?.map((f, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2.5 border border-subtle rounded-lg bg-surface mt-2"
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <div className="w-7 h-7 rounded flex items-center justify-center bg-surface-active text-text-muted text-[10px] font-medium">
                                    {f.name.split('.').pop().toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[12px] text-text-secondary truncate">
                                      {f.name}
                                    </div>
                                    <div className="text-[10px] text-text-muted">
                                      {f.size}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-hover transition-colors shrink-0"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))}

                          {extraContent.type === "actions" && (
                            <div className="flex items-center gap-2 mt-2.5">
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1.5 rounded-lg border border-border-default text-[11px] font-medium text-text-muted hover:bg-surface-hover hover:text-primary transition-colors"
                              >
                                {extraContent.options?.[0] || "Decline"}
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1.5 rounded-lg bg-primary text-[11px] font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
                              >
                                {extraContent.options?.[1] || "Accept"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3">
                        <span className="text-[9px] uppercase font-semibold tracking-wider text-text-muted bg-surface-elevated px-2 py-1 rounded-md border border-subtle">
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
