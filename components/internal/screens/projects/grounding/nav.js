import {
  MessageSquare,
  Hash,
  Users,
  Phone,
  Paperclip,
  Inbox,
  Settings,
} from "lucide-react";

// The chat workspace's own navigation, rendered as a secondary rail inside the
// Grounding screen. Titles are the keys of SCREENS in ./screens/index.js — keep
// the two in sync.
export const CHAT_NAV = [
  { title: "Messages", icon: MessageSquare },
  { title: "Channels", icon: Hash },
  { title: "Contacts", icon: Users },
  { title: "Calls", icon: Phone },
  { title: "Files", icon: Paperclip },
  { title: "Inbox", icon: Inbox },
  { title: "Settings", icon: Settings },
];

export const DEFAULT_CHAT_TAB = CHAT_NAV[0].title;

// The chat tab lives in the URL alongside Flow's own screen param, as
// ?Grounding&chat=<tab>, so a refresh or a deep link reopens the same screen.
export const CHAT_TAB_PARAM = "chat";
