"use client";

import React from "react";
import { SidebarButton } from "../SidebarPrimitives";
import { PenLine } from "lucide-react";

export const EditBoardNamePlug = ({ currentName, onEdit }) => {
  return (
    <SidebarButton
      icon={PenLine}
      label="Rename Board"
      onClick={onEdit}
      title={`Rename Board: ${currentName || "Untitled"}`}
    />
  );
};
