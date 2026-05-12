"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  Eye,
  FileQuestion,
  GripVertical,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Plus,
  Radio,
  Rows3,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TextCursorInput,
  Trash2,
  UserCheck,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = {
  short: { label: "Short answer", Icon: TextCursorInput, placeholder: "Single line response" },
  paragraph: { label: "Paragraph", Icon: Rows3, placeholder: "Long answer response" },
  multiple: { label: "Multiple choice", Icon: Radio, placeholder: "Choose one option" },
  checkbox: { label: "Checkboxes", Icon: CheckCircle2, placeholder: "Choose one or more" },
  dropdown: { label: "Dropdown", Icon: ChevronDown, placeholder: "Select from a list" },
};

const INITIAL_FORMS = [
  {
    id: "frm_access",
    title: "Project access request",
    description: "Collect clause-bound access requests before granting private workspace permissions.",
    status: "Published",
    responses: 18,
    lastSubmission: "Today",
    owner: "Aadit Joshi",
    confidentiality: "Project clause",
  },
  {
    id: "frm_vendor",
    title: "Vendor security intake",
    description: "Capture vendor attestations and security review evidence for the project record.",
    status: "Draft",
    responses: 4,
    lastSubmission: "May 10",
    owner: "Priya Shah",
    confidentiality: "Confidential",
  },
  {
    id: "frm_retrospective",
    title: "Release retrospective",
    description: "Gather structured project feedback from team members after launch.",
    status: "Closed",
    responses: 27,
    lastSubmission: "May 6",
    owner: "Sam Lee",
    confidentiality: "Project members",
  },
];

const INITIAL_QUESTIONS = [
  {
    id: "q1",
    title: "What access do you need?",
    type: "short",
    required: true,
    description: "Keep this specific to project systems and datasets.",
    options: [],
  },
  {
    id: "q2",
    title: "Reason for access",
    type: "paragraph",
    required: true,
    description: "Include the project clause, approver, and expected duration.",
    options: [],
  },
  {
    id: "q3",
    title: "Requested permission level",
    type: "multiple",
    required: true,
    description: "",
    options: ["Viewer", "Contributor", "Maintainer"],
  },
  {
    id: "q4",
    title: "Systems involved",
    type: "checkbox",
    required: false,
    description: "",
    options: ["Vault", "Assets", "Reporting", "SQL"],
  },
];

const RESPONSES = [
  {
    id: "R-1042",
    respondent: "Mira Kapoor",
    submitted: "Today 10:42",
    status: "Needs review",
    access: "Contributor",
    clause: "NDA + launch clause",
  },
  {
    id: "R-1041",
    respondent: "Riley Park",
    submitted: "Yesterday",
    status: "Approved",
    access: "Viewer",
    clause: "Employee clause",
  },
  {
    id: "R-1038",
    respondent: "External partner",
    submitted: "May 9",
    status: "Flagged",
    access: "Maintainer",
    clause: "Pending verification",
  },
];

const RESPONSE_ANSWERS = {
  q1: "Temporary reporting and assets access",
  q2: "Launch audit support for the confidential beta cohort.",
  q3: "Contributor",
  q4: ["Assets", "Reporting"],
};

const STATUS_CLASS = {
  Published: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  Draft: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  Closed: "border-zinc-500/30 bg-zinc-500/15 text-zinc-300",
  "Needs review": "border-amber-500/30 bg-amber-500/15 text-amber-300",
  Approved: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  Flagged: "border-red-500/30 bg-red-500/15 text-red-300",
};

function Metric({ label, value, detail, Icon }) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#a3a3a3]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#e7e7e7]">{value}</p>
          <p className="mt-1 text-xs text-[#737373]">{detail}</p>
        </div>
        <Icon className="h-4 w-4 text-[#737373]" />
      </div>
    </div>
  );
}

