import React, { useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users2,
  Crown,
  UserMinus,
  ShieldCheck,
  CircuitBoard,
  LogOut,
  X,
} from "lucide-react";

export default function UserDrawer({
  sessionData,
  role,
  currentUser,
  onKickMember,
  onLeaveSession,
}) {
  const members = useMemo(() => {
    if (!sessionData) return [];
    const list = [];
    const joinersMap = sessionData.joiners || {};

    Object.keys(joinersMap).forEach((uid) => {
      const m = joinersMap[uid];
      if (m.status === "joined") {
        list.push({
          id: uid,
          name: m.name || m.email || "Unknown",
          color: m.color,
          role: "Editor",
          isMe: currentUser?.id === uid,
          joinedAt: m.joinedAt,
        });
      }
    });

    const hostId = sessionData.host;
    if (!list.find((m) => m.id === hostId)) {
      list.unshift({
        id: hostId,
        name: currentUser?.id === hostId ? "You (Host)" : "Host",
        role: "Owner",
        color: null,
        isMe: currentUser?.id === hostId,
        joinedAt: sessionData.created_at,
      });
    } else {
      const m = list.find((m) => m.id === hostId);
      if (m) m.role = "Owner";
    }

    return list;
  }, [sessionData, currentUser]);

  if (!sessionData) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Drawer>
        <DrawerTrigger asChild>
          <div className="flex items-center -space-x-3 cursor-pointer hover:scale-105 transition-transform group">
            {members.slice(0, 3).map((member, i) => (
              <div
                key={member.id}
                className="relative w-10 h-10 rounded-full border-2 border-[#1e1e1e] bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300 shadow-lg z-[3-i]"
                style={
                  member.color
                    ? { backgroundColor: member.color, color: "#000" }
                    : {}
                }
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {members.length > 3 && (
              <div className="w-10 h-10 rounded-full border-2 border-[#1e1e1e] bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shadow-lg z-0">
                +{members.length - 3}
              </div>
            )}
            <div className="w-10 h-10 rounded-full border-2 border-[#1e1e1e] bg-zinc-900 flex items-center justify-center text-zinc-400 shadow-lg z-[10] group-hover:bg-zinc-800 transition-colors">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent className="bg-[#1e1e1e] border-zinc-800 text-zinc-100 max-w-sm mx-auto">
          <div className="w-full">
            <DrawerHeader className="border-b border-zinc-800 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-zinc-800/50 rounded-lg">
                    <CircuitBoard className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <DrawerTitle>Session Members</DrawerTitle>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {members.length} active users
                    </p>
                  </div>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="p-4 pl-0 pr-2">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-1">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold shadow-sm"
                            style={
                              member.color
                                ? {
                                    backgroundColor: member.color,
                                    color: "#000",
                                  }
                                : { color: "#a1a1aa" }
                            }
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          {member.role === "Owner" && (
                            <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
                              <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                            {member.name}
                            {member.isMe && (
                              <span className="text-xs text-zinc-500 font-normal">
                                (You)
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-zinc-500 capitalize flex items-center gap-1">
                            {member.role === "Owner" && (
                              <ShieldCheck className="w-3 h-3" />
                            )}
                            {member.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {role === "host" && !member.isMe && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onKickMember && onKickMember(member.id)
                            }
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-900/10"
                            title="Kick Member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                {role !== "host" && (
                  <Button
                    variant="destructive"
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50"
                    onClick={onLeaveSession}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Session
                  </Button>
                )}
                {role === "host" && (
                  <p className="text-[10px] text-zinc-600 text-center">
                    As host, you can remove members by hovering over them.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
