"use client";

import React from "react";
import { SidebarButton } from "../SidebarPrimitives";

export const ActionPlug = ({ icon, label, onClick, active, className }) => {
  return (
    <SidebarButton
      icon={icon}
      label={label}
      onClick={onClick}
      active={active}
      className={className}
    />
  );
};
