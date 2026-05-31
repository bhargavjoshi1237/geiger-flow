"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EXTERNAL_ICON_OPTIONS,
  ExternalLinkIcon,
  normalizeExternalUrl,
} from "@/components/internal/externals/external_links";

const DEFAULT_FORM = {
  title: "",
  url: "",
  icon: "ExternalLink",
  textColor: "#ededed",
  showOnTopbar: true,
  showOnDashboard: true,
  openInNewTab: true,
};

function VisibilityBadge({ active, children }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "border-[#3a3a3a] bg-[#242424] text-[#e7e7e7]"
          : "border-[#2a2a2a] bg-transparent text-[#737373]"
      }
    >
      {children}
    </Badge>
  );
}

export function ExternalsScreen({ links = [], onCreateLink, onDeleteLink }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

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
      id: `${Date.now()}`,
      title,
      url: normalizedUrl,
      icon: form.icon,
      textColor: form.textColor,
      showOnTopbar: form.showOnTopbar,
      showOnDashboard: form.showOnDashboard,
      openInNewTab: form.openInNewTab,
      createdAt: new Date().toISOString(),
    });

    setForm(DEFAULT_FORM);
    setOpen(false);
  };

  return (
    <MainScreenWrapper className="flex flex-col gap-8 space-y-0 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#e7e7e7] tracking-tight">
            Externals
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            Save app-related external links and choose where they appear.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 bg-[#ededed] text-[#161616] hover:bg-white">
              <Plus className="h-4 w-4" />
              Create external
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[#2a2a2a] bg-[#1a1a1a] text-[#ededed] sm:max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <DialogHeader>
                <DialogTitle>Create external link</DialogTitle>
                <DialogDescription className="text-[#a3a3a3]">
                  Add a link, choose its icon, and decide where it should be shown.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="external-title" className="text-[#d4d4d4]">
                    Name
                  </Label>
                  <Input
                    id="external-title"
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder="Documentation"
                    className="border-[#333333] bg-[#202020] text-[#ededed] placeholder:text-[#737373]"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="external-url" className="text-[#d4d4d4]">
                    URL
                  </Label>
                  <Input
                    id="external-url"
                    value={form.url}
                    onChange={(event) => updateForm("url", event.target.value)}
                    placeholder="https://example.com"
                    className="border-[#333333] bg-[#202020] text-[#ededed] placeholder:text-[#737373]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#d4d4d4]">Icon</Label>
                  <Select
                    value={form.icon}
                    onValueChange={(value) => updateForm("icon", value)}
                  >
                    <SelectTrigger className="w-full border-[#333333] bg-[#202020] text-[#ededed]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#202020] text-[#ededed]">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external-color" className="text-[#d4d4d4]">
                    Text color
                  </Label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-[#333333] bg-[#202020] px-3">
                    <input
                      id="external-color"
                      type="color"
                      value={form.textColor}
                      onChange={(event) =>
                        updateForm("textColor", event.target.value)
                      }
                      className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-sm text-[#a3a3a3]">{form.textColor}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#2a2a2a] bg-[#202020]">
                {[
                  ["showOnTopbar", "Show on top bar"],
                  ["showOnDashboard", "Show on dashboard"],
                  ["openInNewTab", "Open in new tab"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 border-b border-[#2a2a2a] px-4 py-3 last:border-b-0"
                  >
                    <span className="text-sm text-[#d4d4d4]">{label}</span>
                    <Switch
                      checked={form[key]}
                      onCheckedChange={(checked) => updateForm(key, checked)}
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#202020] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#333333] bg-[#1a1a1a]">
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#333333] bg-[#202020] text-[#ededed] hover:bg-[#2a2a2a]"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#ededed] text-[#161616] hover:bg-white">
                  Save external
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#202020]">
        {links.length === 0 ? (
          <div className="p-12 text-center">
            <ExternalLink className="mx-auto mb-3 h-7 w-7 text-[#525252]" />
            <p className="text-sm font-medium text-[#e7e7e7]">No external links yet</p>
            <p className="mt-1 text-xs text-[#737373]">
              Create one to surface it on the top bar or dashboard.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#333333] bg-[#1a1a1a]">
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
                    </TableCell>
                    <TableCell>
                      <a
                        href={link.url}
                        target={link.openInNewTab ? "_blank" : undefined}
                        rel={link.openInNewTab ? "noreferrer" : undefined}
                        className="block max-w-[360px] truncate text-[#a3a3a3] hover:text-[#ededed]"
                      >
                        {link.url}
                      </a>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-[#737373] hover:bg-[#2a2a2a] hover:text-[#ededed]"
                        onClick={() => onDeleteLink?.(link.id)}
                        aria-label={`Delete ${link.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </MainScreenWrapper>
  );
}
