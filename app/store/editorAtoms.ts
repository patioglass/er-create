import { atom } from "jotai";
import { SAMPLE_TABLES } from "../constants";
import { TableDraft } from "../types";

export const tablesAtom = atom<TableDraft[]>(SAMPLE_TABLES);
export const viewportOffsetAtom = atom({ x: 24, y: 24 });
export const viewportScaleAtom = atom(1);
export const isPanningAtom = atom(false);
export const cardPositionOverridesAtom = atom<Record<string, { x: number; y: number }>>({});
export const collapsedTablesAtom = atom<Record<string, boolean>>({});
export const draggingTableIdAtom = atom<string | null>(null);
export const draggingInputTableIdAtom = atom<string | null>(null);
export const dragOverInputTableIdAtom = atom<string | null>(null);
export const draggingColumnAtom = atom<{ tableId: string; columnId: string } | null>(null);
export const dragOverColumnAtom = atom<{ tableId: string; columnId: string } | null>(null);
export const ioMessageAtom = atom("");
