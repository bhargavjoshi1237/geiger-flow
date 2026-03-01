"use client";

import React from "react";
import { Settings, Shield, Bell, Database, HardDrive, Key } from "lucide-react";

export function OrganizationSettingsScreen() {
  const sections = [
    {
      title: "General",
      description: "Manage organization name and description",
      icon: Settings,
    },
    {
      title: "Security",
      description: "Two-factor authentication and login logs",
      icon: Shield,
    },
    {
      title: "Notifications",
      description: "Email and SMS settings",
      icon: Bell,
    },
    { title: "API Keys", description: "Manage project access keys", icon: Key },
  ];

  return (
    <div className="flex flex-col gap-8 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-[#e7e7e7]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#e7e7e7] tracking-tight">
          Organization Settings
        </h1>
        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          Delete Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 mt-4">
        {sections.map((s, i) => (
          <div
            key={i}
            className="flex gap-6 group cursor-pointer relative p-6 bg-[#202020] border border-[#2a2a2a] rounded-2xl hover:border-[#474747] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-white shrink-0 shadow-inner group-hover:bg-[#2a2a2a] group-hover:border-[#333333] transition-colors">
              <s.icon className="w-6 h-6 text-[#737373] group-hover:text-[#e7e7e7] transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#e7e7e7] mb-1 tracking-tight group-hover:text-[#e7e7e7] transition-colors">
                {s.title}
              </h3>
              <p className="text-sm font-medium text-[#a3a3a3] leading-relaxed ">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
