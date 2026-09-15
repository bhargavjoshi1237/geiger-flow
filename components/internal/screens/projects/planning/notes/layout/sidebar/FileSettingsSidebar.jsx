"use client";

import React, { useState } from "react";
import { Download, Upload, FileText } from "lucide-react";
import { SidebarShell, SidebarSection } from "./SidebarPrimitives";
import { ActionPlug } from "./plugs/ActionPlug";
import { ColorPlug } from "./plugs/ColorPlug";
import FileChangeDialog from "./dialogs/FileChangeDialog";
import { toast } from "../../toast";
import { uploadPlanningNodeFile } from "@/features/planning/storage";

export default function FileSettingsSidebar({
  selectedNode,
  onUpdateNode,
  onBack,
}) {
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);

  if (!selectedNode || selectedNode.type !== "file") return null;

  const updateData = (newData) => {
    onUpdateNode(selectedNode.id, {
      data: { ...selectedNode.data, ...newData },
    });
  };

  const handleDownload = () => {
    const src = selectedNode.data.src;
    if (!src) {
      toast.error("No file to download");
      return;
    }
    window.open(src, "_blank");
  };

  const handleFileChangeSave = async (file) => {
    setIsChangeDialogOpen(false);
    const toastId = toast.loading("Uploading file...");

    try {
      // Storage goes through the planning features layer (auth check ->
      // upload -> public URL); the returned URL lands in the node's data and
      // the board persists it via savePlanningBoard.
      const publicUrl = await uploadPlanningNodeFile(selectedNode.id, file);

      if (!publicUrl) {
        throw new Error("Failed to upload file");
      }

      updateData({
        src: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      toast.success("File uploaded successfully", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file", { id: toastId });
    }
  };

  return (
    <>
      <SidebarShell onBack={onBack} title="File">
        <SidebarSection>
          <ActionPlug
            icon={Upload}
            label="Upload File"
            onClick={() => setIsChangeDialogOpen(true)}
          />
          <ActionPlug
            icon={Download}
            label="Download File"
            onClick={handleDownload}
            disabled={!selectedNode.data.src}
          />
        </SidebarSection>

        <SidebarSection title="Appearance">
          <ColorPlug
            value={selectedNode.data.color}
            onChange={(color) => updateData({ color })}
          />
        </SidebarSection>
      </SidebarShell>

      <FileChangeDialog
        open={isChangeDialogOpen}
        onOpenChange={setIsChangeDialogOpen}
        onSave={handleFileChangeSave}
        currentSrc={selectedNode.data.src}
      />
    </>
  );
}
