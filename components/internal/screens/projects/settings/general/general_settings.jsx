"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProject } from "@/context/project-context";
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
  const { project } = useProject();
  const [copied, setCopied] = useState(false);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (project?.name) {
      setProjectName(project.name);
    }
  }, [project]);

  const handleCopyId = () => {
    if (project?.id) {
      navigator.clipboard.writeText(project.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-12">
      {/* Project details section */}
      <div className="space-y-6">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-xl">Project Details</CardTitle>
            <CardDescription className="text-muted-foreground">
              Update your project's basic information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 max-w-xl">
              <Label htmlFor="project-name" className="text-foreground">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-ring"
                placeholder="e.g. My Awesome Project"
              />
              <p className="text-xs text-muted-foreground/70">
                This is your project's visible name within Geiger Flow.
              </p>
            </div>

            <div className="space-y-2 max-w-xl">
              <Label htmlFor="project-id" className="text-foreground">
                Project ID
              </Label>
              <div className="flex gap-2">
                <Input
                  id="project-id"
                  value={project?.id || ""}
                  readOnly
                  className="bg-background border-border text-muted-foreground focus-visible:ring-0 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyId}
                  className="bg-card border-border hover:bg-accent hover:text-accent-foreground shrink-0"
                  title="Copy Project ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/70">
                Used when interacting with the Geiger API.
              </p>
            </div>
          </CardContent>
          <CardFooter className="rounded-b-xl flex justify-end items-center mt-0 border-t border-border">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-xl font-medium text-foreground">
            Project availability
          </h3>
          <p className="text-sm text-muted-foreground">
            Restart or pause your project when performing maintenance
          </p>
        </div>

        {/* We can place multiple IconButtonCards right next to each other or inside a wrapper. Let's make a wrapper for this list to look like a single grouped card if we want, or separate them. In the image they appear as separate items within a section. */}
        <div className="flex flex-col gap-0 border border-border rounded-xl overflow-hidden bg-background">
          <div>
            <IconButtonCard
              classNames={{
                container: "border-0 rounded-none bg-transparent shadow-none",
              }}
              title="Pause project"
              subtitle="Your project will not be accessible while it is paused."
              endingComponent={
                <Button
                  variant="outline"
                  className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground gap-2"
                >
                  <Pause className="w-4 h-4" /> Pause project
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* Example 2: Banner + icon + text + trailing button */}
      <IconButtonCard
        classNames={{
          container: "bg-[#161616] shadow-none",
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

      {/* Example 3: Banner + SubBanner + info icon + green button */}
      <IconButtonCard
        banner="Custom domains"
        subBanner="Present a branded experience to your users"
        icon={<Info className="w-5 h-5" />}
        title="Custom domains are a Pro Plan add-on"
        subtitle="Paid Plans come with free vanity subdomains or Custom Domains for an additional $10/month per domain."
        endingComponent={
          <Button className="bg-[#0f5c35] hover:bg-[#127040] text-white border border-[#1b7e4a]">
            Enable add-on
          </Button>
        }
      />

      {/* Example 4: Transfer Project (replacing one of the Danger Zone items) */}
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

      {/* Example 5: Delete Project */}
      <IconButtonCard
        banner="Delete project"
        subBanner="Permanently remove your project and its database"
        icon={<AlertTriangle className="w-5 h-5 text-black" />}
        title="Deleting this project will also remove your database."
        subtitle="Make sure you have made a backup if you want to keep your data."
        classNames={{
          container: "bg-[#180505] border-[#4a1616]",
          iconWrapper: "bg-[#e55740] border-none mt-0.5",
          title: "text-white font-semibold text-base",
          subtitle: "text-muted-foreground mt-0.5",
          endingComponent: "!block !ml-14 mt-4",
        }}
        endingComponent={<Button variant="destructive">Delete project</Button>}
      />
    </div>
  );
}
