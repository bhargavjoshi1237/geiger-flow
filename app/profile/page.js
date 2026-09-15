"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Settings, UsersRound, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@geiger/ui/avatar";
import { getUser } from "@/lib/supabase/user";

// Org-level surfaces belong to geiger-dash, which serves them outside Flow's
// basePath — so these are plain anchors, not next/link.
const QUICK_LINKS = [
  {
    href: "/org",
    icon: UsersRound,
    label: "View team",
    description: "People in your organization",
  },
  {
    href: "/org",
    icon: Settings,
    label: "Organization settings",
    description: "Organization name, members, and preferences",
  },
  {
    href: "/billing",
    icon: Wallet,
    label: "Billing & plans",
    description: "Current plan and usage",
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getUser()
      .then((u) => {
        if (active) {
          setUser(u);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@email.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const pfpUrl = user?.id
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pfp/${user.id}/latest.jpg`
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <a
          href="/org"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to organization
        </a>

        <div className="mt-6 rounded-xl border border-border bg-surface-subtle p-6">
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-surface-hover border border-border" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-surface-hover" />
                <div className="h-3 w-48 rounded bg-surface-hover" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar className="size-14 border border-border">
                {pfpUrl && <AvatarImage src={pfpUrl} alt={displayName} />}
                <AvatarFallback className="bg-surface-card text-muted-foreground text-sm font-semibold border-0">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-surface-subtle p-2">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-active transition-colors"
            >
              <link.icon className="size-4 text-muted-foreground shrink-0" />
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {link.label}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {link.description}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
