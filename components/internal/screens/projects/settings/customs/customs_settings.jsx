"use client";

import React, { useState } from "react";
import {
  Calculator,
  CalendarDays,
  Hash,
  ListChecks,
  Plus,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TextCursorInput,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const FIELD_TYPES = [
  { value: "text", label: "Text", Icon: TextCursorInput },
  { value: "number", label: "Number", Icon: Hash },
  { value: "select", label: "Select", Icon: ListChecks },
  { value: "date", label: "Date", Icon: CalendarDays },
  { value: "boolean", label: "Boolean", Icon: ToggleLeft },
  { value: "formula", label: "Formula", Icon: Calculator },
];

const FIELD_SCOPES = ["Tasks", "Milestones", "Goals", "Projects"];

const DEFAULT_DRAFT = {
  name: "",
  type: "text",
  scope: "Tasks",
  required: false,
  options: "",
};

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
  return <fieldType.Icon className="h-4 w-4 text-[#a3a3a3]" />;
}

function getFieldTypeLabel(type) {
  return FIELD_TYPES.find((item) => item.value === type)?.label || "Text";
}

function FieldStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#737373]">{label}</p>
        <Icon className="h-4 w-4 text-[#737373]" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-[#ededed]">{value}</p>
    </div>
  );
}

export function CustomsCreateFieldButton({ onClick }) {
  return (
    <Button className="bg-white text-black hover:bg-[#e7e7e7]" onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      Create Field
    </Button>
  );
}

export function CustomsSettingsScreen({ isCreateOpen: controlledIsCreateOpen, onCreateOpenChange }) {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [uncontrolledIsCreateOpen, setUncontrolledIsCreateOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const isCreateOpen = controlledIsCreateOpen ?? uncontrolledIsCreateOpen;

  const requiredCount = fields.filter((field) => field.required).length;
  const selectableCount = fields.filter((field) => field.type === "select").length;
  const coveredScopes = FIELD_SCOPES.filter((scope) => fields.some((field) => field.scope === scope));
  const optionsCount = fields.reduce((total, field) => total + field.options.length, 0);

  const resetDraft = () => setDraft(DEFAULT_DRAFT);
  const setCreateOpen = onCreateOpenChange ?? setUncontrolledIsCreateOpen;

  const handleCreateOpenChange = (open) => {
    setCreateOpen(open);
    if (!open) resetDraft();
  };

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
        options:
          draft.type === "select"
            ? draft.options
                .split(",")
                .map((option) => option.trim())
                .filter(Boolean)
            : [],
      },
      ...current,
    ]);
    handleCreateOpenChange(false);
  };

  const removeField = (id) => {
    setFields((current) => current.filter((field) => field.id !== id));
  };

  return (
    <div className="space-y-6 border-t border-[#2a2a2a] pt-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <FieldStat label="Total fields" value={fields.length} icon={ListChecks} />
        <FieldStat label="Required" value={requiredCount} icon={ShieldCheck} />
        <FieldStat label="Select lists" value={selectableCount} icon={ToggleLeft} />
        <FieldStat label="Options" value={optionsCount} icon={Settings2} />
      </div>

      <div>
        <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-[#ededed]">Field Library</h2>
              <p className="mt-1 text-sm text-[#737373]">Reusable definitions available inside project work items.</p>
            </div>
            <Badge className="border-[#2a2a2a] bg-[#202020] text-[#a3a3a3]">{fields.length} Fields</Badge>
          </div>

          {fields.length > 0 ? (
            <div className="divide-y divide-[#2a2a2a]">
              {fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#202020]">
                      <FieldTypeIcon type={field.type} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-[#ededed]">{field.name}</p>
                        {field.required ? (
                          <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-300">Required</Badge>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#737373]">
                        <span>{getFieldTypeLabel(field.type)}</span>
                        <span aria-hidden="true">•</span>
                        <span>{field.scope}</span>
                        {field.options.length > 0 ? (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>{field.options.length} options</span>
                          </>
                        ) : null}
                      </div>
                      {field.options.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {field.options.slice(0, 4).map((option) => (
                            <span key={option} className="rounded-md border border-[#2a2a2a] bg-[#202020] px-2 py-1 text-xs text-[#a3a3a3]">
                              {option}
                            </span>
                          ))}
                          {field.options.length > 4 ? (
                            <span className="rounded-md border border-[#2a2a2a] bg-[#202020] px-2 py-1 text-xs text-[#737373]">
                              +{field.options.length - 4}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <Button variant="outline" size="sm" className="h-8 border-[#333333] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828]">
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#737373] hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#202020]">
                <ListChecks className="h-4 w-4 text-[#a3a3a3]" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#ededed]">No custom fields yet</h3>
              <p className="mt-1 max-w-sm text-sm text-[#737373]">Create your first field to standardize the information teams capture on project work.</p>
              <Button className="mt-4 bg-white text-black hover:bg-[#e7e7e7]" onClick={() => handleCreateOpenChange(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Field
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="bg-[#161616] border-[#2a2a2a] text-[#ededed] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              Create Custom Field
            </DialogTitle>
            <DialogDescription className="text-[#737373]">
              Add a reusable field that can be attached to project work items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm text-[#d4d4d4]">Field name</Label>
              <Input
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Customer impact"
                className="border-[#333333] bg-[#202020] text-[#ededed]"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-[#d4d4d4]">Type</Label>
                <Select value={draft.type} onValueChange={(value) => setDraft((current) => ({ ...current, type: value }))}>
                  <SelectTrigger className="w-full border-[#333333] bg-[#202020] text-[#ededed]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a] text-[#ededed]">
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.Icon className="h-3.5 w-3.5" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#d4d4d4]">Scope</Label>
                <Select value={draft.scope} onValueChange={(value) => setDraft((current) => ({ ...current, scope: value }))}>
                  <SelectTrigger className="w-full border-[#333333] bg-[#202020] text-[#ededed]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a] text-[#ededed]">
                    {FIELD_SCOPES.map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {scope}
                      </SelectItem>
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
                  className="border-[#333333] bg-[#202020] text-[#ededed]"
                />
                <p className="text-xs text-[#737373]">Separate each value with a comma.</p>
              </div>
            ) : null}

            <div className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#202020] p-3">
              <div>
                <p className="text-sm font-medium text-[#ededed]">Required field</p>
                <p className="mt-1 text-xs text-[#737373]">Require a value before completing related records.</p>
              </div>
              <Switch
                checked={draft.required}
                onCheckedChange={(checked) => setDraft((current) => ({ ...current, required: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="text-[#737373] hover:text-[#ededed]" onClick={() => handleCreateOpenChange(false)}>
              Cancel
            </Button>
            <Button className="bg-white text-black hover:bg-[#e7e7e7]" onClick={addField} disabled={!draft.name.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
