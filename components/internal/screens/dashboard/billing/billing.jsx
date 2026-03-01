"use client";

import React from "react";
import {
  CreditCard,
  Plus,
  Receipt,
  ExternalLink,
  ShieldCheck,
  Box,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BillingScreen() {
  const invoices = [
    {
      date: "May 2026",
      amount: "$12.00",
      status: "Paid",
      method: "Mastercard •••• 1234",
    },
    {
      date: "April 2026",
      amount: "$45.50",
      status: "Pending",
      method: "Visa •••• 5678",
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-[#e7e7e7]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#e7e7e7] tracking-tight">
          Billing & Invoices
        </h1>
        <button className="bg-[#e7e7e7] hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4 text-black font-bold stroke-[3]" />
          Add Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#474747] transition-all duration-300 flex items-center gap-6 group relative h-32">
          <div className="w-16 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-white ring-offset-[#202020] group-hover:bg-[#2a2a2a] transition-colors overflow-hidden">
            <CreditCard className="w-8 h-8 text-[#737373]" />
          </div>
          <div className="flex-1">
            <div className="text-[#e7e7e7] text-lg font-bold tracking-tight">
              Mastercard •••• 1234
            </div>
            <div className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.05em] mb-1">
              Expires 12/28
            </div>
          </div>
          <button className="text-xs font-bold text-[#e7e7e7] bg-[#2a2a2a] hover:bg-[#333333] px-3 py-1.5 rounded-lg border border-[#333333] transition-all">
            Manage
          </button>
        </div>

        <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#474747] transition-all duration-300 flex items-center gap-6 group relative h-32">
          <div className="w-16 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-white ring-offset-[#202020] group-hover:bg-[#2a2a2a] transition-colors overflow-hidden">
            <Receipt className="w-8 h-8 text-[#737373]" />
          </div>
          <div className="flex-1">
            <div className="text-[#e7e7e7] text-lg font-bold tracking-tight">
              $45.50 Due Soon
            </div>
            <div className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.05em] mb-1">
              Billing Period: May 01-31
            </div>
          </div>
          <button className="text-xs font-bold text-[#e7e7e7] bg-green-500 hover:bg-green-400 px-3 py-1.5 rounded-lg text-black transition-all">
            Pay Now
          </button>
        </div>
      </div>

      <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-[#737373] tracking-widest">
            Billing History
          </h3>
        </div>
        <Table>
          <TableBody>
            {invoices.map((inv, i) => (
              <TableRow key={i} className="border-[#2a2a2a] hover:bg-[#242424]">
                <TableCell>
                  <div className="text-sm font-semibold text-[#e7e7e7]">
                    {inv.date}
                  </div>
                  <div className="text-xs text-[#737373] mt-0.5">
                    {inv.method}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold text-[#e7e7e7]">
                    {inv.amount}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${inv.status === "Paid" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"}`}
                    />
                    <span
                      className={`text-sm font-medium ${inv.status === "Paid" ? "text-green-400" : "text-blue-400"}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <button className="text-xs font-bold text-[#a3a3a3] hover:text-[#e7e7e7] bg-[#1a1a1a] hover:bg-[#2a2a2a] px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:border-[#333333] transition-all flex items-center gap-2 ml-auto">
                    Download Receipt
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
