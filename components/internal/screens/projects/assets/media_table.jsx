"use client";

import React, { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Eye,
  Download as DownloadIcon,
  MoreHorizontal,
  Pencil,
  Copy,
  Share2,
  Link2Icon,
  FolderInput,
  ArchiveIcon,
  Trash2,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Home,
  HardDrive,
  Calendar,
  Ruler,
  User,
} from "lucide-react";
import { assetFolders, mediaItems, typeIcons, typeColors } from "./data";
import { SegmentedTabs } from "@/components/internal/shared/segmented_tabs";

const typeFilters = ["All", "Image", "Video", "Document", "Audio", "Archive"];

function FileActionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#525252] hover:text-[#e7e7e7]">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[#1e1e1e] border-[#2a2a2a] text-[#e7e7e7]">
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <Eye className="w-4 h-4 mr-2 text-[#737373]" /> Preview
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <DownloadIcon className="w-4 h-4 mr-2 text-[#737373]" /> Download
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <Pencil className="w-4 h-4 mr-2 text-[#737373]" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <Copy className="w-4 h-4 mr-2 text-[#737373]" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <Share2 className="w-4 h-4 mr-2 text-[#737373]" /> Share
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <Link2Icon className="w-4 h-4 mr-2 text-[#737373]" /> Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <FolderInput className="w-4 h-4 mr-2 text-[#737373]" /> Move to...
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#2a2a2a]" />
        <DropdownMenuItem className="text-sm focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
          <ArchiveIcon className="w-4 h-4 mr-2 text-[#737373]" /> Archive
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm focus:bg-[#242424] text-red-400 focus:text-red-400 cursor-pointer">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FolderTile({ folder, isActive, fileCount, onOpen }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onOpen}
      className={cn(
        "h-auto w-full flex-col items-stretch justify-start rounded-md border p-3.5 text-left transition-colors",
        isActive
          ? "border-[#525252] bg-[#242424]"
          : "border-[#2a2a2a] bg-[#1e1e1e] hover:border-[#3a3a3a] hover:bg-[#242424]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {isActive ? (
            <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#e7e7e7]" />
          ) : (
            <Folder className="mt-0.5 h-4 w-4 shrink-0 text-[#737373]" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#e7e7e7]">{folder.name}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-4 text-[#737373]">{folder.description}</p>
          </div>
        </div>
        <Badge className="shrink-0 border-[#2a2a2a] bg-[#181818] text-[#a3a3a3]">
          {fileCount}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-[#525252]">Updated {folder.updatedAt}</p>
    </Button>
  );
}

function DetailsPane({ selectedItem, onCollapse }) {
  const IconComp = selectedItem ? typeIcons[selectedItem.type] : HardDrive;
  const statusClassName = selectedItem?.status === "Active"
    ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-400"
    : selectedItem?.status === "Draft"
      ? "border-amber-500/15 bg-amber-500/10 text-amber-400"
      : "border-[#333333] bg-[#242424] text-[#a3a3a3]";

  return (
    <aside className="border-t border-[#2a2a2a] bg-[#181818] p-4 xl:border-l xl:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">Asset details</p>
        <div className="flex items-center gap-2">
          {selectedItem?.status ? (
            <Badge className={cn("shrink-0", statusClassName)}>
              {selectedItem.status}
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            title="Collapse asset details"
            className="hidden h-7 w-7 text-[#737373] hover:bg-[#242424] hover:text-[#e7e7e7] xl:inline-flex"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedItem ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#333333] bg-[#242424]">
                <IconComp className={cn("h-5 w-5", typeColors[selectedItem.type])} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium leading-5 text-[#f4f4f4]">{selectedItem.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge className="border-[#333333] bg-[#242424] px-1.5 py-0 text-[11px] text-[#a3a3a3]">
                    {selectedItem.format}
                  </Badge>
                  <span className="text-xs text-[#525252]">{selectedItem.size}</span>
                  <span className="text-xs text-[#525252]">/</span>
                  <span className="text-xs text-[#525252]">{selectedItem.type}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button className="h-8 bg-white text-xs text-black hover:bg-[#e7e7e7]" size="sm">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-[#2a2a2a] bg-transparent text-xs text-[#a3a3a3] hover:bg-[#242424] hover:text-[#e7e7e7]"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-[#2a2a2a] bg-[#1e1e1e]">
            {[
              [User, "Owner", selectedItem.uploadedBy],
              [Calendar, "Uploaded", selectedItem.uploadedAt],
              [Ruler, "Dimensions", selectedItem.dimensions],
              [Eye, "Usage", `${selectedItem.usageCount} uses`],
            ].map(([MetaIcon, label, value]) => (
              <div key={label} className="flex items-center gap-3 border-b border-[#2a2a2a] px-3 py-2.5 last:border-0">
                <MetaIcon className="h-3.5 w-3.5 shrink-0 text-[#737373]" />
                <p className="min-w-20 text-xs text-[#737373]">{label}</p>
                <p className="ml-auto truncate text-right text-xs font-medium text-[#d4d4d4]">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[#737373]">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.tags.map((tag) => (
                <Badge key={tag} className="border-[#2a2a2a] bg-[#202020] px-2 py-0.5 text-xs text-[#a3a3a3]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-[#2a2a2a] bg-[#1e1e1e] p-4 text-center">
          <HardDrive className="mx-auto h-5 w-5 text-[#525252]" />
          <p className="mt-3 text-sm text-[#a3a3a3]">Select an asset to inspect metadata and actions.</p>
        </div>
      )}
    </aside>
  );
}

export function MediaTable() {
  const [currentFolderId, setCurrentFolderId] = useState("all");
  const [selectedId, setSelectedId] = useState(mediaItems[0]?.id);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isFolderPaneCollapsed, setIsFolderPaneCollapsed] = useState(false);
  const [isDetailsPaneCollapsed, setIsDetailsPaneCollapsed] = useState(false);

  const currentFolder = assetFolders.find((folder) => folder.id === currentFolderId);
  const folderCounts = useMemo(() => {
    return assetFolders.reduce((counts, folder) => {
      counts[folder.id] = mediaItems.filter((item) => item.folderId === folder.id).length;
      return counts;
    }, {});
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mediaItems.filter((item) => {
      const inFolder = currentFolderId === "all" || item.folderId === currentFolderId;
      const matchesType = typeFilter === "All" || item.type === typeFilter;
      const matchesQuery = !normalizedQuery
        || item.name.toLowerCase().includes(normalizedQuery)
        || item.uploadedBy.toLowerCase().includes(normalizedQuery)
        || item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return inFolder && matchesType && matchesQuery;
    });
  }, [currentFolderId, query, typeFilter]);

  const selectedItem = visibleItems.find((item) => item.id === selectedId) || visibleItems[0];

  const openFolder = (folderId) => {
    setCurrentFolderId(folderId);
    const firstItem = mediaItems.find((item) => folderId === "all" || item.folderId === folderId);
    setSelectedId(firstItem?.id);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="border-b border-[#2a2a2a] bg-[#1e1e1e] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openFolder("all")}
                className="h-7 px-2 text-[#a3a3a3] hover:bg-[#242424] hover:text-[#e7e7e7]"
              >
                <Home className="h-3.5 w-3.5" />
                Library
              </Button>
              {currentFolder ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-[#525252]" />
                  <span className="rounded-md bg-[#242424] px-2 py-1 text-xs text-[#e7e7e7]">
                    {currentFolder.name}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="relative w-full xl:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets, tags, owners..."
              className="!h-10 border-[#2a2a2a] bg-[#181818] !pl-10 !pr-3 text-sm text-[#e7e7e7] placeholder:text-[#737373] focus-visible:border-[#525252] focus-visible:ring-[#525252]/30"
            />
          </div>
        </div>

        <SegmentedTabs
          tabs={typeFilters}
          value={typeFilter}
          onChange={setTypeFilter}
          className="mt-4"
          buttonClassName="h-8 text-xs"
        />
      </div>

      <div
        className={cn(
          "grid min-h-[520px] grid-cols-1",
          !isFolderPaneCollapsed && !isDetailsPaneCollapsed && "xl:grid-cols-[250px_minmax(0,1fr)_300px]",
          isFolderPaneCollapsed && !isDetailsPaneCollapsed && "xl:grid-cols-[48px_minmax(0,1fr)_300px]",
          !isFolderPaneCollapsed && isDetailsPaneCollapsed && "xl:grid-cols-[250px_minmax(0,1fr)_48px]",
          isFolderPaneCollapsed && isDetailsPaneCollapsed && "xl:grid-cols-[48px_minmax(0,1fr)_48px]",
        )}
      >
        <nav className="border-b border-[#2a2a2a] bg-[#181818] xl:border-b-0 xl:border-r">
          {isFolderPaneCollapsed ? (
            <div className="hidden h-full items-start justify-center p-2 xl:flex">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsFolderPaneCollapsed(false)}
                title="Expand all assets"
                className="h-8 w-8 text-[#737373] hover:bg-[#242424] hover:text-[#e7e7e7]"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => openFolder("all")}
                  className={cn(
                    "h-auto min-w-0 flex-1 justify-start rounded-md border px-3 py-2 text-left hover:bg-[#242424]",
                    currentFolderId === "all"
                      ? "border-[#525252] bg-[#242424] text-[#e7e7e7]"
                      : "border-[#2a2a2a] bg-[#1e1e1e] text-[#a3a3a3]"
                  )}
                >
                  <HardDrive className="h-4 w-4" />
                  All Assets
                  <span className="ml-auto text-xs text-[#737373]">{mediaItems.length}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFolderPaneCollapsed(true)}
                  title="Collapse all assets"
                  className="hidden h-9 w-9 text-[#737373] hover:bg-[#242424] hover:text-[#e7e7e7] xl:inline-flex"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:!grid-cols-1">
                {assetFolders.map((folder) => (
                  <FolderTile
                    key={folder.id}
                    folder={folder}
                    fileCount={folderCounts[folder.id]}
                    isActive={currentFolderId === folder.id}
                    onOpen={() => openFolder(folder.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="min-w-0 overflow-auto">
          <Table>
            <TableHeader className="bg-[#1e1e1e]">
                <TableRow className="border-[#2a2a2a] hover:bg-[#1e1e1e]">
                  <TableHead className="min-w-[260px] text-[#a3a3a3]">Name</TableHead>
                  <TableHead className="hidden min-w-28 text-[#a3a3a3] min-[1320px]:table-cell">Size</TableHead>
                  <TableHead className="hidden min-w-36 text-[#a3a3a3] min-[1320px]:table-cell">Owner</TableHead>
                  <TableHead className="hidden min-w-32 text-[#a3a3a3] min-[1320px]:table-cell">Date</TableHead>
                  <TableHead className="w-10 text-[#a3a3a3]" />
                </TableRow>
              </TableHeader>
            <TableBody>
              {visibleItems.map((item) => {
                const IconComp = typeIcons[item.type];
                const isSelected = item.id === selectedItem?.id;

                return (
                  <TableRow
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "border-[#2a2a2a] hover:bg-[#242424] cursor-pointer",
                      isSelected && "bg-[#242424]"
                    )}
                  >
                    <TableCell className="font-medium text-[#e7e7e7]">
                      <div className="flex min-w-[190px] items-center gap-2">
                        <IconComp className={cn("h-4 w-4 shrink-0", typeColors[item.type])} />
                        <span className="truncate">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-[#a3a3a3] min-[1320px]:table-cell">{item.size}</TableCell>
                    <TableCell className="hidden whitespace-nowrap text-[#a3a3a3] min-[1320px]:table-cell">{item.uploadedBy}</TableCell>
                    <TableCell className="hidden whitespace-nowrap text-xs text-[#a3a3a3] min-[1320px]:table-cell">{item.uploadedAt}</TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <FileActionsDropdown />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {visibleItems.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center p-6 text-center">
              <div>
                <Search className="mx-auto h-5 w-5 text-[#525252]" />
                <p className="mt-3 text-sm font-medium text-[#e7e7e7]">No assets found</p>
                <p className="mt-1 text-xs text-[#737373]">Try a different folder, search, or type filter.</p>
              </div>
            </div>
          ) : null}
        </div>

        {isDetailsPaneCollapsed ? (
          <aside className="hidden border-t border-[#2a2a2a] bg-[#181818] p-2 xl:flex xl:items-start xl:justify-center xl:border-l xl:border-t-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailsPaneCollapsed(false)}
              title="Expand asset details"
              className="h-8 w-8 text-[#737373] hover:bg-[#242424] hover:text-[#e7e7e7]"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </aside>
        ) : (
          <DetailsPane selectedItem={selectedItem} onCollapse={() => setIsDetailsPaneCollapsed(true)} />
        )}
      </div>
    </div>
  );
}
