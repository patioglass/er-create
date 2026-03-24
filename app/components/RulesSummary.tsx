"use client";

import { getColumnTone } from "../utils";
import { useEditorAtoms } from "../hooks/useEditorAtoms";
import { useEditorActions } from "../hooks/useEditorActions";
import { useDiagramCanvas } from "../hooks/useDiagramCanvas";

export function RulesSummary() {
  const { tables, cardPositionOverrides } = useEditorAtoms();
  const { clearAll } = useEditorActions();
  const { diagram } = useDiagramCanvas({ tables, cardPositionOverrides });

  return (
    <>
      <section className="grid grid-cols-[minmax(0,1fr)_360px] gap-6 my-6">
        <div className="rounded-[28px] border border-black/5 bg-[color:var(--surface-strong)] p-5 shadow-[0_18px_60px_rgba(44,36,24,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">入力内容サマリー</h2>
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                入力中の列を一覧で確認できます。ER 図だけでなく、元の設計表の確認にも使えます。
              </p>
            </div>
            <div className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs text-stone-600">inspect</div>
          </div>
          <div className="mt-5 space-y-4">
            {diagram.tables.map((table) => (
              <div key={`${table.id}-summary`} className="rounded-[22px] border border-stone-200 bg-stone-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">{table.name || "名称未設定テーブル"}</h3>
                  <div className="font-mono text-xs text-stone-500">{table.columns.length} columns</div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <div className="min-w-[760px] rounded-2xl border border-white bg-white">
                    <div className="grid grid-cols-[1.1fr_1fr_150px_130px_1fr_1fr] gap-3 border-b border-stone-200 px-4 py-3 text-xs font-medium text-stone-500">
                      <div>カラム名</div>
                      <div>内容</div>
                      <div>制約</div>
                      <div>型</div>
                      <div>値例</div>
                      <div>補足</div>
                    </div>
                    <div className="divide-y divide-stone-100">
                      {table.columns.map((column) => (
                        <div key={`${column.id}-summary`} className="grid grid-cols-[1.1fr_1fr_150px_130px_1fr_1fr] gap-3 px-4 py-3 text-sm text-slate-700">
                          <div className="font-mono font-medium text-slate-900">{column.name || "-"}</div>
                          <div>{column.description || "-"}</div>
                          <div>
                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] ${getColumnTone(column.constraint)}`}>
                              {column.constraint || "-"}
                            </span>
                          </div>
                          <div className="font-mono text-slate-500">{column.dataType || "-"}</div>
                          <div className="text-slate-500">{column.example || "-"}</div>
                          <div className="text-slate-500">{column.note || "-"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6 rounded-[28px] border border-black/5 bg-[color:var(--surface-strong)] p-5 shadow-[0_18px_60px_rgba(44,36,24,0.08)]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">入力ルール</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              <li>テーブル名はカードごとに 1 つ入力します</li>
              <li>カラムは + カラム追加 で必要な数だけ増やせます</li>
              <li>制約はプルダウンから選択します</li>
              <li>FK を選んだ列だけ参照テーブルと参照カラムが指定できます</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">入力警告</h2>
            <div className="mt-4 space-y-3">
              {diagram.errors.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-800">
                  入力エラーはありません。
                </div>
              ) : (
                diagram.errors.map((error) => (
                  <div key={error} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
                    {error}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:border-red-400 hover:bg-red-100 cursor-pointer w-full"
          >
            入力内容をすべて消す<br />（デフォルトに戻す）
          </button>
        </aside>
      </section>
    </>
  );
}
