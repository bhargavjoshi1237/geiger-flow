"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Eye, Download as DownloadIcon, ArrowUpDown, MoreHorizontal, Pencil, Copy,
  Share2, Link2Icon, FolderInput, ArchiveIcon, Trash2,
} from "lucide-react";
import { mediaItems, typeIcons, typeColors } from "./data";

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

export function MediaTable() {
  return (
    <div className="border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#1a1a1a]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#242424]">
        <span className="text-sm font-medium text-[#e7e7e7]">Media Library</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#525252] mr-2">{mediaItems.length} Assets</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737373] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]" title="Sort">
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader className="bg-[#1e1e1e]">
          <TableRow className="border-[#2a2a2a] hover:bg-[#1e1e1e]">
            <TableHead className="text-[#a3a3a3]">Name</TableHead>
            <TableHead className="text-[#a3a3a3]">Type</TableHead>
            <TableHead className="text-[#a3a3a3]">Size</TableHead>
            <TableHead className="text-[#a3a3a3]">Uploaded By</TableHead>
            <TableHead className="text-[#a3a3a3]">Date</TableHead>
            <TableHead className="text-[#a3a3a3]">Usage</TableHead>
            <TableHead className="text-[#a3a3a3] w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {mediaItems.map((item) => {
            const IconComp = typeIcons[item.type];
            return (
              <TableRow key={item.id} className="border-[#2a2a2a] hover:bg-[#242424] cursor-pointer">
                <TableCell className="font-medium text-[#e7e7e7]">
                  <div className="flex items-center gap-2">
                    <IconComp className={"w-4 h-4 " + typeColors[item.type]} />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell className="text-[#a3a3a3]">{item.type}</TableCell>
                <TableCell className="text-[#a3a3a3]">{item.size}</TableCell>
                <TableCell className="text-[#a3a3a3]">{item.uploadedBy}</TableCell>
                <TableCell className="text-[#a3a3a3] text-xs">{item.uploadedAt}</TableCell>
                <TableCell className="text-[#a3a3a3]">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.usageCount}
                  </div>
                </TableCell>
                <TableCell>
                  <FileActionsDropdown />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
