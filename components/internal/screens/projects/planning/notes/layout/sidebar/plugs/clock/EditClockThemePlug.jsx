"use client";

import React from "react";
import { SidebarButton } from "../../SidebarPrimitives";
import { Settings2 } from "lucide-react";

export const EditClockThemePlug = ({ onEdit }) => (
  <SidebarButton label="Clock Settings" icon={Settings2} onClick={onEdit} />
);
