"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Users, CreditCard, LogOut, Settings, ChevronRight, Copy, Check, Phone, MessageSquare, CalendarClock, MessageCircle, UserPlus, ChevronDown, Link } from "lucide-react";

export function ProfileDropdown({ children, user }) {
  const [copied, setCopied] = useState(false);
  const [appointOpen, setAppointOpen] = useState(false);
  const appointRef = useRef(null);

  const userData = user || {
    name: "Bhargav Joshi",
    email: "bhargav@geigerintel.com",
    role: "Admin",
    avatar: null,
    profileUrl: "#",
    followers: 184,
    following: 62,
    posts: 38,
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + "/u/" + userData.name.toLowerCase().replace(/\s+/g, "-"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (appointRef.current && !appointRef.current.contains(e.target)) {
        setAppointOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: "My Profile", href: "#" },
    { icon: Users, label: "Manage Team", href: "#" },
    { icon: CreditCard, label: "Billing", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  const appointOptions = [
    { icon: CalendarClock, label: "Schedule Meeting" },
    { icon: MessageSquare, label: "Start Chat" },
    { icon: Phone, label: "Start Call" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button className="w-9 h-9 rounded-full border border-[#333333] hover:border-[#474747] overflow-hidden ml-1 transition-all cursor-pointer hover:scale-105">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-2 w-80 p-0 bg-[#202020] rounded-xl overflow-hidden shadow-xl"
      >
        {/* Poster Header */}
        <div className="h-full rounded-xl m-2 overflow-hidden relative">
          <img src="/Poster.png" className="w-full h-full object-cover z-1" alt="" />
        </div>

        {/* Avatar + Copy Link */}
        <div className="flex items-end justify-between px-5 -mt-10 relative z-10">
          <div className="bg-[#202020] h-[72px] w-[72px] rounded-full p-[3px]">
            <img src="https://i.pravatar.cc/155?u=99" className="grayscale w-full h-full object-cover rounded-full" alt="" />
          </div>
          <button
            onClick={handleCopyLink}
            className=" px-4 py-2 rounded-md bg-[#2a2a2a] hover:bg-[#333] text-[#a3a3a3] hover:text-[#e7e7e7] transition-colors flex items-center gap-1.5 text-[11px] font-medium"
          >
            {copied ? (
              <><Link className="w-3 h-3 text-emerald-400" /></>
            ) : (
              <><Link className="w-3 h-3" /></>
            )}
          </button>
        </div>

        {/* Name & Role */}
        <div className="px-5 mt-2">
          <h3 className="text-[15px] font-semibold text-[#e7e7e7] leading-tight">{userData.name}</h3>
          <div className="flex gap-1.5 items-center">
            <p className="text-xs text-[#a3a3a3] mt-0.5">Software Engineer </p><p className="text-xs text-[#424242] mt-0.5">|</p><p className="text-xs text-[#a3a3a3] mt-0.5">Studio Electric</p>
          </div>
           </div>

        <div className="flex items-center gap-2 px-5 mt-4 mb-4">
          <button className="flex-1 h-8 rounded-lg bg-white text-[#161616] text-xs font-semibold hover:bg-white/90 transition-colors">
            <UserPlus className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            Follow
          </button>
          <button className="flex-1 h-8 rounded-lg bg-[#2a2a2a] text-[#a3a3a3] text-xs font-semibold hover:bg-[#333] hover:text-[#e7e7e7] transition-colors">
            <MessageCircle className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            Message
          </button>
          <div className="relative" ref={appointRef}>
            <button
              onClick={() => setAppointOpen(!appointOpen)}
              className="h-8 w-8 rounded-lg bg-[#2a2a2a] text-[#a3a3a3] hover:bg-[#333] hover:text-[#e7e7e7] transition-colors flex items-center justify-center"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {appointOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#2e2e2e] rounded-lg shadow-xl border border-[#333]/50 py-1 z-50 animate-in fade-in slide-in-from-top-1">
                {appointOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAppointOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#242424] transition-colors"
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-[#2a2a2a] my-1 mx-3" />

        <div className="py-1">
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="flex items-center justify-between px-4 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors hover:bg-[#2e2e2e] focus:bg-[#2e2e2e] group"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[#a3a3a3] group-hover:text-[#e7e7e7] transition-colors" />
                <span className="text-sm text-[#a3a3a3] group-hover:text-[#e7e7e7] transition-colors">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-3 h-3 text-[#555] group-hover:text-[#888] transition-colors" />
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-[#2e2e2e] my-0" />

        <div className="py-1.5">
          <DropdownMenuItem className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors hover:bg-[#2e2e2e] group">
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
