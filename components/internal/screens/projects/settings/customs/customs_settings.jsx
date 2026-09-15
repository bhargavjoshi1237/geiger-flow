"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Switch } from "@geiger/ui";
import {
  EmptyState,
  Field,
  SectionCard,
  StatGrid,
} from "@/components/internal/shared/screen_kit";
import { useProject } from "@/context/project-context";
import {
  createCustomField,
  listCustomFields,
  softDeleteCustomField,
  updateCustomField,
} from "@/features/custom_fields/actions";
import {
  CUSTOM_FIELD_SCOPES,
  DEFAULT_CUSTOM_FIELD_DRAFT,
  getFieldTypeLabel,
} from "@/features/custom_fields/constants";

const FIELD_TYPES = [
  { value: "text", label: "Text", Icon: TextCursorInput },
  { value: "number", label: "Number", Icon: Hash },
  { value: "select", label: "Select", Icon: ListChecks },
  { value: "date", label: "Date", Icon: CalendarDays },
  { value: "boolean", label: "Boolean", Icon: ToggleLeft },
  { value: "formula", label: "Formula", Icon: Calculator },
];

const FIELD_SCOPES = CUSTOM_FIELD_SCOPES;

function FieldTypeIcon({ type }) {
  const fieldType = FIELD_TYPES.find((item) => item.value === type) || FIELD_TYPES[0];
  return <fieldType.Icon className="h-4 w-4 text-muted-foreground" />;
}

export function CustomsCreateFieldButton({ onClick }) {
  return (
    <Button className="bg-primary text-primary-foreground hover:bg-primary" onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      Create Field
    </Button>
  );
}

function draftFromField(field) {
  return {
    name: field.name,
    type: field.type,
    scope: field.scope,
    required: field.required,
    options: field.options.join(", "),
  };
}

