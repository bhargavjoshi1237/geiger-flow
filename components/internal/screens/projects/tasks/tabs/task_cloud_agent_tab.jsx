"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Cloud,
  CloudOff,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Check,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Terminal,
  Sparkles,
  Eye,
  ShieldCheck,
  Zap,
  Bug,
  Rocket,
  Layers,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Code2,
  Eye as EyeIcon,
} from "lucide-react";

/* ── Preset agent profiles ────────────────────────────────────────────────── */
const PRESET_PROFILES = [
  { id: "code_review", label: "Code Review", icon: EyeIcon, desc: "Reviews code & suggests improvements", caps: { canReview: true, canTest: true } },
  { id: "bug_fixer", label: "Bug Fixer", icon: Bug, desc: "Debugs & submits targeted fixes", caps: { canReview: true, canTest: true, canCommit: true, canPR: true, canBranch: true } },
  { id: "feature_builder", label: "Feature Builder", icon: Rocket, desc: "Builds & ships features end-to-end", caps: { canReview: true, canTest: true, canCommit: true, canPR: true, canBranch: true } },
  { id: "devops", label: "DevOps", icon: Layers, desc: "CI/CD, deployments & infrastructure", caps: { canTest: true, canCommit: true, canPR: true, canBranch: true, canDeploy: true, canFork: true, canMerge: true } },
];

const CAP_LABELS = [
  { key: "canBranch", label: "Branch" },
  { key: "canCommit", label: "Commit" },
  { key: "canTest", label: "Test" },
  { key: "canReview", label: "Review" },
  { key: "canPR", label: "PR" },
  { key: "canMerge", label: "Merge" },
  { key: "canFork", label: "Fork" },
  { key: "canDeploy", label: "Deploy" },
];

const ENVS = [
  { value: "standard", label: "Standard", sub: "2 vCPU / 4GB" },
  { value: "performance", label: "Performance", sub: "4 vCPU / 8GB" },
  { value: "enterprise", label: "Enterprise", sub: "8 vCPU / 16GB" },
  { value: "gpu", label: "GPU (T4)", sub: "GPU-accelerated" },
];

const PIPELINE_STEPS = [
  { id: "clone", label: "Clone", icon: GitBranch },
  { id: "branch", label: "Branch", icon: GitBranch },
  { id: "analyze", label: "Analyze", icon: Terminal },
  { id: "implement", label: "Implement", icon: Code2 },
  { id: "test", label: "Test", icon: Terminal },
  { id: "commit", label: "Commit", icon: GitCommitHorizontal },
  { id: "pr", label: "Pull Request", icon: GitPullRequest },
];

const CAP_ICONS = {
  canBranch: GitBranch,
  canCommit: GitCommitHorizontal,
  canTest: Terminal,
  canReview: EyeIcon,
  canPR: GitPullRequest,
  canMerge: Loader2,
  canFork: GitBranch,
  canDeploy: Zap,
};

