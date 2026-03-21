"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Users, CreditCard, LogOut, Settings } from "lucide-react";

export function ProfileDropdown({ children, user }) {
  // Default user data if not provided
  const userData = user || {
    name: "Bhargav Joshi",
    email: "bhargav@geigerintel.com",
    role: "Admin",
    avatar: null,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button className="w-8 h-8 rounded-full border border-[#333333] hover:border-[#474747] overflow-hidden ml-1 transition-colors cursor-pointer">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-1 w-[320px] p-0 bg-[#141414] border border-[#1f1f1f] rounded-2xl overflow-hidden"
      >
        {/* Header with poster background */}
        <div
          className="h-24 w-full relative"
          style={{
            backgroundImage: "url('/Poster.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute top-3 right-3">
            <span className="bg-[#f59e0b] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              PRO
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 pb-4 -mt-10 relative">
          <div className="flex items-end gap-3 mb-3">
            <div className="w-14 h-14 rounded-full border-2 border-[#141414] overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-semibold">
                  {userData.name?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h3 className="text-white font-semibold text-base truncate">
                {userData.name}
              </h3>
              <p className="text-[#a3a3a3] text-xs truncate">{userData.email}</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 mb-3 border border-[#2a2a2a]">
            <span className="text-[#a3a3a3] text-xs">Role</span>
            <p className="text-white text-sm font-medium">{userData.role}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-[#1f1f1f] my-0" />

        {/* Menu Items */}
        <div className="py-2">
          <DropdownMenuItem className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
            <User className="w-4 h-4 text-[#a3a3a3]" />
            <span className="text-sm text-[#e7e7e7]">My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
            <Users className="w-4 h-4 text-[#a3a3a3]" />
            <span className="text-sm text-[#e7e7e7]">Manage Team</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
            <CreditCard className="w-4 h-4 text-[#a3a3a3]" />
            <span className="text-sm text-[#e7e7e7]">Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
            <Settings className="w-4 h-4 text-[#a3a3a3]" />
            <span className="text-sm text-[#e7e7e7]">Settings</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-[#1f1f1f] my-0" />

        {/* Sign Out */}
        <div className="py-2">
          <DropdownMenuItem className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
            <LogOut className="w-4 h-4 text-[#ef4444]" />
            <span className="text-sm text-[#ef4444]">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
