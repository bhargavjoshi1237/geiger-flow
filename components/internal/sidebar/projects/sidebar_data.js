import {
  LayoutDashboard,
  GitBranch,
  Database,
  Activity,
  Settings,
  ShieldCheck,
  Users,
  Settings2,
  Network,
  BarChart,
  Cpu,
} from "lucide-react";

export const projectNav = [
  { title: "Overview", icon: LayoutDashboard },
  { title: "Issues", icon: GitBranch },
  { title: "Objectives", icon: Database },
  { title: "Milestones", icon: Activity, badge: "Live" },
  { title: "Team", icon: Users, badge: "7" },
  { title: "Security", icon: ShieldCheck },
  { title: "Settings", icon: Settings, hasSubmenu: true },
];

export const settingsNav = [
  { title: "General", icon: Settings2 },
  { title: "Security", icon: ShieldCheck },
  { title: "Connectivity", icon: Network },
  { title: "Usage", icon: BarChart },
  { title: "Advanced", icon: Cpu },
];