function FormList({ forms, selectedFormId, onSelect }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#ededed]">Project forms</p>
          <p className="text-xs text-[#737373]">Confidential collection spaces</p>
        </div>
        <Button size="sm" className="h-8 bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <div className="divide-y divide-[#2a2a2a]">
        {forms.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={() => onSelect(form.id)}
            className={cn(
              "w-full px-4 py-3 text-left transition-colors hover:bg-[#242424]",
              selectedFormId === form.id && "bg-[#242424]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#ededed]">{form.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#737373]">{form.description}</p>
              </div>
              <Badge className={cn("shrink-0 border px-2 py-0.5 text-[11px]", STATUS_CLASS[form.status])}>
                {form.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-[#737373]">
              <span>{form.responses} responses</span>
              <span>{form.confidentiality}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TypeSelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[170px] border-[#2a2a2a] bg-[#181818] text-xs text-[#ededed]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
        {Object.entries(QUESTION_TYPES).map(([key, type]) => {
          const Icon = type.Icon;
          return (
            <SelectItem key={key} value={key} className="text-xs text-[#d4d4d4] focus:bg-[#2a2a2a]">
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

function QuestionEditor({ question, index, active, onSelect, onChange, onDuplicate, onDelete }) {
  const typeMeta = QUESTION_TYPES[question.type] || QUESTION_TYPES.short;
  const TypeIcon = typeMeta.Icon;
  const usesOptions = ["multiple", "checkbox", "dropdown"].includes(question.type);

  return (
    <article
      className={cn(
        "rounded-xl border bg-[#1a1a1a] transition-colors",
        active ? "border-[#4a4a4a]" : "border-[#2a2a2a] hover:border-[#3a3a3a]",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3 p-4">
        <GripVertical className="mt-2 h-4 w-4 shrink-0 text-[#525252]" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              value={question.title}
              onChange={(event) => onChange({ ...question, title: event.target.value })}
              className="!h-10 border-[#2a2a2a] bg-[#202020] text-sm font-medium text-[#ededed]"
            />
            <TypeSelect
              value={question.type}
              onChange={(type) =>
                onChange({
                  ...question,
                  type,
                  options: ["multiple", "checkbox", "dropdown"].includes(type)
                    ? question.options.length > 0
                      ? question.options
                      : ["Option 1"]
                    : [],
                })
              }
            />
          </div>

          <Input
            value={question.description}
            onChange={(event) => onChange({ ...question, description: event.target.value })}
            placeholder="Help text or clause note"
            className="!h-9 border-[#2a2a2a] bg-[#181818] text-xs text-[#a3a3a3] placeholder:text-[#525252]"
          />

          {usesOptions ? (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-[#3a3a3a] text-[10px] text-[#737373]">
                    {optionIndex + 1}
                  </span>
                  <Input
                    value={option}
                    onChange={(event) => {
                      const nextOptions = [...question.options];
                      nextOptions[optionIndex] = event.target.value;
                      onChange({ ...question, options: nextOptions });
                    }}
                    className="!h-8 border-[#2a2a2a] bg-[#181818] text-xs text-[#ededed]"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-[#a3a3a3] hover:bg-[#242424] hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange({ ...question, options: [...question.options, `Option ${question.options.length + 1}`] });
                }}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add option
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-[#737373]">
              <TypeIcon className="mr-2 inline h-3.5 w-3.5" />
              {typeMeta.placeholder}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#2a2a2a] px-4 py-2">
        <span className="text-xs text-[#525252]">Question {index + 1}</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#737373] hover:bg-[#242424] hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#737373] hover:bg-[#242424] hover:text-red-300"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-2 border-l border-[#2a2a2a] pl-3">
            <span className="text-xs text-[#737373]">Required</span>
            <Switch
              checked={question.required}
              onCheckedChange={(required) => onChange({ ...question, required })}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function FormPreview({ form, questions }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <div className="border-b border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-teal-500/25 bg-teal-500/10">
            <LockKeyhole className="h-4 w-4 text-teal-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#ededed]">{form.title}</h3>
            <p className="mt-1 text-xs leading-5 text-[#737373]">{form.description}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-2 text-xs leading-5 text-teal-200">
          Submissions are confidential and bound to this project&apos;s access clause. Identity is verified before review.
        </div>
      </div>
      <div className="space-y-4 p-4">
        {questions.map((question) => {
          const value = RESPONSE_ANSWERS[question.id];
          return (
            <div key={question.id}>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-[#ededed]">{question.title}</p>
                {question.required ? <span className="text-red-300">*</span> : null}
              </div>
              {question.description ? (
                <p className="mt-1 text-xs text-[#737373]">{question.description}</p>
              ) : null}
              {question.type === "paragraph" ? (
                <Textarea
                  value={value || ""}
                  readOnly
                  className="mt-2 min-h-20 border-[#2a2a2a] bg-[#181818] text-sm text-[#a3a3a3]"
                />
              ) : question.options.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {question.options.map((option) => {
                    const selected = Array.isArray(value) ? value.includes(option) : value === option;
                    return (
                      <div
                        key={option}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                          selected
                            ? "border-teal-500/30 bg-teal-500/10 text-teal-200"
                            : "border-[#2a2a2a] bg-[#181818] text-[#737373]",
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-full", selected ? "bg-teal-300" : "bg-[#3a3a3a]")} />
                        {option}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Input
                  value={value || ""}
                  readOnly
                  className="mt-2 !h-9 border-[#2a2a2a] bg-[#181818] text-sm text-[#a3a3a3]"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResponsesPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#ededed]">Responses</p>
          <p className="text-xs text-[#737373]">Review submissions before access or export.</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#242424] hover:text-white">
          Export
        </Button>
      </div>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-[#2a2a2a] bg-[#1a1a1a]">
            <TableHead className="px-4">Respondent</TableHead>
            <TableHead className="hidden px-4 md:table-cell">Access</TableHead>
            <TableHead className="hidden px-4 lg:table-cell">Clause</TableHead>
            <TableHead className="w-[116px] px-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {RESPONSES.map((response) => (
            <TableRow key={response.id} className="border-[#2a2a2a] hover:bg-[#242424]">
              <TableCell className="px-4 py-3">
                <p className="truncate text-sm font-medium text-[#ededed]">{response.respondent}</p>
                <p className="mt-1 text-xs text-[#737373]">{response.submitted}</p>
              </TableCell>
              <TableCell className="hidden px-4 py-3 text-sm text-[#a3a3a3] md:table-cell">{response.access}</TableCell>
              <TableCell className="hidden px-4 py-3 text-sm text-[#a3a3a3] lg:table-cell">{response.clause}</TableCell>
              <TableCell className="px-4 py-3">
                <Badge className={cn("border px-2 py-0.5 text-[11px]", STATUS_CLASS[response.status])}>
                  {response.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SettingsPanel({ settings, onChange }) {
  const rows = [
    {
      key: "membersOnly",
      label: "Project members and approved guests",
      detail: "Rejects submissions from people outside the project clause.",
      Icon: UserCheck,
    },
    {
      key: "verifiedIdentity",
      label: "Require verified identity",
      detail: "Keeps every response attributable for confidential review.",
      Icon: ShieldCheck,
    },
    {
      key: "notifyOwners",
      label: "Notify owners on submission",
      detail: "Sends reviewers a project notification for new responses.",
      Icon: Mail,
    },
    {
      key: "allowEdits",
      label: "Allow respondent edits",
      detail: "Respondents can amend answers until the form closes.",
      Icon: MessageSquareText,
    },
  ];

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
          <Settings2 className="h-4 w-4 text-[#a3a3a3]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#ededed]">Collection controls</p>
          <p className="mt-1 text-xs leading-5 text-[#737373]">
            Configure how confidential submissions are accepted, traced, and reviewed.
          </p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-[#2a2a2a]">
        {rows.map(({ key, label, detail, Icon }) => (
          <div key={key} className="flex items-center gap-3 py-3">
            <Icon className="h-4 w-4 shrink-0 text-[#737373]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#ededed]">{label}</p>
              <p className="mt-0.5 text-xs text-[#737373]">{detail}</p>
            </div>
            <Switch checked={settings[key]} onCheckedChange={(checked) => onChange({ ...settings, [key]: checked })} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewSwitch({ activeView, onChange }) {
  const views = [
    { id: "Builder", Icon: ClipboardList },
    { id: "Preview", Icon: Eye },
    { id: "Responses", Icon: BarChart3 },
    { id: "Settings", Icon: Settings2 },
  ];

  return (
    <div className="flex flex-wrap items-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-0.5">
      {views.map(({ id, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(id)}
          className={cn(
            "h-8 rounded-md px-3 text-xs",
            activeView === id ? "bg-[#2a2a2a] text-white" : "text-[#737373] hover:bg-transparent hover:text-[#a3a3a3]",
          )}
        >
          <Icon className="mr-1.5 h-3.5 w-3.5" />
          {id}
        </Button>
      ))}
    </div>
  );
}

export function FormsScreen() {
  const [forms, setForms] = useState(INITIAL_FORMS);
  const [selectedFormId, setSelectedFormId] = useState(INITIAL_FORMS[0].id);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [activeQuestionId, setActiveQuestionId] = useState(INITIAL_QUESTIONS[0].id);
  const [activeView, setActiveView] = useState("Builder");
  const [settings, setSettings] = useState({
    membersOnly: true,
    verifiedIdentity: true,
    notifyOwners: true,
    allowEdits: false,
  });

  const selectedForm = useMemo(
    () => forms.find((form) => form.id === selectedFormId) || forms[0],
    [forms, selectedFormId],
  );

  const totalResponses = useMemo(
    () => forms.reduce((sum, form) => sum + form.responses, 0),
    [forms],
  );

  const updateSelectedForm = (patch) => {
    setForms((currentForms) =>
      currentForms.map((form) => (form.id === selectedForm.id ? { ...form, ...patch } : form)),
    );
  };

  const updateQuestion = (nextQuestion) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) => (question.id === nextQuestion.id ? nextQuestion : question)),
    );
  };

  const addQuestion = () => {
    const question = {
      id: `q${Date.now()}`,
      title: "Untitled question",
      type: "short",
      required: false,
      description: "",
      options: [],
    };
    setQuestions((currentQuestions) => [...currentQuestions, question]);
    setActiveQuestionId(question.id);
  };

  return (
    <MainScreenWrapper className="space-y-6 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-teal-500/25 bg-teal-500/10">
            <FileQuestion className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">Forms</h1>
            <p className="mt-1 text-[#a3a3a3]">Create confidential forms for project-bound submissions.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" className="border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#242424] hover:text-white">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Forms" value={forms.length} detail="Project collection spaces" Icon={FileQuestion} />
        <Metric label="Responses" value={totalResponses} detail="Across all forms" Icon={BarChart3} />
        <Metric label="Protected" value="100%" detail="Clause-bound intake" Icon={LockKeyhole} />
        <Metric label="Review queue" value="3" detail="Needs owner action" Icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[330px_1fr]">
        <FormList forms={forms} selectedFormId={selectedForm.id} onSelect={setSelectedFormId} />

        <section className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
            <div className="space-y-4 border-b border-[#2a2a2a] p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <Input
                    value={selectedForm.title}
                    onChange={(event) => updateSelectedForm({ title: event.target.value })}
                    className="!h-11 border-[#2a2a2a] bg-[#1a1a1a] text-lg font-semibold text-[#ededed]"
                  />
                  <Textarea
                    value={selectedForm.description}
                    onChange={(event) => updateSelectedForm({ description: event.target.value })}
                    className="min-h-20 border-[#2a2a2a] bg-[#1a1a1a] text-sm leading-6 text-[#a3a3a3]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("border px-2 py-1", STATUS_CLASS[selectedForm.status])}>
                    {selectedForm.status}
                  </Badge>
                  <Badge className="border border-teal-500/25 bg-teal-500/10 px-2 py-1 text-teal-200">
                    <LockKeyhole className="mr-1.5 h-3.5 w-3.5" />
                    {selectedForm.confidentiality}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <ViewSwitch activeView={activeView} onChange={setActiveView} />
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#737373]">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
                    Verified identity
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#a3a3a3]" />
                    Autosaved draft
                  </span>
                </div>
              </div>
            </div>

            {activeView === "Builder" ? (
              <div className="space-y-3 p-4">
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    active={question.id === activeQuestionId}
                    onSelect={() => setActiveQuestionId(question.id)}
                    onChange={updateQuestion}
                    onDuplicate={() => {
                      const duplicate = { ...question, id: `q${Date.now()}`, title: `${question.title} copy` };
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
                      setQuestions((currentQuestions) => currentQuestions.filter((item) => item.id !== question.id));
                    }}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-[#3a3a3a] bg-transparent text-[#a3a3a3] hover:bg-[#242424] hover:text-white"
                  onClick={addQuestion}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add question
                </Button>
              </div>
            ) : null}

            {activeView === "Preview" ? (
              <div className="p-4">
                <FormPreview form={selectedForm} questions={questions} />
              </div>
            ) : null}

            {activeView === "Responses" ? (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Metric label="Submitted" value={selectedForm.responses} detail="This form" Icon={BarChart3} />
                  <Metric label="Approval rate" value="72%" detail="After review" Icon={CheckCircle2} />
                  <Metric label="Flagged" value="1" detail="Clause mismatch" Icon={AlertTriangle} />
                </div>
                <ResponsesPanel />
              </div>
            ) : null}

            {activeView === "Settings" ? (
              <div className="p-4">
                <SettingsPanel settings={settings} onChange={setSettings} />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </MainScreenWrapper>
  );
}
