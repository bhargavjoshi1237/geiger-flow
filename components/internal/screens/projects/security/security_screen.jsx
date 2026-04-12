"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProject } from "@/context/project-context";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
  Scan,
  Globe,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Copy,
  User,
  Users,
  Monitor,
  Smartphone,
  Terminal,
  FileWarning,
  Bug,
  Wifi,
  WifiOff,
  Ban,
  TriangleAlert,
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const securityEventsTimeline = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  threats: Math.floor(Math.random() * 5),
  blocked: Math.floor(Math.random() * 8) + 2,
  resolved: Math.floor(4 + Math.random() * 6),
}));

const authAttempts = Array.from({ length: 7 }, (_, i) => {
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    day: names[i],
    successful: Math.floor(40 + Math.random() * 30),
    failed: Math.floor(2 + Math.random() * 8),
  };
});

const recentAuthEvents = [
  {
    user: "Sarah Chen",
    action: "Logged in",
    method: "SSO",
    ip: "192.168.1.42",
    location: "San Francisco, US",
    time: "2 min ago",
    status: "success",
    device: "Chrome / macOS",
  },
  {
    user: "James Rivera",
    action: "API key created",
    method: "MFA",
    ip: "10.0.0.118",
    location: "New York, US",
    time: "15 min ago",
    status: "success",
    device: "CLI / Linux",
  },
  {
    user: "Unknown",
    action: "Login failed",
    method: "Password",
    ip: "203.45.67.89",
    location: "Lagos, NG",
    time: "32 min ago",
    status: "blocked",
    device: "Firefox / Windows",
  },
  {
    user: "Aiko Tanaka",
    action: "Logged in",
    method: "SSO",
    ip: "172.16.0.55",
    location: "Tokyo, JP",
    time: "1 hr ago",
    status: "success",
    device: "Safari / iOS",
  },
  {
    user: "Marcus Brown",
    action: "Password changed",
    method: "MFA",
    ip: "192.168.1.87",
    location: "London, UK",
    time: "2 hrs ago",
    status: "success",
    device: "Edge / Windows",
  },
  {
    user: "Unknown",
    action: "Brute force attempt",
    method: "Password",
    ip: "185.220.101.33",
    location: "Berlin, DE",
    time: "3 hrs ago",
    status: "blocked",
    device: "Unknown",
  },
];

const vulnerabilities = [
  {
    id: "VUL-0042",
    title: "Outdated dependency: lodash@4.17.19",
    severity: "high",
    package: "lodash",
    status: "open",
    found: "2 days ago",
  },
  {
    id: "VUL-0039",
    title: "CORS misconfiguration on /api/v2/*",
    severity: "medium",
    package: "API Layer",
    status: "fixing",
    found: "5 days ago",
  },
  {
    id: "VUL-0037",
    title: "Missing Content-Security-Policy header",
    severity: "medium",
    package: "Server Config",
    status: "resolved",
    found: "1 week ago",
  },
  {
    id: "VUL-0035",
    title: "Weak hashing algorithm for session tokens",
    severity: "low",
    package: "Auth Module",
    status: "resolved",
    found: "2 weeks ago",
  },
  {
    id: "VUL-0031",
    title: "SQL injection risk in search endpoint",
    severity: "critical",
    package: "API Layer",
    status: "resolved",
    found: "3 weeks ago",
  },
];

const securityPolicies = [
  {
    name: "Two-Factor Authentication",
    description: "Require MFA for all team members",
    enabled: true,
    enforced: true,
  },
  {
    name: "Session Timeout",
    description: "Auto-logout after inactivity",
    enabled: true,
    enforced: false,
  },
  {
    name: "IP Allowlisting",
    description: "Restrict access to trusted IPs",
    enabled: false,
    enforced: false,
  },
  {
    name: "SSO Only Mode",
    description: "Disable password-based login",
    enabled: false,
    enforced: false,
  },
  {
    name: "Branch Protection",
    description: "Require approval before merge",
    enabled: true,
    enforced: true,
  },
];

