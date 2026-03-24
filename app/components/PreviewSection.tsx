"use client";

import { Fragment } from "react";
import { getColumnTone } from "../utils";
import { MIN_VIEWPORT_SCALE, MAX_VIEWPORT_SCALE } from "../constants";
import { useEditorAtoms } from "../hooks/useEditorAtoms";
import { useEditorActions } from "../hooks/useEditorActions";
import { usePreviewInteractions } from "../hooks/usePreviewInteractions";
import { useDiagramCanvas } from "../hooks/useDiagramCanvas";

export function PreviewSection() {
  const { tables, cardPositionOverrides, viewportScale, viewportOffset, isPanning, draggingTableId } = useEditorAtoms();
  const { adjustViewportScale } = useEditorActions();
  const { diagram, canvasWidth, canvasHeight, effectivePositions, getRelationGeometry, exportAsPng } = useDiagramCanvas({
    tables,
    cardPositionOverrides,
  });
  const {
    handlePreviewPointerDown,
    handlePreviewPointerMove,
    endPreviewPan,
    handleCardPointerDown,
    handleCardPointerMove,
    endCardDrag,
  } = usePreviewInteractions(effectivePositions);

  return (
    <section className="order-1 flex min-h-[660px] max-h-[700px] flex-col rounded-[28px] border border-black/5 bg-[color:var(--surface-strong)] p-5 shadow-[0_18px_60px_rgba(44,36,24,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">プレビュー</h2>
          <p className="mt-1 text-sm leading-6 text-[color:var(--ink-soft)]">
            カードをドラッグで個別に移動できます。矢印は 1 / N の関係性とあわせてリアルタイムで追従します。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-1 py-1">
            <button
              type="button"
              onClick={() => adjustViewportScale(-1)}
              disabled={viewportScale <= MIN_VIEWPORT_SCALE}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="ズームアウト"
            >
              −
            </button>
            <div className="min-w-14 text-center font-mono text-xs text-stone-600">
              {Math.round(viewportScale * 100)}%
            </div>
            <button
              type="button"
              onClick={() => adjustViewportScale(1)}
              disabled={viewportScale >= MAX_VIEWPORT_SCALE}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="ズームイン"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={exportAsPng}
            disabled={diagram.tables.length === 0}
            className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            PNG 保存
          </button>
        </div>
      </div>
      <div
        className={`diagram-grid relative flex-1 overflow-hidden rounded-[24px] border border-emerald-950/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,239,0.92))] p-5 select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePreviewPointerDown}
        onPointerMove={handlePreviewPointerMove}
        onPointerUp={endPreviewPan}
        onPointerCancel={endPreviewPan}
        style={{ touchAction: "none" }}
      >
        {diagram.tables.length === 0 ? (
          <div className="flex h-full min-h-[520px] items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm leading-7 text-slate-500">
            テーブルを追加すると、ここに ER 図が描画されます。
          </div>
        ) : (
          <div
            className="relative"
            style={{
              width: `${canvasWidth * viewportScale}px`,
              height: `${canvasHeight * viewportScale}px`,
              transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px)`,
            }}
          >
            <div
              className="relative"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${viewportScale})`,
                transformOrigin: "top left",
              }}
            >
              <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} fill="none">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#1f7a5a" />
                  </marker>
                </defs>
                {diagram.relations.map((relation) => {
                  const geometry = getRelationGeometry(relation, 0, 0);

                  if (!geometry) {
                    return null;
                  }

                  return (
                    <g key={`${relation.fromTableId}-${relation.fromColumnId}-${relation.toTableId}-${relation.toColumnId}`}>
                      <path d={geometry.path} className="link-path" stroke="#1f7a5a" strokeWidth="2.2" markerEnd="url(#arrowhead)" />
                      <text
                        x={geometry.labelX}
                        y={geometry.labelY}
                        fill="#165e46"
                        fontSize="12"
                        textAnchor="middle"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                      >
                        {relation.fromColumn} → {relation.toColumn}
                      </text>
                      <text
                        x={geometry.startLabelX}
                        y={geometry.startLabelY}
                        fill="#0f766e"
                        fontSize="12"
                        fontWeight="700"
                        textAnchor={geometry.startAnchor}
                        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                      >
                        {relation.sourceCardinality}
                      </text>
                      <text
                        x={geometry.endLabelX}
                        y={geometry.endLabelY}
                        fill="#0f766e"
                        fontSize="12"
                        fontWeight="700"
                        textAnchor={geometry.endAnchor}
                        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                      >
                        {relation.targetCardinality}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {diagram.tables.map((table) => {
                const position = effectivePositions[table.id];

                return (
                  <article
                    key={table.id}
                    className="table-card absolute overflow-hidden rounded-[26px] border border-stone-200/90 bg-[#fffdfa]"
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      width: `${position.width}px`,
                      cursor: draggingTableId === table.id ? "grabbing" : "grab",
                      touchAction: "none",
                    }}
                    onPointerDown={(e) => handleCardPointerDown(e, table.id)}
                    onPointerMove={handleCardPointerMove}
                    onPointerUp={endCardDrag}
                    onPointerCancel={endCardDrag}
                  >
                    <div className="border-b border-stone-200 bg-[linear-gradient(135deg,#fdf7ef,#f1eadf)] px-5 py-4">
                      <div className="font-mono text-xs uppercase tracking-[0.22em] text-emerald-700">table</div>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">{table.name || "名称未設定テーブル"}</h3>
                    </div>
                    <div className="grid grid-cols-[1.2fr_1fr_auto] gap-x-3 gap-y-2 px-4 py-4">
                      {table.columns.map((column) => (
                        <Fragment key={column.id}>
                          <div className="truncate font-mono text-[13px] font-medium text-slate-800">
                            {column.name || "(empty)"}
                          </div>
                          <div className="truncate text-[13px] text-slate-500">{column.dataType || "-"}</div>
                          <div>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getColumnTone(column.constraint)}`}>
                              {column.constraint || "optional"}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