export function CustomsSettingsScreen({ isCreateOpen: controlledIsCreateOpen, onCreateOpenChange }) {
  const { project } = useProject();
  const projectId = project?.id ?? null;

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uncontrolledIsCreateOpen, setUncontrolledIsCreateOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_CUSTOM_FIELD_DRAFT);
  const [editingField, setEditingField] = useState(null);
  const [saving, setSaving] = useState(false);
  const isCreateOpen = controlledIsCreateOpen ?? uncontrolledIsCreateOpen;

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) {
        return undefined;
      }
      if (!projectId) {
        setFields([]);
        setLoading(false);
        return undefined;
      }
      setLoading(true);
      return listCustomFields(projectId).then((rows) => {
        if (!active) {
          return;
        }
        setFields(rows ?? []);
        setLoading(false);
      });
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const requiredCount = fields.filter((field) => field.required).length;
  const selectableCount = fields.filter((field) => field.type === "select").length;
  const optionsCount = fields.reduce((total, field) => total + field.options.length, 0);

  const resetDraft = () => {
    setDraft(DEFAULT_CUSTOM_FIELD_DRAFT);
    setEditingField(null);
  };
  const setCreateOpen = onCreateOpenChange ?? setUncontrolledIsCreateOpen;

  const handleCreateOpenChange = (open) => {
    setCreateOpen(open);
    if (!open) resetDraft();
  };

  const openConfigure = (field) => {
    setEditingField(field);
    setDraft(draftFromField(field));
    setCreateOpen(true);
  };

  const parseOptions = (type, raw) =>
    type === "select"
      ? String(raw ?? "")
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean)
      : [];

  const handleSave = async () => {
    const name = draft.name.trim();
    if (!name || !projectId || saving) return;
    setSaving(true);

    if (editingField) {
      const previous = fields.find((field) => field.id === editingField.id);
      const patch = {
        name,
        type: draft.type,
        scope: draft.scope,
        required: draft.required,
        options: parseOptions(draft.type, draft.options),
      };
      setFields((current) =>
        current.map((field) => (field.id === editingField.id ? { ...field, ...patch } : field)),
      );
      const updated = await updateCustomField(editingField.id, patch);
      setSaving(false);
      if (updated) {
        setFields((current) => current.map((field) => (field.id === updated.id ? updated : field)));
        toast.success("Field updated.");
        handleCreateOpenChange(false);
      } else {
        if (previous) {
          setFields((current) => current.map((field) => (field.id === previous.id ? previous : field)));
        }
        toast.error("Couldn't update the field.");
      }
      return;
    }

    const optimistic = {
      id: crypto.randomUUID(),
      projectId,
      name,
      type: draft.type,
      scope: draft.scope,
      required: draft.required,
      options: parseOptions(draft.type, draft.options),
    };
    setFields((current) => [optimistic, ...current]);
    const created = await createCustomField(projectId, optimistic);
    setSaving(false);
    if (created) {
      setFields((current) => current.map((field) => (field.id === created.id ? created : field)));
      toast.success("Field created.");
      handleCreateOpenChange(false);
    } else {
      setFields((current) => current.filter((field) => field.id !== optimistic.id));
      toast.error("Couldn't create the field.");
    }
  };

  const removeField = async (id) => {
    const previous = fields.find((field) => field.id === id);
    setFields((current) => current.filter((field) => field.id !== id));
    const ok = await softDeleteCustomField(id);
    if (!ok) {
      if (previous) setFields((current) => [previous, ...current]);
      toast.error("Couldn't delete the field.");
    } else {
      toast.success("Field deleted.");
    }
  };

  return (
    <div className="space-y-6">
      <StatGrid
        stats={[
          { label: "Total fields", value: String(fields.length), icon: ListChecks },
          { label: "Required", value: String(requiredCount), icon: ShieldCheck },
          { label: "Select lists", value: String(selectableCount), icon: ToggleLeft },
          { label: "Options", value: String(optionsCount), icon: Settings2 },
        ]}
      />

      <SectionCard
        title="Field Library"
        description="Reusable definitions available inside project work items."
        action={
          <Badge className="border-border bg-surface-card text-muted-foreground">
            {fields.length} Fields
          </Badge>
        }
        bodyPadding={false}
      >

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4 animate-pulse" />
              Loading custom fields…
            </div>
          ) : fields.length > 0 ? (
            <div className="divide-y divide-border">
              {fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-card">
                      <FieldTypeIcon type={field.type} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{field.name}</p>
                        {field.required ? (
                          <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-300">Required</Badge>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
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
                            <span key={option} className="rounded-md border border-border bg-surface-card px-2 py-1 text-xs text-muted-foreground">
                              {option}
                            </span>
                          ))}
                          {field.options.length > 4 ? (
                            <span className="rounded-md border border-border bg-surface-card px-2 py-1 text-xs text-text-secondary">
                              +{field.options.length - 4}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-border bg-surface-card text-foreground hover:bg-surface-active"
                      onClick={() => openConfigure(field)}
                    >
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-secondary hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No custom fields yet"
              description="Create your first field to standardize the information teams capture on project work."
              action={
                <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary" onClick={() => handleCreateOpenChange(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Field
                </Button>
              }
            />
          )}
      </SectionCard>

      <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              {editingField ? "Configure Custom Field" : "Create Custom Field"}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              {editingField
                ? "Update the reusable field attached to project work items."
                : "Add a reusable field that can be attached to project work items."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Field label="Field name">
              <Input
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Customer impact"
                className="border-border bg-surface-card text-foreground"
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Type">
                <Select value={draft.type} onValueChange={(value) => setDraft((current) => ({ ...current, type: value }))}>
                  <SelectTrigger className="w-full border-border bg-surface-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-surface-subtle text-foreground">
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
              </Field>
              <Field label="Scope">
                <Select value={draft.scope} onValueChange={(value) => setDraft((current) => ({ ...current, scope: value }))}>
                  <SelectTrigger className="w-full border-border bg-surface-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-surface-subtle text-foreground">
                    {FIELD_SCOPES.map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {draft.type === "select" ? (
              <Field label="Options" hint="Separate each value with a comma.">
                <Input
                  value={draft.options}
                  onChange={(event) => setDraft((current) => ({ ...current, options: event.target.value }))}
                  placeholder="Low, Medium, High"
                  className="border-border bg-surface-card text-foreground"
                />
              </Field>
            ) : null}

            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-card p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Required field</p>
                <p className="mt-1 text-xs text-text-secondary">Require a value before completing related records.</p>
              </div>
              <Switch
                checked={draft.required}
                onCheckedChange={(checked) => setDraft((current) => ({ ...current, required: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="text-text-secondary hover:text-foreground" onClick={() => handleCreateOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary"
              onClick={handleSave}
              disabled={!draft.name.trim() || saving}
            >
              <Plus className="mr-2 h-4 w-4" />
              {saving ? "Saving…" : editingField ? "Save Changes" : "Create Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
