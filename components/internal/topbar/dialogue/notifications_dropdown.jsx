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
          <button className="w-8 h-8 rounded-full border border-transparent hover:bg-[#2a2a2a] flex items-center justify-center transition-colors text-[#a3a3a3] hover:text-white relative">
            <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
            {notifications.some((n) => !n.read) && (
              <div className="absolute top-[6px] right-[7px] w-2 h-2 rounded-full bg-[#3b82f6] border border-[#161616]"></div>
            )}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 bg-white dark:bg-[#161616] border border-gray-100 dark:border-[#333] shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>

          <div className="flex items-center gap-1.5 pb-1 justify-center">
            <div className="flex items-center gap-1 bg-[#1a1a1a] w-full justify-center rounded-lg p-1 border border-[#2a2a2a]">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 text-sm w-full font-medium rounded-md transition-all ${
                  activeTab === "all"
                    ? "bg-[#2a2a2a] text-[#e7e7e7] shadow-sm"
                    : "text-[#737373] hover:text-[#e7e7e7] hover:bg-[#202020]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-4 py-1.5 text-sm w-full font-medium rounded-md transition-all flex items-center gap-2 ${
                  activeTab === "unread"
                    ? "bg-[#2a2a2a] text-[#e7e7e7] shadow-sm"
                    : "text-[#737373] hover:text-[#e7e7e7] hover:bg-[#202020]"
                }`}
              >
                Unread
                {notifications.some((n) => !n.read) && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === "unread" ? "bg-blue-500" : "bg-blue-500/60"
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
                      ? "bg-[#2a2a2a] text-[#e7e7e7] shadow-sm"
                      : "text-[#737373] hover:text-[#e7e7e7] hover:bg-[#202020]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto pb-4 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-gray-500 dark:text-[#a3a3a3]">
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

              return (
                <div
                  key={notification.id}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors relative group"
                >
                  {!notification.read && (
                    <div className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  )}

                  <div className="pl-3 flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${notification.bg_color || notification.bgColor || "bg-gray-100 dark:bg-[#2a2a2a]"} border border-gray-200/50 dark:border-white/5`}
                    >
                      <IconComponent
                        className={`w-[16px] h-[16px] ${notification.icon_color || notification.iconColor || "text-gray-500 dark:text-[#737373]"}`}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h3
                          className={`text-[13.5px] font-medium truncate ${
                            notification.read
                              ? "text-gray-900 dark:text-gray-200"
                              : "text-black dark:text-white font-semibold"
                          }`}
                        >
                          {notification.title}
                        </h3>
                      </div>
                      <p
                        className={`text-[12.5px] leading-snug ${
                          notification.read
                            ? "text-gray-500 dark:text-[#a3a3a3]"
                            : "text-gray-700 dark:text-[#d4d4d4]"
                        } line-clamp-2`}
                      >
                        {notification.description}
                      </p>

                      {extraContent && (
                        <div className="mt-3">
                          {extraContent.type === "comment" && (
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl p-3 text-[13px] text-gray-600 dark:text-[#d4d4d4] leading-snug relative before:content-[''] before:absolute before:-top-[6px] before:left-4 before:w-3 before:h-3 before:bg-gray-50 dark:before:bg-[#1a1a1a] before:border-l before:border-t before:border-gray-200 dark:before:border-[#333] before:rotate-45">
                              {extraContent.text}
                            </div>
                          )}

                          {extraContent.type === "file" &&
                            extraContent.files?.map((f, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#1a1a1a] mt-2 first:mt-0"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-50 dark:bg-[#222] shrink-0 text-gray-500 dark:text-[#a3a3a3]">
                                    {f.iconType === "image" ? (
                                      <ImageIcon className="w-4 h-4" />
                                    ) : (
                                      <FileText className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                                      {f.name}
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-[#a3a3a3]">
                                      {f.size}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#333] transition-colors shrink-0"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))}

                          {extraContent.type === "actions" && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-[#444] text-[13px] font-medium text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                              >
                                {extraContent.options?.[0] || "Decline"}
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="px-4 py-1.5 rounded-full bg-gray-900 dark:bg-white text-[13px] font-medium text-white dark:text-[#161616] hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                              >
                                {extraContent.options?.[1] || "Accept"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-[11px] font-medium text-gray-400 dark:text-[#737373] mt-2 flex items-center justify-between">
                        {formattedTime}
                        {notification.type && (
                          <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500 dark:text-[#a3a3a3] bg-gray-100 dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded border border-gray-200 dark:border-[#3a3a3a]">
                            {notification.type}
                          </span>
                        )}
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
