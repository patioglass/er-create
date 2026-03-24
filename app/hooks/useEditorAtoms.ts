"use client";

import { useAtom } from "jotai";
import {
  tablesAtom,
  viewportOffsetAtom,
  viewportScaleAtom,
  isPanningAtom,
  cardPositionOverridesAtom,
  collapsedTablesAtom,
  draggingTableIdAtom,
  draggingInputTableIdAtom,
  dragOverInputTableIdAtom,
  draggingColumnAtom,
  dragOverColumnAtom,
  ioMessageAtom,
} from "../store/editorAtoms";

export function useEditorAtoms() {
  const [tables, setTables] = useAtom(tablesAtom);
  const [viewportOffset, setViewportOffset] = useAtom(viewportOffsetAtom);
  const [viewportScale, setViewportScale] = useAtom(viewportScaleAtom);
  const [isPanning, setIsPanning] = useAtom(isPanningAtom);
  const [cardPositionOverrides, setCardPositionOverrides] = useAtom(cardPositionOverridesAtom);
  const [collapsedTables, setCollapsedTables] = useAtom(collapsedTablesAtom);
  const [draggingTableId, setDraggingTableId] = useAtom(draggingTableIdAtom);
  const [draggingInputTableId, setDraggingInputTableId] = useAtom(draggingInputTableIdAtom);
  const [dragOverInputTableId, setDragOverInputTableId] = useAtom(dragOverInputTableIdAtom);
  const [draggingColumn, setDraggingColumn] = useAtom(draggingColumnAtom);
  const [dragOverColumn, setDragOverColumn] = useAtom(dragOverColumnAtom);
  const [ioMessage, setIoMessage] = useAtom(ioMessageAtom);

  return {
    tables,
    setTables,
    viewportOffset,
    setViewportOffset,
    viewportScale,
    setViewportScale,
    isPanning,
    setIsPanning,
    cardPositionOverrides,
    setCardPositionOverrides,
    collapsedTables,
    setCollapsedTables,
    draggingTableId,
    setDraggingTableId,
    draggingInputTableId,
    setDraggingInputTableId,
    dragOverInputTableId,
    setDragOverInputTableId,
    draggingColumn,
    setDraggingColumn,
    dragOverColumn,
    setDragOverColumn,
    ioMessage,
    setIoMessage,
  };
}
