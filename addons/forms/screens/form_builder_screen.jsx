"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Copy,
  Eye,
  FileQuestion,
  GripVertical,
  Loader2,
  LockKeyhole,
  Plus,
  Radio,
  Rows3,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TextCursorInput,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = {
  short: { label: "Short answer", Icon: TextCursorInput, placeholder: "Single line text" },
  paragraph: { label: "Paragraph", Icon: Rows3, placeholder: "Long response" },
  multiple: { label: "Multiple choice", Icon: Radio, placeholder: "Choose one option" },
  checkbox: { label: "Checkboxes", Icon: CheckCircle2, placeholder: "Choose multiple options" },
  dropdown: { label: "Dropdown", Icon: ChevronDown, placeholder: "Pick from a menu" },
};

const OPTION_TYPES = new Set(["multiple", "checkbox", "dropdown"]);

const createQuestion = (index = 1) => ({
  id: `q-${Date.now()}-${index}`,
  title: `Question ${index}`,
  type: "short",
  required: true,
  description: "",
  options: [],
});

function TypeSelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full border-border bg-surface-subtle text-xs text-foreground sm:w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-surface-subtle">
        {Object.entries(QUESTION_TYPES).map(([key, type]) => {
          const Icon = type.Icon;
          return (
            <SelectItem key={key} value={key} className="text-xs text-foreground focus:bg-surface-hover">
              <span className="inline-flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" />
                {type.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function QuestionCard({ question, index, active, onSelect, onChange, onDuplicate, onDelete }) {
  const typeMeta = QUESTION_TYPES[question.type] || QUESTION_TYPES.short;
  const TypeIcon = typeMeta.Icon;
  const usesOptions = OPTION_TYPES.has(question.type);

  return (
    <article
      className={cn(
        "border bg-surface-subtle transition-colors",
        active ? "border-border-strong" : "border-border hover:border-border-strong",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3 p-4">
        <GripVertical className="mt-2 h-4 w-4 shrink-0 text-text-tertiary" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <Input
              value={question.title}
              onChange={(event) => onChange({ ...question, title: event.target.value })}
              className="!h-10 border-border bg-surface-card text-sm font-medium text-foreground"
            />
            <TypeSelect
              value={question.type}
              onChange={(type) =>
                onChange({
                  ...question,
                  type,
                  options: OPTION_TYPES.has(type)
                    ? question.options.length > 0
                      ? question.options
                      : ["Option 1", "Option 2"]
                    : [],
                })
              }
            />
          </div>

          <Input
            value={question.description}
            onChange={(event) => onChange({ ...question, description: event.target.value })}
            placeholder="Help text"
            className="!h-9 border-border bg-surface-subtle text-xs text-muted-foreground placeholder:text-text-tertiary"
          />

          {usesOptions ? (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border-strong text-[10px] text-text-secondary">
                    {optionIndex + 1}
                  </span>
                  <Input
                    value={option}
                    onChange={(event) => {
                      const nextOptions = [...question.options];
                      nextOptions[optionIndex] = event.target.value;
                      onChange({ ...question, options: nextOptions });
                    }}
                    className="!h-8 border-border bg-surface-subtle text-xs text-foreground"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-text-secondary hover:bg-surface-active hover:text-red-300"
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange({
                        ...question,
                        options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex),
                      });
                    }}
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:bg-surface-active hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange({ ...question, options: [...question.options, `Option ${question.options.length + 1}`] });
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add option
              </Button>
            </div>
          ) : (
            <div className="border border-dashed border-border bg-surface-subtle px-3 py-2 text-xs text-text-secondary">
              <TypeIcon className="mr-2 inline h-3.5 w-3.5" />
              {typeMeta.placeholder}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-text-tertiary">Question {index + 1}</span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-text-secondary hover:bg-surface-active hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicate question"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-text-secondary hover:bg-surface-active hover:text-red-300"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <span className="text-xs text-text-secondary">Required</span>
            <Switch checked={question.required} onCheckedChange={(required) => onChange({ ...question, required })} />
          </div>
        </div>
      </div>
    </article>
  );
}

function FormPreview({ title, description, questions }) {
  return (
    <aside className="border border-border bg-surface-card">
      <div className="border-b border-border bg-surface-subtle p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-teal-500/25 bg-teal-500/10">
            <LockKeyhole className="h-4 w-4 text-teal-300" />
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-base font-semibold text-foreground">{title || "Untitled form"}</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">{description || "No description"}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <div className="flex items-center gap-1.5">
              <p className="break-words text-sm font-medium text-foreground">{question.title || "Untitled question"}</p>
              {question.required ? <span className="text-red-300">*</span> : null}
            </div>
            {question.description ? <p className="text-xs text-text-secondary">{question.description}</p> : null}
            {question.options.length > 0 ? (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div key={option} className="flex items-center gap-2 border border-border bg-surface-subtle px-3 py-2 text-sm text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-surface-strong" />
                    {option || "Untitled option"}
                  </div>
                ))}
              </div>
            ) : question.type === "paragraph" ? (
              <Textarea readOnly placeholder="Paragraph response" className="min-h-20 border-border bg-surface-subtle" />
            ) : (
              <Input readOnly placeholder="Response" className="!h-9 border-border bg-surface-subtle" />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

function SettingsPanel({ settings, onChange }) {
  const rows = [
    { key: "membersOnly", label: "Project members only", Icon: ShieldCheck },
    { key: "verifiedIdentity", label: "Require verified identity", Icon: LockKeyhole },
    { key: "notifyOwners", label: "Notify owners", Icon: Sparkles },
  ];

  return (
    <section className="border border-border bg-surface-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Settings</h2>
      </div>
      <div className="divide-y divide-border">
        {rows.map(({ key, label, Icon }) => (
          <div key={key} className="flex items-center gap-3 py-3">
            <Icon className="h-4 w-4 text-text-secondary" />
            <span className="min-w-0 flex-1 text-sm text-foreground">{label}</span>
            <Switch checked={settings[key]} onCheckedChange={(checked) => onChange({ ...settings, [key]: checked })} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function FormBuilderScreen({ projectId }) {
  const [title, setTitle] = useState("Untitled form");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([createQuestion(1)]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [settings, setSettings] = useState({
    membersOnly: true,
    verifiedIdentity: true,
    notifyOwners: true,
  });
  const [savingMode, setSavingMode] = useState(null);

  const activeId = activeQuestionId || questions[0]?.id;
  const validQuestionCount = useMemo(
    () => questions.filter((question) => question.title.trim()).length,
    [questions],
  );

  const updateQuestion = (nextQuestion) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) => (question.id === nextQuestion.id ? nextQuestion : question)),
    );
  };

  const addQuestion = () => {
    const question = createQuestion(questions.length + 1);
    setQuestions((currentQuestions) => [...currentQuestions, question]);
    setActiveQuestionId(question.id);
  };

  const saveForm = async (status) => {
    if (!title.trim()) {
      toast.error("Add a form title before saving.");
      return;
    }

    if (validQuestionCount === 0) {
      toast.error("Add at least one question before saving.");
      return;
    }

    setSavingMode(status);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const payload = {
        project_id: projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        schema: {
          version: 1,
          questions: questions.map((question, index) => ({
            ...question,
            order: index,
            title: question.title.trim(),
            description: question.description.trim(),
            options: question.options.map((option) => option.trim()).filter(Boolean),
          })),
        },
        settings,
        created_by: userData?.user?.id || null,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      const { error } = await supabase.from("flow_forms").insert(payload);
      if (error) {
        throw error;
      }

      toast.success(status === "published" ? "Form published." : "Draft saved.");
    } catch (error) {
      toast.error(error?.message || "Unable to save form.");
    } finally {
      setSavingMode(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-4 text-foreground md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-surface-active hover:text-foreground">
              <Link href={`/project/${encodeURIComponent(projectId)}?Forms`} aria-label="Back to forms">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-teal-500/25 bg-teal-500/10">
              <FileQuestion className="h-5 w-5 text-teal-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Form builder</h1>
              <p className="mt-1 text-sm text-muted-foreground">{validQuestionCount} questions</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Badge className="w-fit border border-blue-500/30 bg-blue-500/15 px-2 py-1 text-blue-300">Draft</Badge>
            <Button
              type="button"
              variant="outline"
              className="border-border bg-transparent text-muted-foreground hover:bg-surface-active hover:text-foreground"
              onClick={() => saveForm("draft")}
              disabled={Boolean(savingMode)}
            >
              {savingMode === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save draft
            </Button>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary"
              onClick={() => saveForm("published")}
              disabled={Boolean(savingMode)}
            >
              {savingMode === "published" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </Button>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="min-w-0 space-y-4">
            <section className="border border-border bg-surface-card p-4">
              <div className="space-y-3">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="!h-11 border-border bg-surface-subtle text-lg font-semibold text-foreground"
                  placeholder="Form title"
                />
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-20 border-border bg-surface-subtle text-sm leading-6 text-muted-foreground"
                  placeholder="Form description"
                />
              </div>
            </section>

            <section className="space-y-3">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  active={question.id === activeId}
                  onSelect={() => setActiveQuestionId(question.id)}
                  onChange={updateQuestion}
                  onDuplicate={() => {
                    const duplicate = {
                      ...question,
                      id: `q-${Date.now()}-${index}`,
                      title: `${question.title} copy`,
                    };
                    setQuestions((currentQuestions) => {
                      const insertIndex = currentQuestions.findIndex((item) => item.id === question.id) + 1;
                      return [
                        ...currentQuestions.slice(0, insertIndex),
                        duplicate,
                        ...currentQuestions.slice(insertIndex),
                      ];
                    });
                    setActiveQuestionId(duplicate.id);
                  }}
                  onDelete={() => {
                    setQuestions((currentQuestions) => {
                      const nextQuestions = currentQuestions.filter((item) => item.id !== question.id);
                      return nextQuestions.length > 0 ? nextQuestions : [createQuestion(1)];
                    });
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-border-strong bg-transparent text-muted-foreground hover:bg-surface-active hover:text-foreground"
                onClick={addQuestion}
              >
                <Plus className="h-4 w-4" />
                Add question
              </Button>
            </section>
          </main>

          <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Preview
            </div>
            <FormPreview title={title} description={description} questions={questions} />
            <SettingsPanel settings={settings} onChange={setSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}
