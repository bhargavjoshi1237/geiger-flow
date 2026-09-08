"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
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
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  DataTable,
  EmptyState,
  Field,
  ScreenHeader,
  SearchInput,
  StatsBar,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import {
  EXTERNAL_ICON_OPTIONS,
  ExternalLinkIcon,
  normalizeExternalUrl,
} from "@/components/internal/externals/external_links";
import { Loader2 } from "lucide-react";

const DEFAULT_FORM = {
  title: "",
  url: "",
  icon: "ExternalLink",
  textColor: "#737373",
  showOnTopbar: true,
  showOnDashboard: true,
  openInNewTab: true,
};

const PLACEMENT_FILTER_OPTIONS = [
  { value: "all", label: "All Placements" },
  { value: "topbar", label: "Top bar" },
  { value: "dashboard", label: "Dashboard" },
  { value: "newtab", label: "New tab" },
];

function VisibilityBadge({ active, children }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "border-border-strong bg-surface-active text-foreground"
          : "border-border bg-transparent text-text-secondary"
      }
    >
      {children}
    </Badge>
  );
}

export function ExternalsScreen({ links = [], linksLoading = false, onCreateLink, onDeleteLink }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedUrl = normalizeExternalUrl(form.url);
    const title = form.title.trim();

    if (!title || !normalizedUrl) {
      return;
    }

    onCreateLink?.({
      title,
      url: normalizedUrl,
      icon: form.icon,
      textColor: form.textColor,
      showOnTopbar: form.showOnTopbar,
      showOnDashboard: form.showOnDashboard,
      openInNewTab: form.openInNewTab,
    });

    setForm(DEFAULT_FORM);
    setOpen(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return links.filter((link) => {
      if (placement === "topbar" && !link.showOnTopbar) return false;
      if (placement === "dashboard" && !link.showOnDashboard) return false;
      if (placement === "newtab" && !link.openInNewTab) return false;
      if (
        q &&
        !`${link.title} ${link.url}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [links, search, placement]);

  const pager = usePagination(filtered, {
    resetKey: `${search}|${placement}`,
  });

  const stats = useMemo(
    () => [
      { label: "Total links", value: String(links.length), footer: "External links" },
      { label: "Top bar", value: String(links.filter((l) => l.showOnTopbar).length), footer: "Shown on top bar" },
      { label: "Dashboard", value: String(links.filter((l) => l.showOnDashboard).length), footer: "Shown on dashboard" },
      { label: "New tab", value: String(links.filter((l) => l.openInNewTab).length), footer: "Open in new tab" },
    ],
    [links],
  );

  const columns = [
    {
      key: "link",
      header: "Link",
      render: (link) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-subtle">
            <ExternalLinkIcon
              iconName={link.icon}
              className="h-4 w-4"
              style={{ color: link.textColor }}
            />
          </div>
          <span
            className="truncate font-medium"
            style={{ color: link.textColor }}
          >
            {link.title}
          </span>
        </div>
      ),
    },
    {
      key: "url",
      header: "URL",
      render: (link) => (
        <a
          href={link.url}
          target={link.openInNewTab ? "_blank" : undefined}
          rel={link.openInNewTab ? "noreferrer" : undefined}
          onClick={(e) => e.stopPropagation()}
          className="block max-w-[360px] truncate text-muted-foreground hover:text-foreground"
        >
          {link.url}
        </a>
      ),
    },
    {
      key: "placement",
      header: "Placement",
      render: (link) => (
        <div className="flex flex-wrap gap-2">
          <VisibilityBadge active={link.showOnTopbar}>
            Top bar
          </VisibilityBadge>
          <VisibilityBadge active={link.showOnDashboard}>
            Dashboard
          </VisibilityBadge>
          <VisibilityBadge active={link.openInNewTab}>
            New tab
          </VisibilityBadge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (link) => (
        <ActionMenu
          label={`Actions for ${link.title}`}
          items={[
            {
              icon: ExternalLink,
              label: "Open link",
              onSelect: () => window.open(link.url, link.openInNewTab ? "_blank" : "_self", "noopener,noreferrer"),
            },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setDeleteTarget(link),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Externals"
        description="Save app-related external links and choose where they appear."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create external
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={placement}
            onValueChange={setPlacement}
            options={PLACEMENT_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search links…"
        />
      </Toolbar>

      {linksLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading links…
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(link) => link.id}
            onRowClick={(link) => window.open(link.url, link.openInNewTab ? "_blank" : "_self", "noopener,noreferrer")}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Link2}
                  title={links.length ? "No links match your filters" : "No external links yet"}
                  description={
                    links.length
                      ? "Try clearing the search or filters."
                      : "Create one to surface it on the top bar or dashboard."
                  }
                  action={
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create external
                    </Button>
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="links" />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-surface-subtle text-foreground sm:max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Create external link</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Add a link, choose its icon, and decide where it should be shown.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <Field label="Name" htmlFor="external-title">
                <Input
                  id="external-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Documentation"
                  className="border-border bg-surface-card text-foreground placeholder:text-text-secondary"
                  required
                />
              </Field>

              <Field label="URL" htmlFor="external-url">
                <Input
                  id="external-url"
                  value={form.url}
                  onChange={(event) => updateForm("url", event.target.value)}
                  placeholder="https://example.com"
                  className="border-border bg-surface-card text-foreground placeholder:text-text-secondary"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Icon">
                  <Select
                    value={form.icon}
                    onValueChange={(value) => updateForm("icon", value)}
                  >
                    <SelectTrigger className="w-full border-border bg-surface-card text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-surface-card text-foreground">
                      {EXTERNAL_ICON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <ExternalLinkIcon
                            iconName={option.value}
                            className="h-4 w-4"
                          />
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Text color" htmlFor="external-color">
                  <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface-card px-3">
                    <input
                      id="external-color"
                      type="color"
                      value={form.textColor}
                      onChange={(event) =>
                        updateForm("textColor", event.target.value)
                      }
                      className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-sm text-muted-foreground">{form.textColor}</span>
                  </div>
                </Field>
              </div>

              <div className="rounded-lg border border-border bg-surface-card">
                {[
                  ["showOnTopbar", "Show on top bar"],
                  ["showOnDashboard", "Show on dashboard"],
                  ["openInNewTab", "Open in new tab"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <span className="text-sm text-foreground">{label}</span>
                    <Switch
                      checked={form[key]}
                      onCheckedChange={(checked) => updateForm(key, checked)}
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-card p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-subtle">
                  <ExternalLinkIcon
                    iconName={form.icon}
                    className="h-4 w-4"
                    style={{ color: form.textColor }}
                  />
                </div>
                <span className="truncate text-sm font-medium" style={{ color: form.textColor }}>
                  {form.title || "External preview"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save external
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete external link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>
              ? This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) onDeleteLink?.(target.id);
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}
