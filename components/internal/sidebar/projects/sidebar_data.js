import {
  LayoutDashboard,
  GitBranch,
  Database,
  Activity,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const projectNav = [
  { title: "Overview", icon: LayoutDashboard },
  { title: "Issues", icon: GitBranch },
  { title: "Objectives", icon: Database },
  { title: "Milestones", icon: Activity, badge: "Live" },
  { title: "Team", icon: Users, badge: "7" },
  { title: "Security", icon: ShieldCheck },
  { title: "Settings", icon: Settings },
];
