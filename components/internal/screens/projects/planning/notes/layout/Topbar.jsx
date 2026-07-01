"use client";

import React, { useState } from "react";
import {
  Undo2,
  Redo2,
  Smartphone,
  HelpCircle,
  Bell,
  Settings,
  Users2,
  PanelLeft,
  LucideChevronRight,
} from "lucide-react";

import SettingsDialog from "../settings/SettingsDilouge";
import CollaborateDilouge from "./CollaborateDilouge";
import DigitalClock from "./DigitalClock";
import NotificationDialog from "./NotificationDialog";
import AppDialog from "./AppDialog";
import HelpDialog from "./HelpDialog";
import { SupabaseActivityLine } from "@/components/internal/topbar/supabase_activity_line";
import { Button } from "@geiger/ui";
import { ThemeToggle } from "@geiger/ui";

export default function Topbar({
  id,
  settings,
  onSettingsChange,
  nodes,
  edges,
  sessionData,
  role,
  onAcceptRequest,
  onKickMember,
  onLeaveSession,
  onMerge,
  breadcrumbs,
  onBreadcrumbClick,
  isSyncing,
  onToggleSidebar,
  dialogContainer,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollaborateOpen, setIsCollaborateOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="relative h-14 px-4 flex items-center justify-between border-b border-border/50 bg-background/60 backdrop-blur-md text-foreground z-20 w-full shrink-0">
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] z-50 transition-opacity duration-500 ${
            isSyncing ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`h-full w-1/3 bg-gradient-to-r from-transparent via-ring to-transparent ${
              isSyncing ? "animate-sync-progress" : ""
            }`}
          ></div>
        </div>
        <SupabaseActivityLine />
        <div className="flex items-center gap-2">
          <Button
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover h-7 w-7 md:hidden -ml-2 transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
          <a
            className="w-10 h-8 rounded flex items-center justify-center shrink-0 md:-ml-1.5 transition-colors"
            href={
              process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : "/"
            }
          >
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo1.svg`}
              className="geiger-logo w-5 h-5 -mr-1.5"
              alt=""
            />
          </a>
          <div
            onClick={() => onBreadcrumbClick && onBreadcrumbClick(null)}
            className="flex items-center gap-1 cursor-pointer group group-data-[collapsible=icon]:hidden md:border-l md:border-border ml-1.5 pl-2 hidden sm:flex"
          >
            <span className="text-foreground font-semibold text-sm ml-2.5">Notes</span>
          </div>
          {breadcrumbs &&
            breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.id}>
                <LucideChevronRight className="w-4 h-4 text-text-tertiary" />
                <div
                  onClick={() =>
                    onBreadcrumbClick && onBreadcrumbClick(crumb.id)
                  }
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 rounded"
                >
                  <span className="text-sm font-medium text-foreground">
                    {crumb.name}
                  </span>
                </div>
              </React.Fragment>
            ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {(settings?.showClock ?? true) && (
            <>
              <div className="hidden md:block">
                <DigitalClock animated={settings?.clockAnimation ?? true} />
              </div>
              <div className="hidden sm:block h-5 w-[1px] bg-surface-strong mx-1"></div>
            </>
          )}
          <div className="flex items-center gap-0 text-muted-foreground">
            <Button
              className="p-2 hover:bg-surface-hover rounded transition-colors hover:text-foreground"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              className="p-2 hover:bg-surface-hover rounded transition-colors hover:text-foreground"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="hidden sm:block h-5 w-[1px] bg-surface-strong mx-1"></div>
          <div className="flex items-center gap-0 sm:gap-1 text-muted-foreground">
            <Button
              onClick={() => setIsCollaborateOpen(true)}
              className={`relative group p-2 rounded-lg transition-all duration-300`}
              title={
                sessionData
                  ? role === "host"
                    ? "Hosting Session"
                    : "Connected to Session"
                  : "Collaborate"
              }
            >
              {sessionData && (
                <>
                  <span
                    className={`absolute inset-1 rounded-lg animate-ping opacity-20 ${
                      role === "host" ? "bg-border-strong" : "bg-emerald-500"
                    }`}
                    style={{ animationDuration: "2s" }}
                  ></span>
                  <span className="absolute inset-0 rounded-lg"></span>
                </>
              )}
              <div className="relative p-2 hover:bg-surface-hover rounded transition-colors hover:text-foreground">
                <Users2
                  className={`w-[18px] h-[18px] transition-transform duration-300 ${
                    sessionData ? "drop-shadow-sm" : ""
                  }`}
                  strokeWidth={2}
                />
              </div>
            </Button>
          </div>

          <div className="hidden sm:block h-5 w-[1px] bg-surface-strong mx-1"></div>

          <div className="flex items-center gap-0 sm:gap-1">
            <ThemeToggle />
            <Button
              onClick={() => setIsAppOpen(true)}
              className="w-8 h-8 rounded-sm border border-transparent hover:bg-surface-hover hidden sm:flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              title="Mobile"
            >
              <Smartphone className="w-[18px] h-[18px]" strokeWidth={2} />
            </Button>
            <Button
              onClick={() => setIsHelpOpen(true)}
              className="w-8 h-8 rounded-sm border border-transparent hover:bg-surface-hover flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              title="Help"
            >
              <HelpCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            </Button>
            <Button
              onClick={() => setIsNotificationOpen(true)}
              className="w-8 h-8 rounded-sm border border-transparent hover:bg-surface-hover hidden items-center justify-center transition-colors text-muted-foreground hover:text-foreground relative sm:flex"
              title="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
              {sessionData?.joiners &&
                Object.values(sessionData.joiners).some(
                  (j) => j.status === "requested"
                ) &&
                role === "host" && (
                  <div className="absolute top-[6px] right-[7px] w-2 h-2 rounded-sm bg-[#3b82f6] border border-background"></div>
                )}
            </Button>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 rounded-sm border border-transparent hover:bg-surface-hover hidden sm:flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              title="Settings"
            >
              <div className="w-full h-full flex items-center justify-center">
                <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>
            </Button>
          </div>
        </div>
      </header>
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={onSettingsChange}
        dialogContainer={dialogContainer}
      />
      <CollaborateDilouge
        id={id}
        open={isCollaborateOpen}
        onOpenChange={setIsCollaborateOpen}
        nodes={nodes}
        edges={edges}
        sessionData={sessionData}
        role={role}
        onAcceptRequest={onAcceptRequest}
        onKickMember={onKickMember}
        onLeaveSession={onLeaveSession}
        onMerge={onMerge}
        dialogContainer={dialogContainer}
      />
      <NotificationDialog
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
        sessionData={sessionData}
        role={role}
        onAcceptRequest={onAcceptRequest}
        onKickMember={onKickMember}
        dialogContainer={dialogContainer}
      />
      <AppDialog
        open={isAppOpen}
        onOpenChange={setIsAppOpen}
        dialogContainer={dialogContainer}
      />
      <HelpDialog
        open={isHelpOpen}
        onOpenChange={setIsHelpOpen}
        dialogContainer={dialogContainer}
      />
    </>
  );
}