const apiKeys = [
  {
    name: "Production API",
    key: "gpr_live_a4f8...x2k1",
    created: "Jan 15, 2026",
    lastUsed: "2 min ago",
    scopes: ["read", "write"],
    status: "active",
  },
  {
    name: "CI/CD Pipeline",
    key: "gpr_ci_b7e2...m9p4",
    created: "Feb 3, 2026",
    lastUsed: "15 min ago",
    scopes: ["read", "write", "deploy"],
    status: "active",
  },
  {
    name: "Staging Environment",
    key: "gpr_stg_d3c6...q1w8",
    created: "Mar 8, 2026",
    lastUsed: "3 days ago",
    scopes: ["read"],
    status: "active",
  },
  {
    name: "Old Integration",
    key: "gpr_old_f1a9...z5t3",
    created: "Nov 20, 2025",
    lastUsed: "45 days ago",
    scopes: ["read"],
    status: "inactive",
  },
];

function SecurityScoreRing({ score, label }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = "#e7e7e7";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="6"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-[9px] text-[#737373] uppercase tracking-wider font-medium">
            of 100
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center border"
          style={{
            backgroundColor: `${color}12`,
            borderColor: `${color}20`,
            color: color,
          }}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.7} />
        </div>
        <span className="text-[13px] font-medium text-[#a3a3a3]">
          {label}
        </span>
      </div>
      <div className="text-[22px] font-semibold text-white tracking-tight">
        {value}
      </div>
      {sub && <p className="text-[11px] text-[#737373] mt-1.5">{sub}</p>}
    </div>
  );
}

function SecurityEventRow({ event }) {
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: "text-[#e7e7e7]",
      bg: "bg-[#e7e7e7]/10",
      border: "border-[#e7e7e7]/20",
      label: "Success",
    },
    blocked: {
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
      label: "Blocked",
    },
  };
  const cfg = statusConfig[event.status] || statusConfig.success;
  const StatusIcon = cfg.icon;

  return (
    <div className="flex items-center gap-3.5 py-3 px-5 border-b border-[#2a2a2a] last:border-0 hover:bg-[#242424] transition-colors">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
          cfg.bg,
          cfg.border
        )}
      >
        <StatusIcon className={cn("w-3.5 h-3.5", cfg.color)} />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[1.5fr_80px_110px_110px_80px] gap-1 md:gap-4 items-center">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-white truncate">
            <span className={event.user === "Unknown" ? "text-red-400" : ""}>
              {event.user}
            </span>
            <span className="text-[#737373] mx-1.5">·</span>
            <span className="text-[#a3a3a3] font-normal">
              {event.action}
            </span>
          </div>
          <div className="text-[11px] text-[#737373] truncate">
            {event.device}
          </div>
        </div>
        <div className="text-[11px] text-[#737373] font-medium">{event.method}</div>
        <div className="text-[11px] text-[#737373] font-mono truncate">
          {event.ip}
        </div>
        <div className="text-[11px] text-[#737373] truncate">
          {event.location}
        </div>
        <div className="text-[11px] text-[#737373]">{event.time}</div>
      </div>
      <Badge
        className={cn(
          "text-[10px] h-[20px] px-2 shrink-0 ml-1",
          cfg.bg,
          cfg.color,
          cfg.border,
          "border rounded-md"
        )}
      >
        {cfg.label}
      </Badge>
    </div>
  );
}

