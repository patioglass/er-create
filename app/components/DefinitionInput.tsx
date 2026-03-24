"use client";

import React, { useRef } from "react";
import { ConstraintValue } from "../types";
import { CONSTRAINT_OPTIONS, TYPE_OPTIONS } from "../constants";
import { useEditorAtoms } from "../hooks/useEditorAtoms";
import { useEditorActions } from "../hooks/useEditorActions";

export function DefinitionInput() {
  const {
    tables,
    ioMessage,
    draggingInputTableId,
    dragOverInputTableId,
    collapsedTables,
    draggingColumn,
    dragOverColumn,
  } = useEditorAtoms();
  const {
    exportAsJson,
    handleJsonImport,
    addTable,
    updateTable,
    removeTable,
    toggleTableCollapse,
    addColumn,
    updateColumn,
    removeColumn,
    handleTableDragStart,
    handleTableDragOver,
    handleTableDrop,
    endTableDrag,
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDrop,
    endColumnDrag,
  } = useEditorActions();
  const jsonImportInputRef = useRef<HTMLInputElement | null>(null);
  const getTableShiftStyle = (tableId: string): React.CSSProperties => {
    if (!draggingInputTableId) {
      return {};
    }

    if (tableId === draggingInputTableId) {
      return { opacity: 0.6, transform: "scale(0.99)" };
    }

    if (!dragOverInputTableId || dragOverInputTableId === draggingInputTableId) {
      return {};
    }

    const fromIndex = tables.findIndex((table) => table.id === draggingInputTableId);
    const toIndex = tables.findIndex((table) => table.id === dragOverInputTableId);
    const currentIndex = tables.findIndex((table) => table.id === tableId);

    if (fromIndex < 0 || toIndex < 0 || currentIndex < 0) {
      return {};
    }

    if (fromIndex < toIndex && currentIndex > fromIndex && currentIndex <= toIndex) {
      return { transform: "translateY(-14px)" };
    }

    if (fromIndex > toIndex && currentIndex >= toIndex && currentIndex < fromIndex) {
      return { transform: "translateY(14px)" };
    }

    return {};
  };

  const getColumnShiftStyle = (tableId: string, columnId: string): React.CSSProperties => {
    if (!draggingColumn || draggingColumn.tableId !== tableId) {
      return {};
    }

    if (columnId === draggingColumn.columnId) {
      return { opacity: 0.4 };
    }

    if (!dragOverColumn || dragOverColumn.tableId !== tableId || dragOverColumn.columnId === draggingColumn.columnId) {
      return {};
    }

    const table = tables.find((t) => t.id === tableId);
    if (!table) return {};

    const fromIndex = table.columns.findIndex((col) => col.id === draggingColumn.columnId);
    const toIndex = table.columns.findIndex((col) => col.id === dragOverColumn.columnId);
    const currentIndex = table.columns.findIndex((col) => col.id === columnId);

    if (fromIndex < 0 || toIndex < 0 || currentIndex < 0) {
      return {};
    }

    if (fromIndex < toIndex && currentIndex > fromIndex && currentIndex <= toIndex) {
      return { transform: "translateY(-6px)" };
    }

    if (fromIndex > toIndex && currentIndex >= toIndex && currentIndex < fromIndex) {
      return { transform: "translateY(6px)" };
    }

    return {};
  };

  return (
    <section className="order-2 flex min-h-[760px] flex-col rounded-[28px] border border-black/5 bg-[color:var(--surface-strong)] p-5 shadow-[0_18px_60px_rgba(44,36,24,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">定義入力</h2>
          <p className="mt-1 text-sm leading-6 text-[color:var(--ink-soft)]">
            表形式の行をそのまま埋める UI にしています。
          </p>
          <p className="mt-1 text-xs text-[color:var(--ink-soft)]">{ioMessage}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            ref={jsonImportInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleJsonImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={exportAsJson}
            className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            JSON 出力
          </button>
          <button
            type="button"
            onClick={() => jsonImportInputRef.current?.click()}
            className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            JSON 取込
          </button>
          <button
            type="button"
            onClick={addTable}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
          >
            + テーブル追加
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto pr-1">
        {tables.map((table) => (
          <section
            key={table.id}
            onDragOver={(event) => handleTableDragOver(event, table.id)}
            onDrop={() => handleTableDrop(table.id)}
            style={getTableShiftStyle(table.id)}
            className={`rounded-[24px] border bg-[#fffdfa] p-4 shadow-[0_10px_35px_rgba(69,56,34,0.08)] transition-transform duration-200 ${
              dragOverInputTableId === table.id && draggingInputTableId !== table.id
                ? "border-emerald-400 ring-2 ring-emerald-100"
                : "border-stone-200"
            }`}
          >
            <div
              className={`flex flex-col gap-3 ${collapsedTables[table.id] ? "" : "border-b border-stone-200 pb-4"} lg:flex-row lg:items-center lg:justify-between`}
            >
              <div className="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  draggable
                  onDragStart={() => handleTableDragStart(table.id)}
                  onDragEnd={endTableDrag}
                  className="inline-flex h-10 w-10 cursor-grab items-center justify-center transition active:cursor-grabbing"
                  aria-label="テーブル順序をドラッグして変更"
                  title="ドラッグでテーブル順序を変更"
                >
                  ⋮⋮
                </button>
                <div className="flex-1">
                  <input
                    value={table.name}
                    onChange={(event) =>
                      updateTable(table.id, (currentTable) => ({
                        ...currentTable,
                        name: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    placeholder="User DB"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 self-end lg:self-auto">
                <button
                  type="button"
                  onClick={() => toggleTableCollapse(table.id)}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                >
                  {collapsedTables[table.id] ? "▲ 展開" : "▼ 折りたたむ"}
                </button>
                <button
                  type="button"
                  onClick={() => addColumn(table.id)}
                  className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 transition hover:bg-sky-100"
                >
                  + カラム追加
                </button>
                {tables.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeTable(table.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    削除
                  </button>
                ) : null}
              </div>
            </div>

            {collapsedTables[table.id] ? (
              <div className="mt-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500">
                このテーブルの入力行は折りたたまれています（{table.columns.length} カラム）
              </div>
            ) : (
              <div className="mt-4 overflow-scroll">
                <div className="min-w-[1320px]">
                  <div className="grid grid-cols-[46px_220px_320px_170px_150px_220px_220px_170px_170px_72px] gap-3 px-2 pb-2 text-xs font-medium text-stone-500">
                    <div>移動</div>
                    <div>カラム名</div>
                    <div>内容</div>
                    <div>制約</div>
                    <div>型</div>
                    <div>値例</div>
                    <div>補足</div>
                    <div>参照テーブル</div>
                    <div>参照カラム</div>
                    <div />
                  </div>

                  <div className="space-y-2">
                    {table.columns.map((column) => {
                      const referencedTable = tables.find((candidate) => candidate.id === column.referenceTableId);

                      return (
                        <div
                          key={column.id}
                          onDragOver={(event) => handleColumnDragOver(event, table.id, column.id)}
                          onDrop={() => handleColumnDrop(table.id, column.id)}
                          style={getColumnShiftStyle(table.id, column.id)}
                          className={`grid grid-cols-[46px_220px_320px_170px_150px_220px_220px_170px_170px_72px] gap-3 rounded-[22px] p-1 transition-transform duration-200 ${
                            dragOverColumn?.tableId === table.id &&
                            dragOverColumn?.columnId === column.id &&
                            draggingColumn?.tableId === table.id &&
                            draggingColumn?.columnId !== column.id
                              ? "bg-emerald-50/40 ring-2 ring-emerald-200"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            draggable
                            onDragStart={() => handleColumnDragStart(table.id, column.id)}
                            onDragEnd={endColumnDrag}
                            className="inline-flex h-10 w-10 cursor-grab items-center justify-center rounded-full transition active:cursor-grabbing"
                            aria-label="カラムをドラッグして順序変更"
                          >
                            ⋮
                          </button>

                          <input
                            value={column.name}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                name: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            placeholder="id"
                          />

                          <textarea
                            value={column.description}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                description: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            placeholder="Description"
                            rows={1}
                          />

                          <select
                            value={column.constraint}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                constraint: event.target.value as ConstraintValue,
                              }))
                            }
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          >
                            {CONSTRAINT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <select
                            value={column.dataType}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                dataType: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          >
                            {TYPE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option || "select"}
                              </option>
                            ))}
                          </select>

                          <input
                            value={column.example}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                example: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            placeholder="例: 123"
                          />

                          <textarea
                            value={column.note}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                note: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            placeholder="備考"
                            rows={1}
                          />

                          <select
                            value={column.referenceTableId}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                referenceTableId: event.target.value,
                                referenceColumnId: "",
                              }))
                            }
                            disabled={!/FK/.test(column.constraint)}
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition disabled:bg-stone-100 disabled:text-stone-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">参照なし</option>
                            {tables.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name || "unnamed"}
                              </option>
                            ))}
                          </select>

                          <select
                            value={column.referenceColumnId}
                            onChange={(event) =>
                              updateColumn(table.id, column.id, (curr) => ({
                                ...curr,
                                referenceColumnId: event.target.value,
                              }))
                            }
                            disabled={!/FK/.test(column.constraint) || !referencedTable}
                            className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition disabled:bg-stone-100 disabled:text-stone-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">カラムを選択</option>
                            {referencedTable?.columns.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.name || "unnamed"}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeColumn(table.id, column.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                              aria-label="カラムを削除"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
