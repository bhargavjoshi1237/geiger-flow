import {
  LayoutDashboard,
  GitBranch,
  Database,
  Activity,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
  Settings2,
  BarChart3,
  Sliders,
  CheckSquare,
  BriefcaseBusiness,
  SlidersHorizontal,
  Flag,
  LucideFileImage,
  Target,
  LucideSquareChevronRight,
  Key,
  LucideMousePointer2,
  Calendar,
  LucidePlus,
  LucidePackagePlus,
  Waypoints,
  Radio,
  Link2,
  ExternalLink,
  FileText,
  FolderOpen,
  Clock,
  PanelLeft,
} from "lucide-react";

export const projectNav = [
  { title: "Overview", icon: LayoutDashboard },
  { title: "Issues", icon: GitBranch },
  { title: "Tasks", icon: CheckSquare },
  { title: "Work Queue", icon: BriefcaseBusiness },
  { title: "Grounding", icon: Radio },
  { title: "Planning", icon: Waypoints },
  { title: "Projections", icon: LucideSquareChevronRight },
  { title: "Milestones", icon: Flag, badge: "3" },
  { title: "Goals", icon: Target },
  { title: "Reporting", icon: BarChart3 },
  { title: "Objectives", icon: Database },
  { title: "Assets", icon: LucideFileImage },
  {
    title: "Office",
    icon: FileText,
    subItems: [
      { title: "Recent Files", icon: Clock },
      { title: "Folders", icon: FolderOpen },
      { title: "Shared with Project", icon: Users },
    ],
  },
  { title: "Logs", icon: Activity },
  { title: "Team", icon: Users, badge: "7" },
  { title: "Resource Allocation", icon: UsersRound },
  { title: "Vault", icon: Key },
  { title: "Externals", icon: ExternalLink },
  { title: "Security", icon: ShieldCheck },
  { title: "Settings", icon: Settings, hasSubmenu: true },
];

export const settingsNav = [
  { title: "General", icon: Settings2 },
  { title: "Connections", icon: Link2 },
  { title: "Customs", icon: SlidersHorizontal },
  // Personal sidebar curation. Locked in geiger-ui.config.js — it is the screen
  // that unhides everything else.
  { title: "Navigation", icon: PanelLeft },
  { title: "Add-ons", icon: LucidePackagePlus },
  { title: "Usage", icon: BarChart3 },
  { title: "Advanced", icon: Sliders },
  { title: "Enterprise", icon: LucideMousePointer2 },
];

// The project nav as a single tree, with the Settings submenu attached as real
// `subItems`. The sidebar keeps the two apart (Settings is `hasSubmenu` and
// pulls settingsNav at render time), but @geiger/ui's visibility resolver
// reasons over one tree — it needs the parent/child edge to know that hiding
// Settings hides what lives under it.
export function curatableProjectNav(baseNav = projectNav) {
  return baseNav.map((item) =>
    item.hasSubmenu && item.title === "Settings"
      ? { ...item, subItems: settingsNav }
      : item,
  );
}
