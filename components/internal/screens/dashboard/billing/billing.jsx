"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, ExternalLink, FileText } from "lucide-react";
import UpgradePlanDialogue from "./upgrade_plan_dialouge";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function BillingScreen({ invoices = [] }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#e7e7e7] tracking-tight">
            Billing
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            Manage billing, view past invoices, and update your subscription plan.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 border-b border-[#2c2c2c] pb-10">
        <div className="lg:w-4/12 space-y-3 shrink-0">
          <h3 className="text-[15px] font-medium text-[#e7e7e7]">Subscription Plan</h3>
          <p className="text-[14px] text-[#8b8b8b] leading-[1.6]">
            Subscription data will load from the backend.
          </p>
        </div>
        <div className="lg:w-8/12 flex flex-col items-start gap-4">
          <h2 className="text-2xl font-medium text-primary">No plan data</h2>
          <Button
            variant="outline"
            className="h-8 text-[13px] bg-transparent border-[#2c2c2c] hover:bg-[#2c2c2c] text-[#e7e7e7] transition-colors"
            onClick={() => setIsUpgradeOpen(true)}
          >
            Change subscription plan
          </Button>
          <UpgradePlanDialogue open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen} />

          <Card className="bg-[#181818] border-[#2c2c2c] flex gap-4 p-5 rounded-xl text-left shadow-sm w-full mt-2">
            <div className="bg-[#2c2c2c] text-[#a3a3a3] w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[#e7e7e7] mb-1">
                Usage and quota data is not loaded
              </div>
              <div className="text-[13px] text-[#8b8b8b] leading-[1.6]">
                Backend billing data can populate the active plan, quotas, and usage limits here.
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 border-b border-[#2c2c2c] pb-10">
        <div className="lg:w-4/12 space-y-6 shrink-0">
          <h3 className="text-[15px] font-medium text-[#e7e7e7]">Cost Control</h3>
          <a href="#" className="flex items-center gap-1.5 text-[14px] text-[#8b8b8b] hover:text-[#e7e7e7] transition-colors">
            Spend cap <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="lg:w-8/12">
          <Card className="bg-[#181818] border-[#2c2c2c] p-6 rounded-xl shadow-sm">
            <p className="text-[13px] text-[#8b8b8b] leading-[1.6]">
              Spend cap settings will appear here after backend data is connected.
            </p>
          </Card>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pb-10">
        <div className="lg:w-4/12 space-y-3 shrink-0">
          <h3 className="text-[15px] font-medium text-[#e7e7e7]">Past Invoices</h3>
          <p className="text-[14px] text-[#8b8b8b] leading-[1.6]">
            Invoice history will load from the backend.
          </p>
        </div>
        <div className="lg:w-8/12">
          {invoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2c2c2c] bg-[#181818] p-10 text-center">
              <FileText className="mx-auto mb-3 h-6 w-6 text-[#525252]" />
              <p className="text-sm font-medium text-[#e7e7e7]">No invoices yet</p>
              <p className="mt-1 text-xs text-[#737373]">
                Past invoices will appear here after backend data is connected.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </MainScreenWrapper>
  );
}
