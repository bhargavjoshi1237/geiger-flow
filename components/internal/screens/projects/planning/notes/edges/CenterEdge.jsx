import React, { useState } from "react";
import {
  BaseEdge,
  useInternalNode,
  EdgeLabelRenderer,
  useReactFlow,
} from "@xyflow/react";

function getNodeIntersection(controlNode, targetNode) {
  const { width = 0, height = 0 } = targetNode.measured || {};
  const targetPosition = targetNode.internals.positionAbsolute;
  const controlPosition = controlNode.internals.positionAbsolute;

  const targetCenterX = targetPosition.x + width / 2;
  const targetCenterY = targetPosition.y + height / 2;
  const dx = controlPosition.x - targetCenterX;
  const dy = controlPosition.y - targetCenterY;

  if (dx === 0 && dy === 0) {
    return { x: targetCenterX, y: targetCenterY };
  }

  const scale = Math.min(
    Math.abs((width / 2) / (dx || 1)),
    Math.abs((height / 2) / (dy || 1)),
  );

  return {
    x: targetCenterX + dx * scale,
    y: targetCenterY + dy * scale,
  };
}

const CenterEdge = ({
  id,
  source,
  target,
  style,
  markerEnd,
  data,
  selected,
  label,
  labelStyle,
}) => {
  const { setEdges, screenToFlowPosition } = useReactFlow();
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const [isDragging, setIsDragging] = useState(false);

  if (
    !sourceNode ||
    !sourceNode.measured ||
    !targetNode ||
    !targetNode.measured
  ) {
    return null;
  }

  const { width: wA, height: hA } = sourceNode.measured;
  const { x: xA, y: yA } = sourceNode.internals.positionAbsolute;
  const startX = xA + wA / 2;
  const startY = yA + hA / 2;

  const { width: wB, height: hB } = targetNode.measured;
  const { x: xB, y: yB } = targetNode.internals.positionAbsolute;
  const targetCenterX = xB + wB / 2;
  const targetCenterY = yB + hB / 2;

  const midX = (startX + targetCenterX) / 2;
  const midY = (startY + targetCenterY) / 2;

  const offsetX = data?.offset?.x || 0;
  const offsetY = data?.offset?.y || 0;

  const handleX = midX + offsetX;
  const handleY = midY + offsetY;

  const controlNode = {
    measured: { width: 0, height: 0 },
    internals: { positionAbsolute: { x: handleX, y: handleY } },
  };

  const { x: targetX, y: targetY } = getNodeIntersection(
    controlNode,
    targetNode,
  );

  const cpX = 2 * handleX - (startX + targetX) / 2;
  const cpY = 2 * handleY - (startY + targetY) / 2;

  const edgePath = `M ${startX} ${startY} Q ${cpX} ${cpY} ${targetX} ${targetY}`;

  const onPointerDown = (event) => {
    event.stopPropagation();
    event.target.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    event.stopPropagation();

    const { x, y } = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newOffset = { x: x - midX, y: y - midY };

    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === id) {
          return { ...e, data: { ...e.data, offset: newOffset } };
        }
        return e;
      }),
    );
  };

  const onPointerUp = (event) => {
    event.stopPropagation();
    event.target.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, zIndex: 1000 }}
        label={data?.label || label}
        labelX={handleX}
        labelY={handleY}
        labelStyle={{ fill: "#fff", ...labelStyle }}
        labelShowBg
        labelBgStyle={{ fill: "#1e1e1e", color: "#fff" }}
        labelBgPadding={[4, 2]}
        labelBgBorderRadius={4}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${handleX}px, ${handleY}px)`,
              pointerEvents: "all",
              cursor: "grab",
              width: "12px",
              height: "12px",
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              border: "1px solid #777",
              boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
              zIndex: 1002, // Higher than label
            }}
            className="nodrag"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CenterEdge;
