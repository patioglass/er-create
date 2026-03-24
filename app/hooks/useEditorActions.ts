"use client";

import { useCallback } from "react";
import {
  SAMPLE_TABLES,
  MAX_VIEWPORT_SCALE,
  MIN_VIEWPORT_SCALE,
  VIEWPORT_SCALE_STEP,
} from "../constants";
import { ColumnDraft, ExportPayload, TableDraft } from "../types";
import {
  createColumn,
  createTable,
  moveItem,
  normalizeCardPositions,
  normalizeTables,
} from "../utils";
import { useEditorAtoms } from "./useEditorAtoms";

export function useEditorActions() {
  const {
    tables,
    setTables,
    viewportOffset,
    setViewportOffset,
    viewportScale,
    setViewportScale,
    cardPositionOverrides,
    setCardPositionOverrides,
    setCollapsedTables,
    draggingInputTableId,
    setDraggingInputTableId,
    setDragOverInputTableId,
    draggingColumn,
    setDraggingColumn,
    setDragOverColumn,
    setIoMessage,
  } = useEditorAtoms();

  const updateTable = useCallback((tableId: string, updater: (table: TableDraft) => TableDraft) => {
    setTables((current) => current.map((table) => (table.id === tableId ? updater(table) : table)));
  }, [setTables]);

  const updateColumn = useCallback((
    tableId: string,
    columnId: string,
    updater: (column: ColumnDraft) => ColumnDraft,
  ) => {
    updateTable(tableId, (table) => ({
      ...table,
      columns: table.columns.map((column) => (column.id === columnId ? updater(column) : column)),
    }));
  }, [updateTable]);

  const addTable = useCallback(() => {
    setTables((current) => [...current, createTable({ name: `New Table ${current.length + 1}` })]);
  }, [setTables]);

  const handleTableDragStart = useCallback((tableId: string) => {
    setDraggingInputTableId(tableId);
    setDragOverInputTableId(tableId);
  }, [setDragOverInputTableId, setDraggingInputTableId]);

  const handleTableDragOver = useCallback((event: React.DragEvent<HTMLElement>, tableId: string) => {
    event.preventDefault();
    setDragOverInputTableId(tableId);
  }, [setDragOverInputTableId]);

  const handleTableDrop = useCallback((tableId: string) => {
    if (!draggingInputTableId || draggingInputTableId === tableId) {
      setDragOverInputTableId(null);
      return;
    }

    setTables((current) => {
      const fromIndex = current.findIndex((table) => table.id === draggingInputTableId);
      const toIndex = current.findIndex((table) => table.id === tableId);
      return moveItem(current, fromIndex, toIndex);
    });

    setDragOverInputTableId(null);
  }, [draggingInputTableId, setDragOverInputTableId, setTables]);

  const endTableDrag = useCallback(() => {
    setDraggingInputTableId(null);
    setDragOverInputTableId(null);
  }, [setDragOverInputTableId, setDraggingInputTableId]);

  const removeTable = useCallback((tableId: string) => {
    setTables((current) => current.filter((table) => table.id !== tableId));
    setCollapsedTables((current) => {
      const next = { ...current };
      delete next[tableId];
      return next;
    });
  }, [setCollapsedTables, setTables]);

  const toggleTableCollapse = useCallback((tableId: string) => {
    setCollapsedTables((current) => ({
      ...current,
      [tableId]: !current[tableId],
    }));
  }, [setCollapsedTables]);

  const addColumn = useCallback((tableId: string) => {
    updateTable(tableId, (table) => ({
      ...table,
      columns: [...table.columns, createColumn()],
    }));
  }, [updateTable]);

  const handleColumnDragStart = useCallback((tableId: string, columnId: string) => {
    setDraggingColumn({ tableId, columnId });
    setDragOverColumn({ tableId, columnId });
  }, [setDragOverColumn, setDraggingColumn]);

  const handleColumnDragOver = useCallback((event: React.DragEvent<HTMLDivElement>, tableId: string, columnId: string) => {
    event.preventDefault();
    setDragOverColumn({ tableId, columnId });
  }, [setDragOverColumn]);

  const handleColumnDrop = useCallback((tableId: string, columnId: string) => {
    if (!draggingColumn || draggingColumn.tableId !== tableId || draggingColumn.columnId === columnId) {
      setDragOverColumn(null);
      return;
    }

    updateTable(tableId, (table) => {
      const fromIndex = table.columns.findIndex((column) => column.id === draggingColumn.columnId);
      const toIndex = table.columns.findIndex((column) => column.id === columnId);

      return {
        ...table,
        columns: moveItem(table.columns, fromIndex, toIndex),
      };
    });

    setDragOverColumn(null);
  }, [draggingColumn, setDragOverColumn, updateTable]);

  const endColumnDrag = useCallback(() => {
    setDraggingColumn(null);
    setDragOverColumn(null);
  }, [setDragOverColumn, setDraggingColumn]);

  const removeColumn = useCallback((tableId: string, columnId: string) => {
    updateTable(tableId, (table) => ({
      ...table,
      columns: table.columns.filter((column) => column.id !== columnId),
    }));
  }, [updateTable]);

  const clearAll = useCallback(() => {
    setTables(
      SAMPLE_TABLES.map((table) => ({
        ...table,
        columns: table.columns.map((column) => ({ ...column })),
      })),
    );
    setCardPositionOverrides({});
    setCollapsedTables({});
  }, [setCardPositionOverrides, setCollapsedTables, setTables]);

  const downloadText = useCallback((filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportAsJson = useCallback(() => {
    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tables,
      cardPositionOverrides,
      viewportOffset,
      viewportScale,
    };

    downloadText(
      `er-create-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8",
    );
    setIoMessage("JSON を出力しました");
  }, [cardPositionOverrides, downloadText, setIoMessage, tables, viewportOffset, viewportScale]);

  const applyImportedState = useCallback((
    nextTables: TableDraft[],
    nextCardPositions: Record<string, { x: number; y: number }> = {},
    nextViewportOffset?: { x: number; y: number },
    nextViewportScale?: number,
  ) => {
    setTables(nextTables.length > 0 ? nextTables : [createTable({ name: "", columns: [createColumn({ dataType: "string" })] })]);
    setCardPositionOverrides(nextCardPositions);
    setCollapsedTables({});
    if (nextViewportOffset && Number.isFinite(nextViewportOffset.x) && Number.isFinite(nextViewportOffset.y)) {
      setViewportOffset(nextViewportOffset);
    }
    if (typeof nextViewportScale === "number" && Number.isFinite(nextViewportScale)) {
      setViewportScale(Math.min(MAX_VIEWPORT_SCALE, Math.max(MIN_VIEWPORT_SCALE, nextViewportScale)));
    }
  }, [setCardPositionOverrides, setCollapsedTables, setTables, setViewportOffset, setViewportScale]);

  const handleJsonImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const parsedPayload = parsed as Partial<ExportPayload>;
      const importedTables = normalizeTables(Array.isArray(parsed) ? parsed : parsedPayload.tables);
      const importedPositions = normalizeCardPositions(Array.isArray(parsed) ? {} : parsedPayload.cardPositionOverrides);
      const importedViewport = Array.isArray(parsed)
        ? undefined
        : {
            x: Number(parsedPayload.viewportOffset?.x ?? 24),
            y: Number(parsedPayload.viewportOffset?.y ?? 24),
          };
      const importedScale = Array.isArray(parsed)
        ? 1
        : Number(parsedPayload.viewportScale ?? 1);

      applyImportedState(importedTables, importedPositions, importedViewport, importedScale);
      setIoMessage(`JSON を読み込みました (${importedTables.length} テーブル)`);
    } catch {
      setIoMessage("JSON の読み込みに失敗しました。ファイル形式を確認してください");
    } finally {
      event.target.value = "";
    }
  }, [applyImportedState, setIoMessage]);

  const adjustViewportScale = useCallback((direction: 1 | -1) => {
    setViewportScale((current) => {
      const next = current + direction * VIEWPORT_SCALE_STEP;
      return Number(Math.min(MAX_VIEWPORT_SCALE, Math.max(MIN_VIEWPORT_SCALE, Number(next.toFixed(2)))).toFixed(2));
    });
  }, [setViewportScale]);

  return {
    updateTable,
    updateColumn,
    addTable,
    handleTableDragStart,
    handleTableDragOver,
    handleTableDrop,
    endTableDrag,
    removeTable,
    toggleTableCollapse,
    addColumn,
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDrop,
    endColumnDrag,
    removeColumn,
    clearAll,
    exportAsJson,
    handleJsonImport,
    adjustViewportScale,
  };
}
