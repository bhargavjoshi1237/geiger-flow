"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Check } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function OrganizationSettingsScreen() {
  const [copied, setCopied] = useState(false);
  const orgSlug = "dusonpazefscwxdmryip";

  const handleCopy = () => {
    navigator.clipboard.writeText(orgSlug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#e7e7e7] tracking-tight">
            Organization Settings
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            General configuration, privacy, and lifecycle controls
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#e7e7e7]">
          Organization details
        </h3>
        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center gap-4 py-4 px-6 border-b border-[#2c2c2c]">
              <div className="md:w-[250px] shrink-0 text-sm font-medium text-[#e7e7e7]">
                Organization name
              </div>
              <div className="flex-1">
                <Input
                  className="bg-[#121212] border-[#2c2c2c] h-9 text-sm text-[#e7e7e7] focus-visible:ring-1 focus-visible:ring-[#474747]"
                  defaultValue="bhargavjoshi1237's Org"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 py-4 px-6">
              <div className="md:w-[250px] shrink-0 text-sm font-medium text-[#e7e7e7]">
                Organization slug
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  className="bg-[#121212] border-[#2c2c2c] h-9 text-sm text-[#a3a3a3] focus-visible:ring-1 focus-visible:ring-[#474747] font-mono"
                  defaultValue={orgSlug}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#181818] border-[#2c2c2c] h-9 w-9 shrink-0 hover:bg-[#2c2c2c] text-[#a3a3a3] hover:text-[#e7e7e7]"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="py-3 px-6 flex justify-end gap-3 border-t border-[#2c2c2c]">
            <Button
              variant="ghost"
              className="h-8 text-sm hover:bg-[#2c2c2c] text-[#a3a3a3] hover:text-[#e7e7e7]"
            >
              Cancel
            </Button>
            <Button className="h-8 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors px-6">
              Save
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#e7e7e7]">Data privacy</h3>
        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] p-6 rounded-xl flex flex-col lg:flex-row gap-6 lg:gap-8 shadow-sm">
          <div className="lg:w-5/12 shrink-0">
            <h4 className="text-sm font-medium mb-3 text-[#e7e7e7]">
              Supabase Assistant Opt-in Level
            </h4>
            <p className="text-sm text-[#8b8b8b] mb-4 leading-[1.6]">
              Supabase AI can provide more relevant answers if you choose to
              share different levels of data. This feature is powered by
              third-party AI providers. This is an organization-wide setting, so
              please select the level of data you are comfortable sharing.
            </p>
            <p className="text-sm text-[#8b8b8b] mb-6 leading-[1.6]">
              For organizations with HIPAA compliance enabled in their Supabase
              configuration, any consented information will only be shared with
              third-party AI providers with whom Supabase has established a
              Business Associate Agreement (BAA).
            </p>
            <Button
              variant="outline"
              className="h-8 text-xs bg-transparent border-[#2c2c2c] text-[#a3a3a3] hover:bg-[#2c2c2c] hover:text-[#e7e7e7] transition-colors"
            >
              Learn more about data privacy
            </Button>
          </div>

          <RadioGroup defaultValue="disabled" className="lg:w-7/12 gap-6">
            <Label className="flex gap-4 items-start cursor-pointer group">
              <RadioGroupItem value="disabled" className="mt-0.5 border-[var(--primary,white)] text-[var(--primary,white)]" />
              <span>
                <span className="block text-sm font-medium text-[#e7e7e7] mb-1">
                  Disabled
                </span>
                <span className="block text-[13px] text-[#8b8b8b] leading-[1.5]">
                  You do not consent to sharing any database information with
                  third-party AI providers and understand that responses will be
                  generic and not tailored to your database
                </span>
              </span>
            </Label>

            <Label className="flex gap-4 items-start cursor-pointer group">
              <RadioGroupItem value="schema" className="mt-0.5 border-[#474747] group-hover:border-[#a3a3a3]" />
              <span>
                <span className="block text-sm font-medium text-[#e7e7e7] mb-1">
                  Schema Only
                </span>
                <span className="block text-[13px] text-[#8b8b8b] leading-[1.5]">
                  You consent to sharing your database schema metadata (such
                  as table and column names, data types, and relationships, but
                  not actual database data) with third-party AI providers
                </span>
              </span>
            </Label>

            <Label className="flex gap-4 items-start cursor-pointer group">
              <RadioGroupItem value="schema_logs" className="mt-0.5 border-[#474747] group-hover:border-[#a3a3a3]" />
              <span>
                <span className="block text-sm font-medium text-[#e7e7e7] mb-1">
                  Schema & Logs
                </span>
                <span className="block text-[13px] text-[#8b8b8b] leading-[1.5]">
                  You consent to sharing your schema and logs (which may contain
                  PII/database data) with third-party AI providers for better
                  results
                </span>
              </span>
            </Label>

            <Label className="flex gap-4 items-start cursor-pointer group">
              <RadioGroupItem value="schema_logs_data" className="mt-0.5 border-[#474747] group-hover:border-[#a3a3a3]" />
              <span>
                <span className="block text-sm font-medium text-[#e7e7e7] mb-1">
                  Schema, Logs & Database Data
                </span>
                <span className="block text-[13px] text-[#8b8b8b] leading-[1.5]">
                  You consent to give third-party AI providers full access to
                  run database read-only queries and analyze results for optimal
                  results
                </span>
              </span>
            </Label>
          </RadioGroup>
        </Card>
      </div>
    </MainScreenWrapper>
  );
}
