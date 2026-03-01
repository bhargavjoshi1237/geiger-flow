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

export function NewProjectDialog({ children, onCreate }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [provider, setProvider] = useState("AWS");
  const [region, setRegion] = useState("ap-south-1");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    if (onCreate) {
      await onCreate({ name, logo, provider, region });
    }
    setLoading(false);
    setIsOpen(false);
    setName("");
    setLogo("");
    setProvider("AWS");
    setRegion("ap-south-1");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#161616] border-[#2a2a2a] text-[#ededed]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter the details for your new infrastructure project.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-zinc-300">
              Project Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. My Awesome App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#202020] border-[#333333] text-white focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="logo" className="text-sm font-medium text-zinc-300">
              Logo URL (Optional)
            </Label>
            <Input
              id="logo"
              placeholder="e.g. https://example.com/logo.png"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="bg-[#202020] border-[#333333] text-white focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
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
              className="text-sm font-medium text-zinc-300"
            >
              Geographic Region
            </Label>
            <Input
              id="region"
              placeholder="e.g. us-east-1"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-[#202020] border-[#333333] text-white focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white hover:bg-[#202020] border border-transparent"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!name || loading}
            className="bg-[#ededed] text-black hover:bg-zinc-300"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
