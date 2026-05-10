"use client";

import React from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { SidebarButton } from "../SidebarPrimitives";

const ALIGNMENT_CYCLE = ["left", "center", "right"];

const ALIGNMENT_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

export const TextFormattingPlug = ({ data, onChange }) => {
  const bold = data.bold || false;
  const italic = data.italic || false;
  const underline = data.underline || false;
  const textAlign = data.textAlign || "left";

  const nextAlignment =
    ALIGNMENT_CYCLE[
      (ALIGNMENT_CYCLE.indexOf(textAlign) + 1) % ALIGNMENT_CYCLE.length
    ];
  const AlignIcon = ALIGNMENT_ICONS[textAlign];

  return (
    <>
      <SidebarButton
        icon={Bold}
        label="Bold"
        active={bold}
        onClick={() => onChange({ bold: !bold })}
      />
      <SidebarButton
        icon={Italic}
        label="Italic"
        active={italic}
        onClick={() => onChange({ italic: !italic })}
      />
      <SidebarButton
        icon={Underline}
        label="Underline"
        active={underline}
        onClick={() => onChange({ underline: !underline })}
      />
      <SidebarButton
        icon={AlignIcon}
        label="Text Alignment"
        active={textAlign !== "left"}
        onClick={() => onChange({ textAlign: nextAlignment })}
      />
    </>
  );
};
