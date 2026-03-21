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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  
  // Vault settings
  const [vaultEnabled, setVaultEnabled] = useState(true);
  const [vaultAccessType, setVaultAccessType] = useState("team");
  const [vaultKeylessEntry, setVaultKeylessEntry] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleCreate = async () => {
    setLoading(true);
    if (onCreate) {
      await onCreate({ 
        name, 
        logo, 
        provider, 
        region,
        vaultSettings: {
          enabled: vaultEnabled,
          accessType: vaultAccessType,
          keylessEntry: vaultKeylessEntry,
        }
      });
    }
    setLoading(false);
    setIsOpen(false);
    setName("");
    setLogo("");
    setProvider("AWS");
    setRegion("ap-south-1");
    setVaultEnabled(true);
    setVaultAccessType("team");
    setVaultKeylessEntry(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter the details for your new infrastructure project.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-accent data-[state=active]:text-foreground"
            >
              Project Details
            </TabsTrigger>
            <TabsTrigger 
              value="vault" 
              className="data-[state=active]:bg-accent data-[state=active]:text-foreground"
            >
              <Key className="w-4 h-4 mr-2" />
              Vault Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-text-tertiary">
                Project Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. My Awesome App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-surface-elevated border-border-default text-primary focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="logo" className="text-sm font-medium text-text-tertiary">
                Logo URL (Optional)
              </Label>
              <Input
                id="logo"
                placeholder="e.g. https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="bg-surface-elevated border-border-default text-primary focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <Label className="text-sm font-medium text-zinc-300">
                Cloud Provider
              </Label>
              <RadioGroup
                value={provider}
                onValueChange={setProvider}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="AWS"
                    id="aws"
                    className="border-zinc-500 text-[#ededed]"
                  />
                  <Label
                    htmlFor="aws"
                    className="text-sm font-medium text-[#ededed] cursor-pointer"
                  >
                    AWS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="GCP"
                    id="gcp"
                    className="border-zinc-500 text-[#ededed]"
                  />
                  <Label
                    htmlFor="gcp"
                    className="text-sm font-medium text-[#ededed] cursor-pointer"
                  >
                    GCP
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Azure"
                    id="azure"
                    className="border-zinc-500 text-[#ededed]"
                  />
                  <Label
                    htmlFor="azure"
                    className="text-sm font-medium text-[#ededed] cursor-pointer"
                  >
                    Azure
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="region"
                className="text-sm font-medium text-text-tertiary"
              >
                Geographic Region
              </Label>
              <Input
                id="region"
                placeholder="e.g. us-east-1"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-surface-elevated border-border-default text-primary focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="vault" className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-border-default">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <Label className="text-sm font-medium text-primary">
                    Enable Vault
                  </Label>
                </div>
                <p className="text-xs text-text-muted">
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
                  <Label className="text-sm font-medium text-text-tertiary flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Default Access Control
                  </Label>
                  <p className="text-xs text-text-muted mb-2">
                    This will be the default access setting for all secrets in the vault
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setVaultAccessType("team")}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        vaultAccessType === "team"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-border-default bg-surface-elevated text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Entire Team</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVaultAccessType("admin")}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        vaultAccessType === "admin"
                          ? "border-purple-500 bg-purple-500/10 text-purple-400"
                          : "border-border-default bg-surface-elevated text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <Shield className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Admins Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVaultAccessType("custom")}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        vaultAccessType === "custom"
                          ? "border-green-500 bg-green-500/10 text-green-400"
                          : "border-border-default bg-surface-elevated text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Custom</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-border-default">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {vaultKeylessEntry ? (
                        <Unlock className="w-5 h-5 text-green-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-red-400" />
                      )}
                      <Label className="text-sm font-medium text-primary">
                        Keyless Entry
                      </Label>
                    </div>
                    <p className="text-xs text-text-muted">
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

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-200">
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
            className="text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
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
