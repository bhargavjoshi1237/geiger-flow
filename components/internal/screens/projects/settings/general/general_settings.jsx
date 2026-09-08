"use client";

import React, { useState } from "react";
import { Input } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  Field,
  SectionCard,
  SettingRow,
  SettingsList,
} from "@/components/internal/shared/screen_kit";
import { useProject } from "@/context/project-context";
import {
  Copy,
  Check,
  AlertTriangle,
  Info,
  BarChart2,
  Truck,
  Pause,
  BarChart,
} from "lucide-react";
import { IconButtonCard } from "@/components/internal/shared/iconbuttoncard";

export function GeneralSettingsScreen() {
  const { project } = useProject();
  const [copied, setCopied] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(null);
  const projectName = editedProjectName ?? project?.name ?? "";
  

  const handleCopyId = () => {
    if (project?.id) {
      navigator.clipboard.writeText(project.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
           onChange={(e) => setEditedProjectName(e.target.value)}
           className="bg-background border-border text-foreground focus-visible:ring-ring"
           placeholder="e.g. My Awesome Project"
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
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
      </div>

      

      <SectionCard
        title="Project availability"
        description="Restart or pause your project when performing maintenance"
        bodyPadding={false}
      >
        <div className="px-5">
          <SettingsList>
            <SettingRow
              title="Pause project"
              description="Your project will not be accessible while it is paused."
              control={
                <Button
                  variant="outline"
                  className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground gap-2"
                >
                  <Pause className="w-4 h-4" /> Pause project
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border border-primary">
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
        endingComponent={<Button variant="destructive">Delete project</Button>}
      />
    </div>
  );
}
