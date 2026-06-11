"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Shield, Users, Lock, Unlock, Info } from "lucide-react";

export function NewProjectDialog({ children, onCreate }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [provider, setProvider] = useState("AWS");
  const [region, setRegion] = useState("ap-south-1");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [vaultEnabled, setVaultEnabled] = useState(true);
  const [vaultAccessType, setVaultAccessType] = useState("team");
  const [vaultKeylessEntry, setVaultKeylessEntry] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = onCreate
        ? await onCreate({
            name,
            logo,
            provider,
            region,
            vaultSettings: {
              enabled: vaultEnabled,
              accessType: vaultAccessType,
              keylessEntry: vaultKeylessEntry,
            },
          })
        : true;

      if (created === false) {
        return;
      }

      setIsOpen(false);
      setName("");
      setLogo("");
      setProvider("AWS");
      setRegion("ap-south-1");
      setVaultEnabled(true);
      setVaultAccessType("team");
      setVaultKeylessEntry(false);
      setActiveTab("details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the details for your new infrastructure project.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-surface-card">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-surface-hover data-[state=active]:text-foreground"
            >
              Project Details
            </TabsTrigger>
            <TabsTrigger 
              value="vault" 
              className="data-[state=active]:bg-surface-hover data-[state=active]:text-foreground"
            >
              <Key className="w-4 h-4 mr-2" />
              Vault Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                Project Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. My Awesome App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="logo" className="text-sm font-medium text-muted-foreground">
                Logo URL (Optional)
              </Label>
              <Input
                id="logo"
                placeholder="e.g. https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className=" bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Cloud Provider
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProvider("AWS")}
                  className={`relative h-auto min-h-24 w-full flex-col gap-2 rounded-lg border p-4 transition-colors hover:text-foreground ${
                    provider === "AWS"
                      ? "border-border-strong bg-surface-hover text-foreground hover:bg-surface-hover"
                      : "border-border bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-hover"
                  }`}
                >
                  {provider === "AWS" && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground"></div>}
                  <svg className="size-8 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill={provider === "AWS" ? "var(--foreground)" : "var(--muted-foreground)"} d="M7.64 10.38c0 .25.02.45.07.62c.05.12.12.28.21.46c.04.04.05.1.05.15c0 .07-.04.13-.13.2l-.42.28c-.06.04-.12.06-.17.06c-.07 0-.13-.04-.2-.1c-.09-.1-.17-.2-.24-.31c-.06-.11-.13-.24-.2-.39c-.52.61-1.17.92-1.96.92c-.56 0-1-.16-1.33-.48c-.32-.32-.49-.75-.49-1.29c0-.55.2-1 .6-1.36c.41-.34.95-.52 1.63-.52c.23 0 .44.02.71.06c.23.03.5.08.76.14v-.48c0-.51-.1-.84-.31-1.07c-.22-.21-.57-.3-1.08-.3c-.24 0-.48.03-.72.08c-.25.06-.49.13-.72.23c-.11.04-.2.07-.23.08c-.05.02-.08.02-.11.02c-.09 0-.14-.06-.14-.2v-.33c0-.1.01-.18.05-.23q.045-.075.18-.12c.24-.14.51-.24.84-.32a4 4 0 0 1 1.04-.13q1.185 0 1.74.54c.37.36.55.91.55 1.64v2.15zm-2.7 1.02c.22 0 .44-.04.68-.12s.45-.23.63-.43c.11-.13.19-.27.25-.43c0-.16.05-.35.05-.58v-.27c-.2-.07-.4-.07-.62-.12a7 7 0 0 0-.62-.04c-.45 0-.77.09-.99.27s-.32.43-.32.76c0 .32.07.56.24.71c.16.17.39.25.7.25m5.34.71a.6.6 0 0 1-.28-.06c-.03-.05-.08-.14-.12-.26L8.32 6.65c-.04-.15-.06-.22-.06-.27c0-.11.05-.17.16-.17h.65c.13 0 .22.02.26.07c.06.04.1.13.14.26l1.11 4.4l1.04-4.4c.03-.13.07-.22.13-.26c.05-.04.14-.07.25-.07h.55c.12 0 .21.02.26.07c.05.04.1.13.13.26L14 11l1.14-4.46c.04-.13.09-.22.13-.26c.06-.04.14-.07.26-.07h.62c.11 0 .17.06.17.17c0 .03-.01.07-.02.12c0 0-.02.08-.04.15l-1.61 5.14c-.04.14-.08.21-.15.26c-.04.04-.13.07-.24.07h-.57c-.13 0-.19-.02-.27-.07a.45.45 0 0 1-.12-.26L12.27 7.5l-1.03 4.28q-.045.195-.12.27a.5.5 0 0 1-.27.06zm8.55.18c-.33 0-.7-.04-1.03-.12s-.59-.17-.76-.26a.5.5 0 0 1-.21-.19a.4.4 0 0 1-.04-.18v-.34c0-.14.05-.2.15-.2h.12c.04 0 .1.05.17.08c.22.1.47.18.73.23c.27.05.54.08.79.08c.42 0 .75-.07.97-.22c.23-.17.35-.36.35-.63c0-.19-.07-.34-.18-.47c-.12-.12-.35-.24-.67-.34l-.97-.3c-.48-.16-.84-.38-1.06-.68a1.58 1.58 0 0 1-.33-.97c0-.28.06-.52.18-.73c.12-.22.28-.4.46-.55c.22-.15.44-.26.71-.34q.39-.12.84-.12q.21 0 .45.03c.14.02.28.05.42.07c.14.04.26.07.38.11s.2.08.28.12c.09.05.16.1.2.16s.06.13.06.22v.32q0 .21-.15.21c-.05 0-.14-.03-.26-.08c-.37-.17-.8-.26-1.27-.26c-.38 0-.66.06-.89.19c-.2.12-.31.32-.31.59c0 .19.07.35.2.47c.13.13.38.25.73.37l.95.3c.48.14.82.36 1.03.64q.3.405.3.93c0 .28-.06.54-.17.77c-.12.22-.28.42-.5.58c-.19.17-.44.29-.72.38s-.62.13-.95.13m1.25 3.24C17.89 17.14 14.71 18 12 18c-3.85 0-7.3-1.42-9.91-3.77c-.21-.19-.02-.44.23-.29c2.82 1.63 6.29 2.62 9.89 2.62c2.43 0 5.1-.5 7.55-1.56c.37-.15.68.26.32.53M21 14.5c-.29-.37-1.86-.18-2.57-.1c-.21.03-.24-.16-.05-.3c1.25-.87 3.31-.6 3.54-.33c.24.3-.06 2.36-1.23 3.34c-.19.15-.36.07-.28-.11c.27-.68.86-2.16.59-2.5"/>
                  </svg>
                  <span className="text-xs font-medium leading-none">AWS</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProvider("GCP")}
                  className={`relative h-auto min-h-24 w-full flex-col gap-2 rounded-lg border p-4 transition-colors hover:text-foreground ${
                    provider === "GCP"
                      ? "border-border-strong bg-surface-hover text-foreground hover:bg-surface-hover"
                      : "border-border bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-hover"
                  }`}
                >
                  {provider === "GCP" && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground"></div>}
                  <svg className="size-8 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill={provider === "GCP" ? "var(--foreground)" : "var(--muted-foreground)"} d="M13.05 4.24L6.56 18.05L2 18l5.09-8.76zm.7 1.09L22 19.76H6.74l9.3-1.66l-4.87-5.79z"/>
                  </svg>
                  <span className="text-xs font-medium leading-none">GCP</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProvider("Azure")}
                  className={`relative h-auto min-h-24 w-full flex-col gap-2 rounded-lg border p-4 transition-colors hover:text-foreground ${
                    provider === "Azure"
                      ? "border-border-strong bg-surface-hover text-foreground hover:bg-surface-hover"
                      : "border-border bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-hover"
                  }`}
                >
                  {provider === "Azure" && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground"></div>}
                  <svg className="size-8 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill={provider === "Azure" ? "var(--foreground)" : "var(--muted-foreground)"} d="M23 14.75C23 18.2 20.2 21 16.75 21h-9.5C3.8 21 1 18.2 1 14.75c0-2.14 1.08-4.03 2.71-5.15C4.58 5.82 7.96 3 12 3s7.42 2.82 8.29 6.6A6.22 6.22 0 0 1 23 14.75M16.63 17c1.31 0 2.37-1.06 2.37-2.37c0-1.28-1-2.33-2.28-2.38l.03-.5a4.754 4.754 0 0 0-8.32-3.14c1.5.29 2.8 1.11 3.71 2.25L9.5 13.5c-.42-.73-1.21-1.25-2.12-1.25c-1.32 0-2.38 1.06-2.38 2.38c0 1.27 1 2.3 2.25 2.37z"/>
                  </svg>
                  <span className="text-xs font-medium leading-none">Azure</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="region"
                className="text-sm font-medium text-muted-foreground"
              >
                Geographic Region
              </Label>
              <Input
                id="region"
                placeholder="e.g. us-east-1"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="vault" className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 bg-surface-card rounded-lg border border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-foreground" />
                  <Label className="text-sm font-medium text-foreground">
                    Enable Vault
                  </Label>
                </div>
                <p className="text-xs text-text-secondary">
                  Create a secure vault for storing project credentials and secrets
                </p>
              </div>
              <Switch
                checked={vaultEnabled}
                onCheckedChange={setVaultEnabled}
              />
            </div>

            {vaultEnabled && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Default Access Control
                  </Label>
                  <p className="text-xs text-text-secondary mb-2">
                    This will be the default access setting for all secrets in the vault
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button
                      type="button"
                      variant="outline"
                      aria-pressed={vaultAccessType === "team"}
                      onClick={() => setVaultAccessType("team")}
                      className={`h-11 w-full justify-center gap-2 rounded-lg border px-3 text-center transition-colors ${
                        vaultAccessType === "team"
                          ? "border-border-strong bg-surface-hover text-foreground hover:bg-surface-hover"
                          : "border-border bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-hover hover:text-foreground"
                      }`}
                    >
                      <Users className="size-4" />
                      <span className="text-xs font-medium leading-none">
                        Entire Team
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      aria-pressed={vaultAccessType === "admin"}
                      onClick={() => setVaultAccessType("admin")}
                      className={`h-11 w-full justify-center gap-2 rounded-lg border px-3 text-center transition-colors ${
                        vaultAccessType === "admin"
                          ? "border-border-strong bg-surface-hover text-foreground hover:bg-surface-hover"
                          : "border-border bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-hover hover:text-foreground"
                      }`}
                    >
                      <Shield className="size-4" />
                      <span className="text-xs font-medium leading-none">
                        Admins Only
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      aria-pressed={vaultAccessType === "custom"}
                      onClick={() => setVaultAccessType("custom")}
                      className={`h-11 w-full justify-center gap-2 rounded-lg border px-3 text-center transition-colors ${
                        vaultAccessType === "custom"
                          ? "border-border-strong bg-surface-hover text-foreground hover:bg-surface-hover"
                          : "border-border bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-hover hover:text-foreground"
                      }`}
                    >
                      <Users className="size-4" />
                      <span className="text-xs font-medium leading-none">
                        Custom
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-card rounded-lg border border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {vaultKeylessEntry ? (
                        <Unlock className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                      <Label className="text-sm font-medium text-foreground">
                        Keyless Entry
                      </Label>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {vaultKeylessEntry
                        ? "Users can view secret values without password verification"
                        : "Viewing secret values requires user's account password"}
                    </p>
                  </div>
                  <Switch
                    checked={vaultKeylessEntry}
                    onCheckedChange={setVaultKeylessEntry}
                  />
                </div>

                <div className="p-3 bg-surface-card border border-border rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    These settings will be applied as defaults when creating the project. 
                    You can customize access control for each secret individually after creation.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-surface-card"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!name || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
