"use client";

import React, { useState, useSyncExternalStore } from "react";
import { User, Bell, Palette, Shield, Video, Check } from "lucide-react";
import { toast } from "sonner";
import { ScreenContainer, ScreenHeader } from "./screen-shell";
import { UserAvatar } from "@/components/internal/screens/projects/grounding/chat/user-avatar";
import { Switch } from "@geiger/ui";
import { ME } from "@/lib/chat/people-store";
import {
  getServerSnapshot as desktopServerSnapshot,
  getSnapshot as desktopSnapshot,
  requestPermission as requestDesktopPermission,
  setEnabled as setDesktopEnabled,
  subscribe as subscribeDesktop,
} from "@/lib/chat/browser-notifications";
import { cn } from "@/lib/utils";

function Row({ icon: Icon, title, subtitle, control }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3.5 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-text-secondary" /> : null}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {subtitle ? <p className="text-xs text-text-secondary">{subtitle}</p> : null}
        </div>
      </div>
      {control}
    </div>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface-subtle">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

const ACCENTS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];
const THEMES = ["System", "Dark", "Light"];

export function SettingsScreen() {
  const [toggles, setToggles] = useState({
    desktop: true, mentions: true, dm: true, sounds: false, presence: true, readReceipts: true,
  });
  const [accent, setAccent] = useState("#6366f1");
  const [theme, setTheme] = useState("Dark");
  const set = (key) => (val) => setToggles((p) => ({ ...p, [key]: val }));

  // Desktop notifications are real: the switch reflects the browser permission
  // and the stored preference, which live outside React.
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    desktopServerSnapshot,
  );
  const desktopOn = desktop.enabled && desktop.permission === "granted";

  const toggleDesktop = async (want) => {
    if (!want) {
      setDesktopEnabled(false);
      return;
    }
    // Turning it on may need the browser's permission prompt first.
    const result = await requestDesktopPermission();
    if (result !== "granted") {
      toast.error(
        result === "denied"
          ? "Your browser is blocking notifications for this site."
          : "Notifications weren't enabled.",
      );
      return;
    }
    setDesktopEnabled(true);
    toast.success("Desktop notifications on");
  };

  const desktopSubtitle = !desktop.supported
    ? "Your browser doesn't support notifications"
    : desktop.permission === "denied"
      ? "Blocked by your browser — allow notifications in site settings"
      : "Alert me on my desktop when a message arrives";

  return (
    <ScreenContainer secondary>
      <ScreenHeader title="Settings" description="Manage your profile, notifications, and workspace preferences." />

      <div className="space-y-5">
        <Card icon={Bell} title="Notifications">
          <Row
            icon={Bell}
            title="Desktop notifications"
            subtitle={desktopSubtitle}
            control={
              <Switch
                checked={desktopOn}
                disabled={!desktop.supported || desktop.permission === "denied"}
                onCheckedChange={toggleDesktop}
              />
            }
          />
          <Row title="Mentions & replies" subtitle="Notify me when I'm mentioned" control={<Switch checked={toggles.mentions} onCheckedChange={set("mentions")} />} />
          <Row title="Direct messages" subtitle="Notify me for every DM" control={<Switch checked={toggles.dm} onCheckedChange={set("dm")} />} />
          <Row title="Message sounds" subtitle="Play a sound on new messages" control={<Switch checked={toggles.sounds} onCheckedChange={set("sounds")} />} />
        </Card>

        <Card icon={Palette} title="Appearance">
          <Row title="Theme" subtitle="How Geiger Chat looks to you" control={
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-card p-1">
              {THEMES.map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={cn("h-7 rounded-md px-2.5 text-xs font-medium transition-colors", theme === t ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {t}
                </button>
              ))}
            </div>
          } />
          <Row title="Accent color" subtitle="Used for highlights and your messages" control={
            <div className="flex items-center gap-2">
              {ACCENTS.map((c) => (
                <button key={c} onClick={() => setAccent(c)} className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-inset ring-white/10" style={{ backgroundColor: c }}>
                  {accent === c ? <Check className="h-3.5 w-3.5 text-white" /> : null}
                </button>
              ))}
            </div>
          } />
        </Card>

        <Card icon={Shield} title="Privacy & Calls">
          <Row icon={Video} title="Show my presence" subtitle="Let teammates see when you're active" control={<Switch checked={toggles.presence} onCheckedChange={set("presence")} />} />
          <Row title="Read receipts" subtitle="Share when you've read messages" control={<Switch checked={toggles.readReceipts} onCheckedChange={set("readReceipts")} />} />
        </Card>
      </div>
    </ScreenContainer>
  );
}
