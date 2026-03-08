import React from "react";
import * as LucideIcons from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Check,
  Archive,
  Trash2,
  Bell,
  Download,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) {
  // Try to get icon component from lucide-react dynamically, fallback to Bell
  const IconComponent = LucideIcons[notification.icon] || Bell;

  // Format the time nicely if it's a valid date, otherwise just use it as string (for dummy data fallback)
  let formattedTime = notification.time;
  try {
    const date = new Date(notification.time);
    if (!isNaN(date.getTime())) {
      formattedTime = formatDistanceToNow(date, { addSuffix: true });
    }
  } catch (e) {
    // Keep as is if error parsing
  }

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
  } catch (e) {
    // Failed to parse extra context
  }

  return (
    <div
      onClick={() => onClick(notification)}
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all ${
        notification.read
          ? "bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#202020] hover:border-[#333333]"
          : "bg-[#202020] border-[#333333] hover:border-[#474747] shadow-sm cursor-pointer relative"
      }`}
    >
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1.5">
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse"></div>
        </div>
      )}

      <div
        className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${notification.bg_color || notification.bgColor || "bg-[#2a2a2a]"} border border-white/5`}
      >
        <IconComponent
          className={`w-[16px] h-[16px] ${notification.icon_color || notification.iconColor || "text-[#737373]"}`}
          strokeWidth={1.8}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3
            className={`text-[14px] font-medium truncate ${
              notification.read ? "text-[#e7e7e7]" : "text-white"
            }`}
          >
            {notification.title}
          </h3>
          <span className="text-[11px] font-medium text-[#737373] whitespace-nowrap shrink-0">
            {formattedTime}
          </span>
        </div>
        <p
          className={`text-[13px] leading-snug pr-8 ${
            notification.read ? "text-[#a3a3a3]" : "text-[#d4d4d4]"
          } line-clamp-1`}
        >
          {notification.description}
        </p>

        {extraContent && (
          <div className="mt-3 pr-8">
            {extraContent.type === "comment" && (
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 text-[13px] text-[#d4d4d4] leading-snug relative before:content-[''] before:absolute before:-top-[6px] before:left-4 before:w-3 before:h-3 before:bg-[#1a1a1a] before:border-l before:border-t before:border-[#333333] before:rotate-45">
                {extraContent.text}
              </div>
            )}

            {extraContent.type === "file" &&
              extraContent.files?.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border border-[#333333] rounded-xl bg-[#1a1a1a] mt-2 first:mt-0"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-[#222222] shrink-0 text-[#a3a3a3]">
                      {f.iconType === "image" ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-white truncate">
                        {f.name}
                      </div>
                      <div className="text-[11px] text-[#a3a3a3]">{f.size}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded flex items-center justify-center text-[#737373] hover:text-white hover:bg-[#333333] transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}

            {extraContent.type === "actions" && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-1.5 rounded-full border border-[#444444] text-[13px] font-medium text-[#d4d4d4] hover:bg-[#222222] hover:text-white transition-colors"
                >
                  {extraContent.options?.[0] || "Decline"}
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-1.5 rounded-full bg-white text-[13px] font-medium text-[#161616] hover:bg-gray-200 transition-colors"
                >
                  {extraContent.options?.[1] || "Accept"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#a3a3a3] bg-[#2a2a2a] px-2 py-0.5 rounded border border-[#3a3a3a] flex items-center">
            {notification.type}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 shrink-0 lg:opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="text-[#737373] hover:text-[#e7e7e7] p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors focus:outline-none">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[180px] bg-[#212121] border-[#2a2a2a] text-[#e7e7e7]"
            onClick={(e) => e.stopPropagation()}
          >
            {!notification.read && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="cursor-pointer flex items-center gap-2.5"
              >
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Mark as read</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2.5">
              <Archive className="w-4 h-4 text-[#a3a3a3]" />
              <span className="text-sm font-medium">Archive</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="cursor-pointer flex items-center gap-2.5 text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
