"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { Input, Textarea } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import {
  Field,
  SectionCard,
  SettingRow,
  SettingsList,
} from "@/components/internal/shared/screen_kit";
import {
  DEFAULT_PROJECT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { useProject } from "@/context/project-context";
import { createClient } from "@/lib/supabase/client";
import {
  Copy,
  Check,
  AlertTriangle,
  Info,
  BarChart2,
  Truck,
  Pause,
  Play,
  BarChart,
} from "lucide-react";
import { IconButtonCard } from "@/components/internal/shared/iconbuttoncard";

export function GeneralSettingsScreen() {
  const { project, setProject } = useProject();
  const router = useRouter();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  // Drafts are tagged with the project they belong to, so switching projects
  // discards a stale draft without a reset effect.
  const [nameDraft, setNameDraft] = useState({ id: null, value: null });
  const [descriptionDraft, setDescriptionDraft] = useState({
    id: null,
    value: null,
  });
  const [saving, setSaving] = useState(false);
  const [savingPageSize, setSavingPageSize] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const projectName =
    nameDraft.id === project?.id && nameDraft.value !== null
      ? nameDraft.value
      : (project?.name ?? "");
  const projectDescription =
    descriptionDraft.id === project?.id && descriptionDraft.value !== null
      ? descriptionDraft.value
      : (project?.description ?? "");
  const trimmedName = projectName.trim();
  const isPaused = (project?.status ?? "").toLowerCase() === "paused";
  const defaultPageSize =
    Number(project?.metadata?.defaultPageSize) || DEFAULT_PROJECT_PAGE_SIZE;
  const pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => ({
    value: size,
    label: `${size} per page`,
  }));

  const isDirty =
    (nameDraft.id === project?.id &&
      nameDraft.value !== null &&
      nameDraft.value.trim() !== (project?.name ?? "")) ||
    (descriptionDraft.id === project?.id &&
      descriptionDraft.value !== null &&
      descriptionDraft.value !== (project?.description ?? ""));
  const canSave =
    isDirty && trimmedName.length > 0 && !saving && Boolean(project?.id);

  const handleCopyId = () => {
    if (project?.id) {
      navigator.clipboard.writeText(project.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!project?.id || trimmedName.length === 0 || saving) {
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .update({
        name: trimmedName,
        description: projectDescription.trim() || null,
      })
      .eq("id", project.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      console.error("[general-settings] save error:", error);
      toast.error("Couldn't save project changes.");
      return;
    }
    setProject?.(
      data ?? {
        ...project,
        name: trimmedName,
        description: projectDescription.trim() || null,
      },
    );
    setNameDraft({ id: null, value: null });
    setDescriptionDraft({ id: null, value: null });
    toast.success("Project updated.");
  };

  const handleToggleStatus = async () => {
    if (!project?.id || togglingStatus) {
      return;
    }
    const nextStatus = isPaused ? "ACTIVE" : "PAUSED";
    setTogglingStatus(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .update({ status: nextStatus })
      .eq("id", project.id)
      .select()
      .single();
    setTogglingStatus(false);
    if (error) {
      console.error("[general-settings] status error:", error);
      toast.error(
        isPaused ? "Couldn't resume the project." : "Couldn't pause the project.",
      );
      return;
    }
    setProject?.(data ?? { ...project, status: nextStatus });
    toast.success(isPaused ? "Project resumed." : "Project paused.");
  };

  const goToSettingsTab = (tab) => {
    if (pathname) {
      router.push(`${pathname}?${encodeURIComponent(tab)}`, { scroll: false });
    }
  };

  const handleTransfer = async () => {
    const target = transferTarget.trim();
    if (!project?.id || !target || transferring) {
      return;
    }
    setTransferring(true);
    const supabase = createClient();
    const metadata = {
      ...(project.metadata ?? {}),
      transferRequestedTo: target,
      transferRequestedAt: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("projects")
      .update({ metadata })
      .eq("id", project.id)
      .select()
      .single();
    setTransferring(false);
    if (error) {
      console.error("[general-settings] transfer error:", error);
      toast.error("Couldn't request the transfer.");
      return;
    }
    setProject?.(data ?? { ...project, metadata });
    setTransferOpen(false);
    setTransferTarget("");
    toast.success(`Transfer to ${target} requested.`);
  };

  const handleDelete = async () => {
    if (!project?.id || deleting) {
      return;
    }
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", project.id);
    setDeleting(false);
    if (error) {
      console.error("[general-settings] delete error:", error);
      toast.error("Couldn't delete the project.");
      return;
    }
    setDeleteOpen(false);
    toast.success("Project deleted.");
    router.push("/");
  };

  const handlePageSizeChange = async (next) => {
    const size = Number(next);
    if (!project?.id || savingPageSize || !size || size === defaultPageSize) {
      return;
    }
    setSavingPageSize(true);
    const supabase = createClient();
    const metadata = {
      ...(project.metadata ?? {}),
      defaultPageSize: size,
    };
    const { data, error } = await supabase
      .from("projects")
      .update({ metadata })
      .eq("id", project.id)
      .select()
      .single();
    setSavingPageSize(false);
    if (error) {
      console.error("[general-settings] page size error:", error);
      toast.error("Couldn't update the default page size.");
      return;
    }
    setProject?.(data ?? { ...project, metadata });
    toast.success(`Tables will show ${size} rows per page by default.`);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6 my-10">
        <Field
          label="Project Name"
          htmlFor="project-name"
          hint="This name appears throughout Geiger Flow."
          className="w-full"
        >
          <Input
            id="project-name"
            value={projectName}
            onChange={(e) =>
              setNameDraft({ id: project?.id ?? null, value: e.target.value })
            }
            className="bg-background border-border text-foreground focus-visible:ring-ring"
            placeholder="e.g. My Awesome Project"
          />
        </Field>

        <Field
          label="Project Description"
          htmlFor="project-description"
          hint="Shown on the project overview under the project name."
          className="w-full"
        >
          <Textarea
            id="project-description"
            value={projectDescription}
            onChange={(e) =>
              setDescriptionDraft({
                id: project?.id ?? null,
                value: e.target.value,
              })
            }
            className="bg-background border-border text-foreground focus-visible:ring-ring"
            placeholder="e.g. Lightweight creative project manager."
            rows={3}
            maxLength={500}
          />
        </Field>

        <Field
          label="Project ID"
          htmlFor="project-id"
          hint="Used when interacting with the Geiger API."
          className="w-full"
        >
               <div className="flex w-full gap-2">
                 <Input
                   id="project-id"
                   value={project?.id || ""}
                   readOnly
                   className="h-10 flex-1 bg-background border-border text-muted-foreground focus-visible:ring-0 font-mono text-sm"
                 />
                 <Button
                   variant="outline"
                   size="icon"
                   onClick={handleCopyId}
                   className="h-10 bg-card border-border hover:bg-accent hover:text-accent-foreground shrink-0"
                   title="Copy Project ID"
                 >
                   {copied ? (
                     <Check className="h-4 w-4 text-muted-foreground" />
                   ) : (
                     <Copy className="h-4 w-4 text-muted-foreground" />
                   )}
                 </Button>
               </div>
             </Field>
             <Button
               onClick={handleSave}
               disabled={!canSave}
               className="bg-primary text-primary-foreground hover:bg-primary/90"
             >
               {saving ? "Saving..." : "Save Changes"}
             </Button>
      </div>

      <SectionCard
        title="Table defaults"
        description="Control how many rows project tables show at a time"
        bodyPadding={false}
      >
        <div className="px-5 py-4">
          <SettingsList>
            <SettingRow
              title="Default rows per page"
              description="New tables start here. Applies when a table loads."
              className="gap-3 max-sm:flex-col max-sm:items-start"
              control={
                <FilterDropdown
                  value={defaultPageSize}
                  onValueChange={handlePageSizeChange}
                  options={pageSizeOptions}
                  height="h-9"
                />
              }
            />
          </SettingsList>
        </div>
      </SectionCard>

      <SectionCard
        title="Project availability"
        description="Restart or pause your project when performing maintenance"
        bodyPadding={false}
      >
        <div className="px-5 py-4">
          <SettingsList>
            <SettingRow
              title={isPaused ? "Resume project" : "Pause project"}
              description={
                isPaused
                  ? "Your project is paused. Resume it to restore access."
                  : "Your project will not be accessible while it is paused."
              }
              className="gap-3 max-sm:flex-col max-sm:items-start"
              control={
                <Button
                  variant="outline"
                  onClick={handleToggleStatus}
                  disabled={togglingStatus || !project?.id}
                  className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground gap-2 shrink-0 whitespace-nowrap"
                >
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  {togglingStatus
                    ? "Working..."
                    : isPaused
                      ? "Resume project"
                      : "Pause project"}
                </Button>
              }
            />
          </SettingsList>
        </div>
      </SectionCard>

      <IconButtonCard
        classNames={{
          container: "bg-background shadow-none",
        }}
        banner="Project usage"
        icon={<BarChart2 className="w-5 h-5" />}
        title="Project usage statistics have been moved"
        subtitle="You may view your project's usage under your organization's settings"
        endingComponent={
          <Button
            variant="outline"
            className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground gap-2"
            onClick={() => goToSettingsTab("Usage")}
          >
            <BarChart className="w-4 h-4" /> View Project Usage
          </Button>
        }
      />

      <IconButtonCard
        banner="Custom domains"
        subBanner="Present a branded experience to your users"
        icon={<Info className="w-5 h-5" />}
        title="Custom domains are a Pro Plan add-on"
        subtitle="Paid Plans come with free vanity subdomains or Custom Domains for an additional $10/month per domain."
        endingComponent={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
            onClick={() => goToSettingsTab("Add-ons")}
          >
            Enable add-on
          </Button>
        }
      />

      <IconButtonCard
        banner="Transfer project"
        icon={<Truck className="w-5 h-5" />}
        title="Transfer project to another organization"
        subtitle="To transfer projects, the owner must be a member of both the source and target organizations."
        endingComponent={
          <Button
            variant="outline"
            className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => setTransferOpen(true)}
          >
            Transfer project
          </Button>
        }
      />

      <IconButtonCard
        banner="Delete project"
        subBanner="Permanently remove your project and its database"
        icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
        title="Deleting this project will also remove your database."
        subtitle="Make sure you have made a backup if you want to keep your data."
        classNames={{
          container: "bg-surface-subtle border-red-500/20",
          iconWrapper: "bg-red-500/10 border-red-500/20 mt-0.5",
          title: "text-foreground font-semibold text-base",
          subtitle: "text-muted-foreground mt-0.5",
          endingComponent: "!block !ml-14 mt-4",
        }}
        endingComponent={
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete project
          </Button>
        }
      />

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer this project?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              The new owner must be a member of both the source and target
              organizations. The request is recorded on the project.
            </DialogDescription>
          </DialogHeader>
          <Field label="Target organization">
            <Input
              value={transferTarget}
              onChange={(event) => setTransferTarget(event.target.value)}
              placeholder="e.g. acme-corp"
              className="border-border bg-surface-card text-foreground"
            />
          </Field>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setTransferOpen(false)} disabled={transferring}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!transferTarget.trim() || transferring}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {transferring ? "Requesting…" : "Request transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              “{project?.name ?? "This project"}” and its database will be removed.
              Make sure you have a backup if you want to keep your data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              {deleting ? "Deleting…" : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
