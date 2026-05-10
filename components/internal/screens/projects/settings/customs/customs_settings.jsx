"use client";

import React, { useState } from "react";
import {
  Calculator,
  CalendarDays,
  Check,
  ChevronDown,
  Hash,
  ListChecks,
  Plus,
  Settings2,
  Tag,
  TextCursorInput,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const FIELD_TYPES = [
  { value: "text", label: "Text", Icon: TextCursorInput },
  { value: "number", label: "Number", Icon: Hash },
  { value: "select", label: "Select", Icon: ListChecks },
  { value: "date", label: "Date", Icon: CalendarDays },
  { value: "boolean", label: "Boolean", Icon: ToggleLeft },
  { value: "formula", label: "Formula", Icon: Calculator },
];

const INITIAL_FIELDS = [
  {
    id: "field_priority",
    name: "Priority",
    type: "select",
    scope: "Tasks",
    required: true,
    options: ["Low", "Medium", "High", "Critical"],
  },
  {
    id: "field_customer_segment",
    name: "Customer Segment",
    type: "select",
    scope: "Projects",
    required: false,
    options: ["Enterprise", "Startup", "Internal"],
  },
  {
    id: "field_risk_score",
    name: "Risk Score",
    type: "number",
    scope: "Milestones",
    required: false,
    options: [],
  },
];

function FieldTypeIcon({ type }) {
  const fieldType = FIELD_TYPES.find((item) => item.value === type) || FIELD_TYPES[0];
  return <fieldType.Icon className="w-4 h-4 text-[#a3a3a3]" />;
}

export function CustomsSettingsScreen() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [draft, setDraft] = useState({
    name: "",
    type: "text",
    scope: "Tasks",
    required: false,
    options: "",
  });

  const addField = () => {
    const name = draft.name.trim();
    if (!name) return;

    setFields((current) => [
      {
        id: `field_${Date.now()}`,
        name,
        type: draft.type,
        scope: draft.scope,
        required: draft.required,
        options: draft.options
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),
      },
      ...current,
    ]);
    setDraft({ name: "", type: "text", scope: "Tasks", required: false, options: "" });
  };

  const removeField = (id) => {
    setFields((current) => current.filter((field) => field.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#ededed]">Project Custom Fields</h2>
              <p className="text-sm text-[#737373] mt-1">Define reusable fields for tasks, milestones, goals, and project records.</p>
            </div>
            <Badge className="bg-[#202020] border-[#2a2a2a] text-[#a3a3a3]">{fields.length} fields</Badge>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {fields.map((field) => (
              <div key={field.id} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#202020] border border-[#2a2a2a] flex items-center justify-center">
                    <FieldTypeIcon type={field.type} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#ededed]">{field.name}</p>
                      {field.required ? (
                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">Required</Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#737373]">
                      <span>{FIELD_TYPES.find((type) => type.value === field.type)?.label}</span>
                      <span>•</span>
                      <span>{field.scope}</span>
                      {field.options.length > 0 ? (
                        <>
                          <span>•</span>
                          <span>{field.options.length} options</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 border-[#333333] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828]">
                    <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                    Configure
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#737373] hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#ededed]">Create Field</h2>
            <p className="text-sm text-[#737373] mt-1">Add a field that can be used across project work items.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-[#d4d4d4]">Field name</Label>
            <Input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Customer impact"
              className="bg-[#202020] border-[#333333] text-[#ededed]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm text-[#d4d4d4]">Type</Label>
              <Select value={draft.type} onValueChange={(value) => setDraft((current) => ({ ...current, type: value }))}>
                <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-[#ededed]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <type.Icon className="w-3.5 h-3.5 mr-2" />
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[#d4d4d4]">Scope</Label>
              <Select value={draft.scope} onValueChange={(value) => setDraft((current) => ({ ...current, scope: value }))}>
                <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-[#ededed]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
                  {["Tasks", "Milestones", "Goals", "Projects"].map((scope) => (
                    <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {draft.type === "select" ? (
            <div className="space-y-2">
              <Label className="text-sm text-[#d4d4d4]">Options</Label>
              <Input
                value={draft.options}
                onChange={(event) => setDraft((current) => ({ ...current, options: event.target.value }))}
                placeholder="Low, Medium, High"
                className="bg-[#202020] border-[#333333] text-[#ededed]"
              />
            </div>
          ) : null}

          <div className="rounded-lg border border-[#2a2a2a] bg-[#202020] p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#ededed]">Required field</p>
              <p className="text-xs text-[#737373] mt-1">Require a value before completing related records.</p>
            </div>
            <Switch
              checked={draft.required}
              onCheckedChange={(checked) => setDraft((current) => ({ ...current, required: checked }))}
            />
          </div>

          <Button className="w-full bg-white text-black hover:bg-[#e7e7e7]" onClick={addField}>
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Field
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ["Field governance", "Use required fields and scope rules to keep records consistent.", Tag],
          ["Calculated values", "Formula fields can summarize risk, impact, cost, or delivery health.", Calculator],
          ["Reusable schema", "Fields are shared across project tables, reports, and dashboards.", Check],
        ].map(([title, description, Icon]) => (
          <div key={title} className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
            <Icon className="w-5 h-5 text-[#737373]" />
            <p className="text-sm font-semibold text-[#ededed] mt-3">{title}</p>
            <p className="text-sm text-[#737373] mt-1">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
