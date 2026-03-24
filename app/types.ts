export type ConstraintValue =
  | ""
  | "PRI"
  | "FK"
  | "NOT NULL"
  | "UNIQUE"
  | "PRI, NOT NULL"
  | "FK, NOT NULL"
  | "UNIQUE, NOT NULL";

export type ColumnDraft = {
  id: string;
  name: string;
  description: string;
  constraint: ConstraintValue;
  dataType: string;
  example: string;
  note: string;
  referenceTableId: string;
  referenceColumnId: string;
};

export type TableDraft = {
  id: string;
  name: string;
  columns: ColumnDraft[];
};

export type RelationDefinition = {
  fromTableId: string;
  fromTable: string;
  fromColumnId: string;
  fromColumn: string;
  toTableId: string;
  toTable: string;
  toColumnId: string;
  toColumn: string;
  sourceCardinality: "1" | "N";
  targetCardinality: "1" | "N";
};

export type ManyToManyDefinition = {
  leftTableId: string;
  leftTable: string;
  rightTableId: string;
  rightTable: string;
  viaTableId: string;
  viaTable: string;
};

export type DiagramResult = {
  tables: TableDraft[];
  relations: RelationDefinition[];
  manyToMany: ManyToManyDefinition[];
  errors: string[];
};

export type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export type CardDragState = {
  pointerId: number;
  tableId: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export type ExportPayload = {
  version: 1;
  exportedAt: string;
  tables: TableDraft[];
  cardPositionOverrides: Record<string, { x: number; y: number }>;
  viewportOffset: { x: number; y: number };
  viewportScale: number;
};
