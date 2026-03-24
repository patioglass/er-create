import { ConstraintValue, TableDraft } from "./types";
import { createColumn } from "./utils";

export const CONSTRAINT_OPTIONS: Array<{ value: ConstraintValue; label: string }> = [
  { value: "", label: "なし" },
  { value: "PRI", label: "PRI" },
  { value: "FK", label: "FK" },
  { value: "NOT NULL", label: "NOT NULL" },
  { value: "UNIQUE", label: "UNIQUE" },
  { value: "PRI, NOT NULL", label: "PRI + NOT NULL" },
  { value: "FK, NOT NULL", label: "FK + NOT NULL" },
  { value: "UNIQUE, NOT NULL", label: "UNIQUE + NOT NULL" },
];

export const TYPE_OPTIONS = ["", "string", "number", "boolean", "date", "datetime", "decimal", "text"];

export const VALID_CONSTRAINTS: ConstraintValue[] = [
  "",
  "PRI",
  "FK",
  "NOT NULL",
  "UNIQUE",
  "PRI, NOT NULL",
  "FK, NOT NULL",
  "UNIQUE, NOT NULL",
];

export const MIN_VIEWPORT_SCALE = 0.2;
export const MAX_VIEWPORT_SCALE = 2;
export const VIEWPORT_SCALE_STEP = 0.1;

export const SAMPLE_TABLES: TableDraft[] = [
  {
    id: "table-user",
    name: "User DB",
    columns: [
      createColumn({ id: "user-id", name: "id", description: "ユーザーID", constraint: "PRI", dataType: "number", example: "1" }),
      createColumn({ id: "user-password", name: "password", description: "パスワード", dataType: "string" }),
      createColumn({ id: "user-email", name: "email", description: "登録メールアドレス", constraint: "NOT NULL", dataType: "string", example: "xxxx@gmail.com" }),
      createColumn({ id: "user-company", name: "company_id", description: "会社ID", constraint: "FK", dataType: "number", example: "12", referenceTableId: "table-company", referenceColumnId: "company-id" }),
      createColumn({ id: "user-created", name: "created_at", description: "作成日時", constraint: "NOT NULL", dataType: "datetime", example: "2026-03-24 10:00:00" }),
    ],
  },
  {
    id: "table-company",
    name: "Company DB",
    columns: [
      createColumn({ id: "company-id", name: "id", description: "会社ID", constraint: "PRI", dataType: "number", example: "12" }),
      createColumn({ id: "company-name", name: "company_name", description: "会社名", constraint: "NOT NULL", dataType: "string", example: "xx株式会社", note: "" }),
      createColumn({ id: "company-created", name: "created_at", description: "作成日時", constraint: "NOT NULL", dataType: "datetime", example: "2026-03-24 10:00:00" }),
    ],
  },
];

export const STORAGE_KEY = "er-create-tables";
export const POSITIONS_KEY = "er-create-card-positions";