/* ── Component ────────────────────────────────────────────────────────────── */
export function TaskCloudAgentTab({ formData, handleInputChange }) {
  const [showToken, setShowToken] = useState(false);
  const [execOpen, setExecOpen] = useState(false);
  const [newProfileOpen, setNewProfileOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCaps, setNewCaps] = useState(() =>
    Object.fromEntries(CAP_LABELS.map((c) => [c.key, false])),
  );

  const on = formData.agentEnabled;

  /* profile helpers */
  const isActive = (id) => (formData.agentProfiles || []).includes(id);
  const toggleProfile = (id) => {
    const cur = formData.agentProfiles || [];
    handleInputChange("agentProfiles", cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]);
  };
  const applyCaps = (profile) =>
    CAP_LABELS.forEach((c) => handleInputChange(c.key, !!profile.caps?.[c.key]));

  const allProfiles = [...PRESET_PROFILES, ...(formData.agentCustomProfiles || [])];

  const handleCreateProfile = () => {
    if (!newName.trim()) return;
    const entry = { id: `custom_${Date.now()}`, label: newName.trim(), icon: Sparkles, desc: "Custom profile", caps: { ...newCaps } };
    handleInputChange("agentCustomProfiles", [...(formData.agentCustomProfiles || []), entry]);
    toggleProfile(entry.id);
    setNewProfileOpen(false);
    setNewName("");
    setNewCaps(Object.fromEntries(CAP_LABELS.map((c) => [c.key, false])));
  };

  return (
    <div className="space-y-2.5">
      {/* ── Toggle ── */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${on ? "bg-blue-500/20 text-blue-400" : "bg-[#202020] text-zinc-500"}`}>
            {on ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-[13px] font-medium text-white">Cloud Agent</p>
            <p className="text-[11px] text-[#737373]">LLM-powered agent to resolve this task &amp; create a PR</p>
          </div>
        </div>
        <Switch checked={on} onCheckedChange={(v) => handleInputChange("agentEnabled", v)} />
      </div>

      {!on && (
        <div className="text-center py-6 text-[#737373]">
          <CloudOff className="w-7 h-7 mx-auto mb-1.5 opacity-30" />
          <p className="text-[11px]">Enable to configure a cloud agent for this task</p>
        </div>
      )}

      {on && (
        <>
          {/* ── Provider · Environment ── */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-[#737373] uppercase tracking-wide">Provider</Label>
              <Select value={formData.agentProvider} onValueChange={(v) => handleInputChange("agentProvider", v)}>
                <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
                  <SelectItem value="codex" className="focus:bg-[#2a2a2a] text-xs">OpenAI Codex</SelectItem>
                  <SelectItem value="anthropic" className="focus:bg-[#2a2a2a] text-xs">Anthropic Claude</SelectItem>
                  <SelectItem value="gemini" className="focus:bg-[#2a2a2a] text-xs">Google Gemini</SelectItem>
                  <SelectItem value="local" className="focus:bg-[#2a2a2a] text-xs">Self-Hosted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-[#737373] uppercase tracking-wide">Environment</Label>
              <Select value={formData.agentEnvironment} onValueChange={(v) => handleInputChange("agentEnvironment", v)}>
                <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
                  {ENVS.map((e) => (
                    <SelectItem key={e.value} value={e.value} className="focus:bg-[#2a2a2a] text-xs">
                      <span className="flex items-center gap-2">
                        <span>{e.label}</span>
                        <span className="text-[#737373]">· {e.sub}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-[#737373] uppercase tracking-wide">System Prompt</Label>
            <Textarea
              value={formData.agentSystemPrompt}
              onChange={(e) => handleInputChange("agentSystemPrompt", e.target.value)}
              placeholder="You are a senior engineer. Solve this task and open a PR with the solution."
              className="bg-[#202020] border-[#333333] text-white text-xs min-h-[56px] resize-none placeholder:text-[#474747]"
            />
          </div>

          {/* ── Agent Profiling ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-[#737373] uppercase tracking-wide">Agent Profiling</Label>
              <button type="button" className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-white transition-colors" onClick={() => setNewProfileOpen(!newProfileOpen)}>
                <Plus className="w-3 h-3" />
                New Profile
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {allProfiles.map((p) => {
                const Icon = p.icon;
                const active = isActive(p.id);
                return (
                  <TooltipProvider key={p.id} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => { toggleProfile(p.id); if (!active) applyCaps(p); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                            active
                              ? "bg-[#242424] border-[#474747] text-[#e5e5e5]"
                              : "bg-[#202020] border-[#2a2a2a] text-[#737373] hover:border-[#474747] hover:text-[#a3a3a3]"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {p.label}
                          {active && <Check className="w-2.5 h-2.5 ml-0.5 text-emerald-400" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px] max-w-[200px] bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
                        <p className="mb-1">{p.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {CAP_LABELS.map((c) =>
                            (p.caps || {})[c.key] ? (
                              <span key={c.key} className="text-[9px] px-1.5 py-0.5 rounded bg-[#242424] text-emerald-400 border border-[#2a2a2a]">
                                {c.label}
                              </span>
                            ) : null,
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Create New Profile */}
            {newProfileOpen && (
              <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] p-2.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Profile name (e.g. Security Audit)"
                    className="bg-[#202020] border-[#2a2a2a] text-white h-7 text-xs placeholder:text-[#474747] flex-1"
                    autoFocus
                  />
                  <Button type="button" size="sm" className="h-7 bg-white text-black hover:bg-[#e5e5e5] text-[11px] px-2.5 font-medium" onClick={handleCreateProfile} disabled={!newName.trim()}>
                    Save
                  </Button>
                  <button type="button" className="h-7 w-7 flex items-center justify-center text-[#737373] hover:text-white transition-colors" onClick={() => setNewProfileOpen(false)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {CAP_LABELS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setNewCaps((prev) => ({ ...prev, [c.key]: !prev[c.key] }))}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium transition-all ${
                        newCaps[c.key]
                          ? "bg-[#242424] border-[#474747] text-[#e5e5e5]"
                          : "bg-[#202020] border-[#2a2a2a] text-[#737373] hover:border-[#474747]"
                      }`}
                    >
                      {newCaps[c.key] && <Check className="w-2.5 h-2.5" />}
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Execution (collapsible) ── */}
          <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
            {/* header */}
            <button
              type="button"
              onClick={() => setExecOpen(!execOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#202020]/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${formData.agentRunning ? "bg-emerald-400 animate-pulse" : "bg-[#474747]"}`} />
                <span className="text-[13px] font-medium text-[#e5e5e5]">Execution</span>
                {formData.agentRunning && (
                  <span className="text-[10px] text-emerald-400 font-mono ml-1">LIVE</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!execOpen && formData.agentRunning && (
                  <span className="text-[10px] text-[#737373] font-mono">3/7</span>
                )}
                {execOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#737373]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />}
              </div>
            </button>

            {execOpen && (
              <div className="px-3 pb-3 space-y-3">
                {/* ── Pipeline visual ── */}
                <div className="flex items-center gap-0.5 overflow-x-auto py-1">
                  {PIPELINE_STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    /* mock status distribution */
                    const done = formData.agentRunning && i < 2;
                    const active = formData.agentRunning && i === 2;
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md shrink-0">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${
                            done ? "bg-emerald-500/20" : active ? "bg-blue-500/20" : "bg-[#202020]"
                          }`}>
                            {done ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : active ? (
                              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                            ) : (
                              <StepIcon className="w-2.5 h-2.5 text-[#474747]" />
                            )}
                          </div>
                          <span className={`text-[10px] font-medium whitespace-nowrap ${
                            done ? "text-emerald-400" : active ? "text-blue-400" : "text-[#474747]"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {i < PIPELINE_STEPS.length - 1 && (
                          <div className={`w-4 h-px shrink-0 ${done ? "bg-emerald-500/40" : "bg-[#2a2a2a]"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* ── Controls row ── */}
                <div className="flex items-center gap-1.5">
                  {!formData.agentRunning ? (
                    <button
                      type="button"
                      onClick={() => handleInputChange("agentRunning", true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-[11px] font-medium hover:bg-[#e5e5e5] transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Run
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInputChange("agentRunning", false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/30 text-red-400 text-[11px] font-medium hover:bg-red-500/10 transition-colors"
                    >
                      <Pause className="w-3 h-3" />
                      Stop
                    </button>
                  )}
                  <TooltipProvider>
                    {[
                      { icon: RotateCcw, label: "Restart" },
                      { icon: RefreshCw, label: "Refresh" },
                      { icon: ExternalLink, label: "Logs" },
                    ].map(({ icon: I, label }) => (
                      <Tooltip key={label}>
                        <TooltipTrigger asChild>
                          <button type="button" className="w-7 h-7 rounded flex items-center justify-center text-[#474747] hover:text-[#a3a3a3] hover:bg-[#202020] transition-colors">
                            <I className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">{label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>

                  <div className="flex-1" />

                  {/* inline capability toggles */}
                  <div className="flex items-center gap-0.5">
                    {CAP_LABELS.map((c) => {
                      const CapIcon = CAP_ICONS[c.key];
                      return (
                        <TooltipProvider key={c.key} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => handleInputChange(c.key, !formData[c.key])}
                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                                  formData[c.key]
                                    ? "bg-[#242424] text-[#e5e5e5]"
                                    : "text-[#333333] hover:text-[#737373]"
                                }`}
                              >
                                <CapIcon className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px] bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">{c.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
                {/* ── Live output ── */}
                {formData.agentRunning && (
                <div className="rounded-md bg-[#161616] border border-[#2a2a2a] overflow-hidden">
                    {/* terminal header bar */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[#2a2a2a] bg-[#1a1a1a]">
                      <span className="w-2 h-2 rounded-full bg-red-500/60" />
                      <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                      <span className="ml-2 text-[9px] text-[#474747] font-mono">agent — session-7f3a2c</span>
                    </div>
                    <div className="p-2 font-mono text-[10px] text-[#737373] space-y-0.5 leading-relaxed">
                      <div>
                        <span className="text-[#474747] select-none">~ </span>
                        <span className="text-emerald-400/70">git checkout -b agent/task-7f3a2c</span>
                      </div>
                      <div>
                        <span className="text-[#474747] select-none">  </span>
                        <span className="text-[#474747]">Switched to a new branch</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[#474747] select-none">~ </span>
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-400 shrink-0" />
                        <span className="text-blue-400/70">Analyzing task context &amp; generating plan…</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Settings row ── */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#737373]" />
                <span className="text-[11px] text-[#a3a3a3]">Sandbox</span>
              </div>
              <Switch size="sm" checked={formData.agentSandbox} onCheckedChange={(v) => handleInputChange("agentSandbox", v)} />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#737373]" />
                <span className="text-[11px] text-[#a3a3a3]">Auto PR</span>
              </div>
              <Switch size="sm" checked={formData.agentAutoPR} onCheckedChange={(v) => handleInputChange("agentAutoPR", v)} />
            </div>
          </div>

          {/* ── Resource Limits ── */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "agentMaxDuration", label: "Max Time", unit: "min" },
              { key: "agentMaxCost", label: "Max Cost", unit: "$", step: "0.01" },
              { key: "agentMaxIterations", label: "Max Iter", unit: "" },
            ].map(({ key, label, unit, step }) => (
              <div key={key} className="space-y-1">
                <Label className="text-[10px] text-[#474747] uppercase tracking-wide">{label}{unit && ` (${unit})`}</Label>
                <Input
                  type="number"
                  step={step}
                  value={formData[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="bg-[#202020] border-[#2a2a2a] text-white h-7 text-xs font-mono"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
