"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, ExternalLink, FileText } from "lucide-react";
import UpgradePlanDialogue from "./upgrade_plan_dialouge";

export function BillingScreen() {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const invoices = [
    {
      date: "Feb 18, 2026",
      amount: "$0.00",
      number: "XYQQAA-00018",
      status: "PAID",
    },
    {
      date: "Jan 18, 2026",
      amount: "$0.00",
      number: "XYQQAA-00017",
      status: "PAID",
    },
    {
      date: "Dec 18, 2025",
      amount: "$0.00",
      number: "XYQQAA-00016",
      status: "PAID",
    },
    {
      date: "Nov 18, 2025",
      amount: "$0.00",
      number: "XYQQAA-00015",
      status: "PAID",
    },
  ];

  return (
    <div className="flex flex-col gap-10 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-[#e7e7e7]">
      <h1 className="text-2xl mt-4 font-semibold text-[#e7e7e7] tracking-tight mb-2">
        Billing
      </h1>

      {/* Subscription Plan */}
      <div className="flex flex-col lg:flex-row gap-8 border-b border-[#2c2c2c] pb-10">
        <div className="lg:w-4/12 space-y-3 shrink-0">
          <h3 className="text-[15px] font-medium text-[#e7e7e7]">
            Subscription Plan
          </h3>
          <p className="text-[14px] text-[#8b8b8b] leading-[1.6]">
            Each organization has it's own subscription plan, billing cycle,
            payment methods and usage quotas.
          </p>
        </div>
        <div className="lg:w-8/12 flex flex-col items-start gap-4">
          <h2 className="text-2xl font-medium text-primary">Free Plan</h2>
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
                This organization is limited by the included usage
              </div>
              <div className="text-[13px] text-[#8b8b8b] leading-[1.6]">
                Projects may become unresponsive when this organization exceeds
                its{" "}
                <strong className="font-semibold text-[#e7e7e7]">
                  included usage quota
                </strong>
                . To scale seamlessly, upgrade to a paid plan.
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cost Control */}
      <div className="flex flex-col lg:flex-row gap-8 border-b border-[#2c2c2c] pb-10">
        <div className="lg:w-4/12 space-y-6 shrink-0">
          <div className="space-y-3">
            <h3 className="text-[15px] font-medium text-[#e7e7e7]">
              Cost Control
            </h3>
            <p className="text-[14px] text-[#8b8b8b] leading-[1.6]">
              Allow scaling beyond your plan's{" "}
              <a href="#" className="text-[#34b27b] hover:underline">
                included quota
              </a>
              .
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-[14px] text-[#8b8b8b]">More information</div>
            <a
              href="#"
              className="flex items-center gap-1.5 text-[14px] text-[#8b8b8b] hover:text-[#e7e7e7] transition-colors"
            >
              Spend cap <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="lg:w-8/12 flex flex-col gap-4">
          <p className="text-[14px] text-[#8b8b8b] leading-[1.6]">
            If you need to go beyond the included quota, simply switch off your
            spend cap to pay for additional usage.
          </p>

          <Card className="bg-[#181818] border-[#2c2c2c] flex flex-col sm:flex-row gap-6 p-6 rounded-xl shadow-sm">
            <div className="w-full sm:w-[140px] h-[90px] shrink-0 border border-[#2c2c2c] rounded-md overflow-hidden relative bg-[#121212] flex items-end px-2 gap-1.5 pb-2">
              <div className="absolute top-[40%] left-0 right-0 border-t border-dashed border-[#34b27b]/50 z-10 w-full" />
              {[80, 50, 40, 60, 45, 40].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-[#2c2c2c] relative z-0"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex flex-col items-start gap-4">
              <div>
                <div className="text-[15px] font-semibold text-[#e7e7e7] mb-1">
                  Spend cap is enabled
                </div>
                <div className="text-[13px] text-[#8b8b8b] leading-[1.6]">
                  You won't be charged any extra for usage. However, your
                  projects could become unresponsive or enter read only mode if
                  you exceed the included quota.
                </div>
              </div>
              <Button
                variant="outline"
                className="h-8 text-[13px] bg-transparent border-[#2c2c2c] hover:bg-[#2c2c2c] text-[#e7e7e7] transition-colors"
              >
                Change spend cap
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Past Invoices */}
      <div className="flex flex-col lg:flex-row gap-8 pb-10">
        <div className="lg:w-4/12 space-y-3 shrink-0">
          <h3 className="text-[15px] font-medium text-[#e7e7e7]">
            Past Invoices
          </h3>
          <p className="text-[14px] text-[#8b8b8b] leading-[1.6]">
            You get an invoice every time you change your plan or when your
            monthly billing cycle resets.
          </p>
        </div>
        <div className="lg:w-8/12">
          <div className="border border-[#2c2c2c] rounded-xl overflow-hidden bg-[#181818] text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2c2c2c] text-[11px] font-bold text-[#666666] tracking-wider uppercase">
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Invoice Number</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#2c2c2c] last:border-0 hover:bg-[#202020] transition-colors group"
                  >
                    <td className="px-5 py-4 flex items-center gap-3 text-[#e7e7e7] font-medium whitespace-nowrap">
                      <FileText className="w-4 h-4 text-[#666] group-hover:text-[#8b8b8b] transition-colors" />
                      {inv.date}
                    </td>
                    <td className="px-5 py-4 text-[#a3a3a3]">{inv.amount}</td>
                    <td className="px-5 py-4 text-[#a3a3a3] font-mono text-[13px]">
                      {inv.number}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#34b27b]/10 text-[#34b27b] uppercase tracking-wider">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:bg-[#2c2c2c] text-[#666] hover:text-[#e7e7e7]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