function VulnerabilityRow({ vuln }) {
  const severityConfig = {
    critical: {
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
    },
    high: {
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20",
    },
    medium: {
      color: "text-[#e7e7e7]",
      bg: "bg-[#e7e7e7]/10",
      border: "border-[#e7e7e7]/20",
    },
    low: {
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
  };
  const cfg = severityConfig[vuln.severity] || severityConfig.low;

  const statusConfig = {
    open: { label: "Open", className: "bg-[#2a2a2a] text-[#a3a3a3] border-[#474747]" },
    fixing: {
      label: "Fixing",
      className: "bg-[#e7e7e7]/10 text-[#e7e7e7] border-[#e7e7e7]/20",
    },
    resolved: {
      label: "Resolved",
      className: "bg-white/10 text-white border-white/20",
    },
  };
  const statusCfg = statusConfig[vuln.status] || statusConfig.open;

  return (
    <div className="flex items-center gap-3.5 py-3.5 px-5 border-b border-[#2a2a2a] last:border-0 hover:bg-[#242424] transition-colors">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
          cfg.bg,
          cfg.border
        )}
      >
        <Bug className={cn("w-3.5 h-3.5", cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white truncate">
          {vuln.title}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-[#737373] font-mono">
            {vuln.id}
          </span>
          <span className="text-[10px] text-[#737373]">·</span>
          <span className="text-[10px] text-[#737373]">{vuln.package}</span>
          <span className="text-[10px] text-[#737373]">·</span>
          <span className="text-[10px] text-[#737373]">{vuln.found}</span>
        </div>
      </div>
      <Badge
        className={cn(
          "text-[10px] h-[20px] px-2 shrink-0 rounded-md",
          cfg.bg,
          cfg.color,
          cfg.border,
          "border"
        )}
      >
        {vuln.severity}
      </Badge>
      <Badge
        className={cn("text-[10px] h-[20px] px-2 shrink-0 border rounded-md", statusCfg.className)}
      >
        {statusCfg.label}
      </Badge>
    </div>
  );
}

function PolicyRow({ policy }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-5 border-b border-[#2a2a2a] last:border-0 hover:bg-[#242424] transition-colors">
      <div className="flex items-center gap-3.5">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
          policy.enabled
            ? "bg-[#e7e7e7]/10 border-[#e7e7e7]/15 text-[#e7e7e7]"
            : "bg-[#2a2a2a] border-[#2a2a2a] text-[#737373]"
        )}>
          <Shield
            className="w-4 h-4"
            strokeWidth={1.7}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-white">
              {policy.name}
            </span>
            {policy.enforced && (
              <Badge className="text-[9px] h-[18px] px-1.5 bg-[#e7e7e7]/10 text-[#e7e7e7] border-[#e7e7e7]/20">
                Enforced
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-[#737373] mt-0.5">
            {policy.description}
          </p>
        </div>
      </div>
      <Switch checked={policy.enabled} />
    </div>
  );
}

function ApiKeyRow({ apiKey }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5 px-5 border-b border-[#2a2a2a] last:border-0 hover:bg-[#242424] transition-colors">
      <div className="w-9 h-9 rounded-lg bg-[#2a2a2a] border border-[#2a2a2a] flex items-center justify-center shrink-0">
        <Key className="w-4 h-4 text-[#a3a3a3]" strokeWidth={1.7} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white">
          {apiKey.name}
        </div>
        <div className="text-[11px] text-[#737373] font-mono mt-0.5">
          {apiKey.key}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-1.5">
        {apiKey.scopes.map((scope) => (
          <Badge
            key={scope}
            className="text-[10px] h-[18px] px-1.5 bg-[#2a2a2a] text-[#737373] border-[#2a2a2a] rounded-md"
          >
            {scope}
          </Badge>
        ))}
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="text-[10px] text-[#737373]">Last used</div>
        <div className="text-[11px] text-[#a3a3a3]">{apiKey.lastUsed}</div>
      </div>
      <Badge
        className={cn(
          "text-[10px] h-[20px] px-2 shrink-0 border rounded-md",
          apiKey.status === "active"
            ? "bg-[#e7e7e7]/10 text-[#e7e7e7] border-[#e7e7e7]/20"
            : "bg-[#2a2a2a] text-[#737373] border-[#2a2a2a]"
        )}
      >
        {apiKey.status}
      </Badge>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-[13px] text-[#a3a3a3] leading-relaxed">{subtitle}</p>
    </div>
  );
}

export function SecurityScreen() {
  const { project } = useProject();

  const criticalVulns = vulnerabilities.filter((v) => v.severity === "critical")
    .length;
  const openVulns = vulnerabilities.filter((v) => v.status === "open").length;
  const activeKeys = apiKeys.filter((k) => k.status === "active").length;

  return (
    <MainScreenWrapper>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Security</h1>
            <p className="text-[#a3a3a3] mt-1">
             Monitor Security and secure access to your project.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
        

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={ShieldCheck}
              label="Policies Active"
              value="3 / 5"
              sub="60% policy coverage"
              color="#e7e7e7"
            />
            <StatCard
              icon={Bug}
              label="Vulnerabilities"
              value={vulnerabilities.length}
              sub={`${openVulns} open · ${criticalVulns} critical`}
              color="#e7e7e7"
            />
            <StatCard
              icon={Key}
              label="API Keys"
              value={activeKeys}
              sub={`${apiKeys.length} total · 1 inactive`}
              color="#e7e7e7"
            />
            <StatCard
              icon={Users}
              label="Active Sessions"
              value="8"
              sub="Across 5 team members"
              color="#e7e7e7"
            />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#e7e7e7]/10 border border-[#e7e7e7]/15 text-[#e7e7e7] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.7} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[14px] font-semibold text-white">
                  Security Status: Healthy
                </span>
                <Badge className="text-[9px] h-[18px] px-1.5 bg-[#e7e7e7]/10 text-[#e7e7e7] border-[#e7e7e7]/20">
                  LIVE
                </Badge>
              </div>
              <p className="text-[12px] text-[#a3a3a3] leading-relaxed mb-4">
                Your project meets{" "}
                <span className="text-[#e7e7e7] font-semibold">
                  12 of 15
                </span>{" "}
                security benchmarks. {openVulns} open vulnerabilities require attention. Last threat blocked{" "}
                <span className="text-[#a3a3a3] font-medium">32 min ago</span>.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e7e7e7] to-[#ffffff] rounded-full transition-all"
                    style={{ width: "80%" }}
                  />
                </div>
                <span className="text-[11px] text-[#a3a3a3] font-medium whitespace-nowrap">
                  12/15
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader
            title="Security Posture"
            subtitle="Detailed breakdown of your project's security posture across key areas."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 pb-6 flex-shrink-0 hover:border-[#474747] transition-colors">
              <div className="text-center mb-2">
                <div className="text-[12px] font-medium text-[#a3a3a3] mb-0.5">
                  Authentication
                </div>
                <div className="text-[10px] text-[#737373]">
                  2FA · SSO · Tokens
                </div>
              </div>
              <SecurityScoreRing score={90} label="Auth" />
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 pb-6 flex-shrink-0 hover:border-[#474747] transition-colors">
              <div className="text-center mb-2">
                <div className="text-[12px] font-medium text-[#a3a3a3] mb-0.5">
                  Authorization
                </div>
                <div className="text-[10px] text-[#737373]">
                  RBAC · Policies
                </div>
              </div>
              <SecurityScoreRing score={75} label="Access" />
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 pb-6 flex-shrink-0 hover:border-[#474747] transition-colors">
              <div className="text-center mb-2">
                <div className="text-[12px] font-medium text-[#a3a3a3] mb-0.5">
                  Data Protection
                </div>
                <div className="text-[10px] text-[#737373]">
                  AES · TLS · Masking
                </div>
              </div>
              <SecurityScoreRing score={85} label="Encrypt" />
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 pb-6 flex-shrink-0 hover:border-[#474747] transition-colors">
              <div className="text-center mb-2">
                <div className="text-[12px] font-medium text-[#a3a3a3] mb-0.5">
                  Infrastructure
                </div>
                <div className="text-[10px] text-[#737373]">
                  WAF · CDN · Firewall
                </div>
              </div>
              <SecurityScoreRing score={68} label="Network" />
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 pb-6 flex-shrink-0 hover:border-[#474747] transition-colors">
              <div className="text-center mb-2">
                <div className="text-[12px] font-medium text-[#a3a3a3] mb-0.5">
                  App Security
                </div>
                <div className="text-[10px] text-[#737373]">
                  CSP · CORS · Headers
                </div>
              </div>
              <SecurityScoreRing score={72} label="Hardening" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader
            title="Recent Auth Events"
            subtitle="Latest authentication events and access activity across the project."
          />
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
              <span className="text-[11px] text-[#737373] uppercase tracking-wider font-medium">
                Event Log
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] text-[#737373] hover:text-[#a3a3a3] h-7"
              >
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="divide-y-0">
              {recentAuthEvents.map((event, i) => (
                <SecurityEventRow key={i} event={event} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader
            title="Vulnerabilities"
            subtitle={`Found ${vulnerabilities.length} vulnerabilities — ${openVulns} still open, ${vulnerabilities.filter((v) => v.status === "fixing").length} being fixed.`}
          />
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
              <span className="text-[11px] text-[#737373] uppercase tracking-wider font-medium">
                Vulnerability Report
              </span>
              <div className="flex items-center gap-3">
                {openVulns > 0 && (
                  <Badge className="text-[10px] h-[20px] px-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                    {openVulns} Open
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[11px] text-[#737373] hover:text-[#a3a3a3] h-7"
                >
                  Export
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="divide-y-0">
              {vulnerabilities.map((vuln) => (
                <VulnerabilityRow key={vuln.id} vuln={vuln} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader
            title="Security Policies"
            subtitle="Configure authentication, access control, and protection policies."
          />
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2a2a2a]">
              <span className="text-[11px] text-[#737373] uppercase tracking-wider font-medium">
                Active Policies
              </span>
            </div>
            {securityPolicies.map((policy) => (
              <PolicyRow key={policy.name} policy={policy} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader
            title="API Keys & Tokens"
            subtitle={`Manage API keys with access to your project. ${activeKeys} active, 1 inactive.`}
          />
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
              <span className="text-[11px] text-[#737373] uppercase tracking-wider font-medium">
                Keys
              </span>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-[11px] rounded-md"
              >
                + Create Key
              </Button>
            </div>
            <div className="divide-y-0">
              {apiKeys.map((apiKey) => (
                <ApiKeyRow key={apiKey.name} apiKey={apiKey} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader
            title="Compliance & Encryption"
            subtitle="Overview of data protection standards and encryption status."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#e7e7e7]/10 border border-[#e7e7e7]/15 text-[#e7e7e7] flex items-center justify-center">
                  <Lock className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-[#a3a3a3]">
                    Encryption at Rest
                  </span>
                </div>
              </div>
              <div className="text-[15px] font-semibold text-white mb-1">
                AES-256
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[11px] text-[#e7e7e7]">Active</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
                <div className="text-[10px] text-[#737373]">
                  Last key rotation: 14 days ago
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#e7e7e7]/10 border border-[#e7e7e7]/15 text-[#e7e7e7] flex items-center justify-center">
                  <Globe className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-[#a3a3a3]">
                    TLS / SSL
                  </span>
                </div>
              </div>
              <div className="text-[15px] font-semibold text-white mb-1">
                TLS 1.3
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[11px] text-[#e7e7e7]">Active</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
                <div className="text-[10px] text-[#737373]">
                  Certificate expires: Aug 15, 2026
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#e7e7e7]/10 border border-[#e7e7e7]/15 text-[#e7e7e7] flex items-center justify-center">
                  <Fingerprint className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-[#a3a3a3]">
                    Data Masking
                  </span>
                </div>
              </div>
              <div className="text-[15px] font-semibold text-white mb-1">
                Partial
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#e7e7e7]" />
                <span className="text-[11px] text-[#e7e7e7]">Needs Configuration</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
                <div className="text-[10px] text-[#737373]">
                  3 of 7 sensitive fields masked
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#e7e7e7]/10 border border-[#e7e7e7]/15 text-[#e7e7e7] flex items-center justify-center">
                  <Scan className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-[#a3a3a3]">
                    SOC 2 Compliance
                  </span>
                </div>
              </div>
              <div className="text-[15px] font-semibold text-white mb-1">
                Type II
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[11px] text-[#e7e7e7]">Compliant</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
                <div className="text-[10px] text-[#737373]">
                  Next audit: Sep 2026
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#e7e7e7]/10 border border-[#e7e7e7]/15 text-[#e7e7e7] flex items-center justify-center">
                  <Shield className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-[#a3a3a3]">
                    GDPR
                  </span>
                </div>
              </div>
              <div className="text-[15px] font-semibold text-white mb-1">
                Compliant
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[11px] text-[#e7e7e7]">Active</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
                <div className="text-[10px] text-[#737373]">
                  DPIA completed: Jan 2026
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#2a2a2a] border border-[#2a2a2a] text-[#a3a3a3] flex items-center justify-center">
                  <Activity className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-[#a3a3a3]">
                    Audit Logging
                  </span>
                </div>
              </div>
              <div className="text-[15px] font-semibold text-white mb-1">
                90-Day Retention
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a3a3a3]" />
                <span className="text-[11px] text-[#a3a3a3]">Logging Active</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
                <div className="text-[10px] text-[#737373]">
                  12,847 events this month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
