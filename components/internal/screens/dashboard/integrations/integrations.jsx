"use client";

import React from "react";
import { Plug, Plus, ExternalLink, ShieldCheck, Box } from "lucide-react";

export function IntegrationsScreen() {
  const integrations = [
    {
      name: "Vercel",
      description: "Deploy with a single command",
      status: "Connected",
      icon: Box,
    },
    {
      name: "Sentry",
      description: "Track errors and monitor performance",
      status: "Not Connected",
      icon: ShieldCheck,
    },
    {
      name: "Stripe",
      description: "Collect payments seamlessly",
      status: "Not Connected",
      icon: Box,
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-primary tracking-tight">
          Integrations
        </h1>
        <div className="bg-surface border-border rounded-sm p-1 shrink-0 flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-sm bg-surface-active text-primary text-sm font-medium">
            All
          </button>
          <button className="px-3 py-1.5 rounded-sm hover:bg-surface-active text-muted hover:text-primary text-sm font-medium transition-colors">
            Connected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((app, i) => (
          <div
            key={i}
            className="bg-surface-elevated border border-subtle rounded-2xl p-6 hover:border-emphasis transition-all duration-300 flex flex-col group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-surface border border-subtle flex items-center justify-center text-primary mb-4 shadow-inner group-hover:border-border-default transition-colors">
                <app.icon className="w-6 h-6 text-text-tertiary" />
              </div>
              <button className="text-zinc-500 hover:text-text-tertiary transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-primary font-semibold text-lg mb-1">
              {app.name}
            </h2>
            <p className="text-text-tertiary text-sm font-medium leading-normal mb-6 flex-1">
              {app.description}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-surface">
              <span
                className={`text-[10px] font-bold tracking-[0.1em] px-2 py-0.5 rounded uppercase border ${
                  app.status === "Connected"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-transparent text-zinc-500 border-subtle"
                }`}
              >
                {app.status}
              </span>
                <button className="text-xs font-bold text-primary bg-surface-active hover:bg-emphasis px-3 py-1.5 rounded-lg border border-emphasis transition-all">
                {app.status === "Connected" ? "Manage" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
