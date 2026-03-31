"use client";

import React, { memo } from "react";
import { getBezierPath, BaseEdge } from "@xyflow/react";

function CenterEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: "#3a3a3a",
        strokeWidth: 1.5,
        ...style,
      }}
    />
  );
}

export default memo(CenterEdge);
