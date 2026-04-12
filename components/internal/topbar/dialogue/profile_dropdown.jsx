"use client";

import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Palette,
  ChevronRight,
  Building2,
  HelpCircle,
  MessageSquare,
  Shield,
  BookOpen,
  ExternalLink,
  Monitor,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const surfaceStyle = {
  backgroundColor: "#1a1a1a",
  borderColor: "#2a2a2a",
  color: "#ffffff",
};

const itemBaseStyle =
  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-default transition-colors outline-none";

const itemHoverStyle = "hover:bg-[#242424] focus:bg-[#242424] text-[#a3a3a3] hover:text-white focus:text-white";

export function ProfileDropdown({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser({
          name:
            userData.user.user_metadata?.full_name ||
            userData.user.user_metadata?.name ||
            userData.user.email?.split("@")[0] ||
            "User",
          email: userData.user.email || "",
          avatar: userData.user.user_metadata?.avatar_url || null,
        });
      }
    };
    fetchUser();
  }, []);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@email.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button className="w-8 h-8 rounded-full border border-[#333333] hover:border-[#474747] overflow-hidden ml-1 transition-colors">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72 p-0 rounded-xl border shadow-xl"
        style={surfaceStyle}
        sideOffset={8}
        align="end"
      >
        <div className="p-4 pb-3">
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-[#333333]">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-semibold border-0">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-white truncate">
                  {displayName}
                </span>
                <span className="text-xs text-[#a3a3a3] truncate">
                  {displayEmail}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </div>

        <DropdownMenuSeparator className="bg-[#2a2a2a] mx-0" />

        <div className="p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <User className="size-4 text-[#a3a3a3]" />
              <span>Profile</span>
              <DropdownMenuShortcut className="text-[#737373] text-xs">
                ⇧⌘P
              </DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <Building2 className="size-4 text-[#a3a3a3]" />
              <span>Organization Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <CreditCard className="size-4 text-[#a3a3a3]" />
              <span>Billing & Plans</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={`${itemBaseStyle} ${itemHoverStyle}`}
              >
                <Palette className="size-4 text-[#a3a3a3]" />
                <span>Appearance</span>
                <span className="ml-auto text-xs text-[#737373] flex items-center gap-1">
                  Dark
                  <ChevronRight className="size-3" />
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className="rounded-lg border shadow-xl p-1.5"
                style={surfaceStyle}
              >
                <DropdownMenuItem
                  className={`${itemBaseStyle} ${itemHoverStyle}`}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="size-4 text-[#a3a3a3]" />
                  <span>Light</span>
                  {theme === "light" && (
                    <span className="ml-auto text-[#3b82f6]">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${itemBaseStyle} ${itemHoverStyle}`}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="size-4 text-[#a3a3a3]" />
                  <span>Dark</span>
                  {theme === "dark" && (
                    <span className="ml-auto text-[#3b82f6]">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${itemBaseStyle} ${itemHoverStyle}`}
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="size-4 text-[#a3a3a3]" />
                  <span>System</span>
                  {theme === "system" && (
                    <span className="ml-auto text-[#3b82f6]">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <Settings className="size-4 text-[#a3a3a3]" />
              <span>Settings</span>
              <DropdownMenuShortcut className="text-[#737373] text-xs">
                ⌘,
              </DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <Shield className="size-4 text-[#a3a3a3]" />
              <span>Security</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <BookOpen className="size-4 text-[#a3a3a3]" />
              <span>Documentation</span>
              <ExternalLink className="size-3 ml-auto text-[#737373]" />
            </DropdownMenuItem>

            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <MessageSquare className="size-4 text-[#a3a3a3]" />
              <span>Send Feedback</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className={`${itemBaseStyle} ${itemHoverStyle}`}
            >
              <HelpCircle className="size-4 text-[#a3a3a3]" />
              <span>Help & Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />

          <DropdownMenuItem
            className={`${itemBaseStyle} hover:bg-[#2a1a1a] focus:bg-[#2a1a1a] text-[#a3a3a3] hover:text-red-400 focus:text-red-400`}
          >
            <LogOut className="size-4" />
            <span>Sign out</span>
            <DropdownMenuShortcut className="text-[#737373] text-xs">
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </div>

        <div className="px-4 py-2.5 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between text-[11px] text-[#737373]">
            <span>Flow v1.0.0</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Online
            </span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
