import {
  LayoutDashboard,
  GitBranch,
  Database,
  Activity,
  Settings,
  ShieldCheck,
  Users,
  Settings2,
  Link,
  BarChart3,
  Sliders,
  CheckSquare,
  Flag,
  Target,
  LucideSquareChevronRight,
  Key,
  LucideMousePointer2,
  Calendar,
} from "lucide-react";

export const projectNav = [
  { title: "Overview", icon: LayoutDashboard },
  { title: "Issues", icon: GitBranch },
  { title: "Tasks", icon: CheckSquare },
  { title: "Projections", icon: LucideSquareChevronRight },
  { title: "Milestones", icon: Flag, badge: "3" },
  { title: "Goals", icon: Target },
  { title: "Objectives", icon: Database },
  { title: "Logs", icon: Activity },
  { title: "Team", icon: Users, badge: "7" },
  { title: "Vault", icon: Key },
  { title: "Security", icon: ShieldCheck },
  { title: "Settings", icon: Settings, hasSubmenu: true },
];

export const settingsNav = [
  { title: "General", icon: Settings2 },
  { title: "Connectivity", icon: Link },
  { title: "Usage", icon: BarChart3 },
  { title: "Advanced", icon: Sliders },
  { title: "Enterprise", icon: LucideMousePointer2 },
];
