import { ColumnDraft, TableDraft, DiagramResult, RelationDefinition, ManyToManyDefinition, ConstraintValue } from "./types";
import { VALID_CONSTRAINTS } from "./constants";

export const createColumn = (overrides?: Partial<ColumnDraft>): ColumnDraft => ({
  id: globalThis.crypto?.randomUUID?.() ?? `column-${Date.now()}-${Math.random()}`,
  name: "",
  description: "",
  constraint: "",
  dataType: "string",
  example: "",
  note: "",
  referenceTableId: "",
  referenceColumnId: "",
  ...overrides,
});

export const createTable = (overrides?: Partial<TableDraft>): TableDraft => ({
  id: globalThis.crypto?.randomUUID?.() ?? `table-${Date.now()}-${Math.random()}`,
  name: "",
  columns: [createColumn()],
  ...overrides,
});

export const moveItem = <T,>(list: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const isForeignKey = (constraint: string) => /(^|,\s*)FK($|,)/i.test(constraint);
export const isOneCardinality = (constraint: string) => /(^|,\s*)(PRI|UNIQUE)($|,)/i.test(constraint);

export const getTableHeight = (table: TableDraft) => 88 + table.columns.length * 36;

export const getColumnTone = (constraint: string) => {
  if (/pri|pk/i.test(constraint)) {
    return "bg-amber-100 text-amber-900 border-amber-200";
  }

  if (isForeignKey(constraint)) {
    return "bg-emerald-100 text-emerald-900 border-emerald-200";
  }

  if (/not null/i.test(constraint)) {
    return "bg-sky-100 text-sky-900 border-sky-200";
  }

  if (/unique/i.test(constraint)) {
    return "bg-violet-100 text-violet-900 border-violet-200";
  }

  return "bg-stone-100 text-stone-700 border-stone-200";
};

export const escapeXml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const getConstraintBadgeColors = (constraint: string) => {
  if (/pri|pk/i.test(constraint)) return { bg: "#fef3c7", border: "#fde68a", text: "#78350f" };
  if (isForeignKey(constraint)) return { bg: "#d1fae5", border: "#a7f3d0", text: "#065f46" };
  if (/not null/i.test(constraint)) return { bg: "#e0f2fe", border: "#bae6fd", text: "#0c4a6e" };
  if (/unique/i.test(constraint)) return { bg: "#ede9fe", border: "#ddd6fe", text: "#4c1d95" };
  return { bg: "#f5f5f4", border: "#e7e5e4", text: "#57534e" };
};

export const normalizeConstraint = (value: unknown): ConstraintValue => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim() as ConstraintValue;
  return VALID_CONSTRAINTS.includes(trimmed) ? trimmed : "";
};

export const normalizeString = (value: unknown) => (typeof value === "string" ? value : "");

export const normalizeColumn = (input: unknown): ColumnDraft => {
  const raw = input as Partial<ColumnDraft>;
  return createColumn({
    id: normalizeString(raw?.id) || createColumn().id,
    name: normalizeString(raw?.name),
    description: normalizeString(raw?.description),
    constraint: normalizeConstraint(raw?.constraint),
    dataType: normalizeString(raw?.dataType) || "string",
    example: normalizeString(raw?.example),
    note: normalizeString(raw?.note),
    referenceTableId: normalizeString(raw?.referenceTableId),
    referenceColumnId: normalizeString(raw?.referenceColumnId),
  });
};

export const normalizeTables = (input: unknown): TableDraft[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((table) => {
    const raw = table as Partial<TableDraft>;
    const normalizedColumns = Array.isArray(raw?.columns) ? raw.columns.map((column) => normalizeColumn(column)) : [];
    return createTable({
      id: normalizeString(raw?.id) || createTable().id,
      name: normalizeString(raw?.name),
      columns: normalizedColumns.length > 0 ? normalizedColumns : [createColumn()],
    });
  });
};

export const normalizeCardPositions = (input: unknown): Record<string, { x: number; y: number }> => {
  if (!input || typeof input !== "object") {
    return {};
  }

  const recordInput = input as Record<string, { x?: unknown; y?: unknown }>;
  const entries = Object.entries(recordInput).filter(
    ([, value]) => typeof value?.x === "number" && Number.isFinite(value.x) && typeof value?.y === "number" && Number.isFinite(value.y),
  );

  return Object.fromEntries(entries.map(([key, value]) => [key, { x: Number(value.x), y: Number(value.y) }]));
};

export const buildDiagram = (tables: TableDraft[]): DiagramResult => {
  const errors: string[] = [];
  const relations: RelationDefinition[] = [];
  const manyToMany: ManyToManyDefinition[] = [];
  const manyToManyKeys = new Set<string>();

  tables.forEach((table, tableIndex) => {
    if (!table.name.trim()) {
      errors.push(`テーブル ${tableIndex + 1} の名前を入力してください`);
    }

    if (table.columns.length === 0) {
      errors.push(`${table.name || `テーブル ${tableIndex + 1}`} にカラムがありません`);
    }

    table.columns.forEach((column, columnIndex) => {
      if (!column.name.trim()) {
        errors.push(`${table.name || `テーブル ${tableIndex + 1}`} の ${columnIndex + 1} 行目にカラム名がありません`);
      }

      if (isForeignKey(column.constraint)) {
        const targetTable = tables.find((candidate) => candidate.id === column.referenceTableId);
        const targetColumn = targetTable?.columns.find((candidate) => candidate.id === column.referenceColumnId);

        if (!targetTable || !targetColumn) {
          errors.push(`${table.name || `テーブル ${tableIndex + 1}`}.${column.name || `column_${columnIndex + 1}`} の参照先を指定してください`);
          return;
        }

        relations.push({
          fromTableId: table.id,
          fromTable: table.name,
          fromColumnId: column.id,
          fromColumn: column.name,
          toTableId: targetTable.id,
          toTable: targetTable.name,
          toColumnId: targetColumn.id,
          toColumn: targetColumn.name,
          sourceCardinality: isOneCardinality(column.constraint) ? "1" : "N",
          targetCardinality: "1",
        });
      }
    });
  });

  tables.forEach((table) => {
    const fkTargets = table.columns
      .filter((column) => isForeignKey(column.constraint))
      .map((column) => column.referenceTableId)
      .filter((tableId): tableId is string => Boolean(tableId));

    const uniqueTargets = [...new Set(fkTargets)].filter((tableId) =>
      tables.some((candidate) => candidate.id === tableId),
    );

    if (uniqueTargets.length < 2) {
      return;
    }

    for (let i = 0; i < uniqueTargets.length; i += 1) {
      for (let j = i + 1; j < uniqueTargets.length; j += 1) {
        const leftId = uniqueTargets[i];
        const rightId = uniqueTargets[j];
        const sorted = [leftId, rightId].sort();
        const key = `${sorted[0]}::${sorted[1]}::${table.id}`;
        if (manyToManyKeys.has(key)) {
          continue;
        }

        const left = tables.find((candidate) => candidate.id === leftId);
        const right = tables.find((candidate) => candidate.id === rightId);
        if (!left || !right) {
          continue;
        }

        manyToMany.push({
          leftTableId: left.id,
          leftTable: left.name,
          rightTableId: right.id,
          rightTable: right.name,
          viaTableId: table.id,
          viaTable: table.name,
        });
        manyToManyKeys.add(key);
      }
    }
  });

  return { tables, relations, manyToMany, errors };
};
