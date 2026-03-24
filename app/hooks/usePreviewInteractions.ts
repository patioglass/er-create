"use client";

import { useRef } from "react";
import { CardDragState, DragState } from "../types";
import { useEditorAtoms } from "./useEditorAtoms";

export function usePreviewInteractions(
  effectivePositions: Record<string, { x: number; y: number; width: number; height: number }>,
) {
  const {
    viewportOffset,
    setViewportOffset,
    viewportScale,
    setIsPanning,
    setDraggingTableId,
    setCardPositionOverrides,
  } = useEditorAtoms();

  const dragStateRef = useRef<DragState | null>(null);
  const cardDragRef = useRef<CardDragState | null>(null);

  const handlePreviewPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewportOffset.x,
      originY: viewportOffset.y,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePreviewPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setViewportOffset({
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY,
    });
  };

  const endPreviewPan = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setIsPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleCardPointerDown = (event: React.PointerEvent<HTMLElement>, tableId: string) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    const pos = effectivePositions[tableId];
    if (!pos) return;

    cardDragRef.current = {
      pointerId: event.pointerId,
      tableId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pos.x,
      originY: pos.y,
    };
    setDraggingTableId(tableId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCardPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = cardDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setCardPositionOverrides((prev) => ({
      ...prev,
      [drag.tableId]: {
        x: drag.originX + (event.clientX - drag.startX) / viewportScale,
        y: drag.originY + (event.clientY - drag.startY) / viewportScale,
      },
    }));
  };

  const endCardDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!cardDragRef.current || cardDragRef.current.pointerId !== event.pointerId) return;
    cardDragRef.current = null;
    setDraggingTableId(null);
  };

  return {
    handlePreviewPointerDown,
    handlePreviewPointerMove,
    endPreviewPan,
    handleCardPointerDown,
    handleCardPointerMove,
    endCardDrag,
  };
}
