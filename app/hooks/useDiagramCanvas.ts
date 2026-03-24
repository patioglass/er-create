"use client";

import { useCallback, useMemo } from "react";
import { RelationDefinition, TableDraft } from "../types";
import { buildDiagram, escapeXml, getConstraintBadgeColors, getTableHeight } from "../utils";

type EffectivePosition = { x: number; y: number; width: number; height: number };

export type RelationGeometry = {
  path: string;
  labelX: number;
  labelY: number;
  startLabelX: number;
  startLabelY: number;
  endLabelX: number;
  endLabelY: number;
  startAnchor: "start" | "middle" | "end";
  endAnchor: "start" | "middle" | "end";
};

export function useDiagramCanvas({
  tables,
  cardPositionOverrides,
}: {
  tables: TableDraft[];
  cardPositionOverrides: Record<string, { x: number; y: number }>;
}) {
  const diagram = useMemo(() => buildDiagram(tables), [tables]);

  const effectivePositions = useMemo<Record<string, EffectivePosition>>(() => {
    const columnGap = 120;
    const cardWidth = 360;

    const positions = diagram.tables.reduce<Record<string, EffectivePosition>>((accumulator, table, index) => {
      const columnIndex = index % 2;
      const rowIndex = Math.floor(index / 2);
      accumulator[table.id] = {
        x: columnIndex * (cardWidth + columnGap),
        y: rowIndex * 360,
        width: cardWidth,
        height: getTableHeight(table),
      };
      return accumulator;
    }, {});

    return Object.fromEntries(
      diagram.tables.map((table) => {
        const gridPos = positions[table.id];
        const override = cardPositionOverrides[table.id];
        return [table.id, override ? { ...gridPos, x: override.x, y: override.y } : gridPos];
      }),
    );
  }, [cardPositionOverrides, diagram.tables]);

  const canvasWidth = useMemo(() => {
    const rowGap = 56;
    return Math.max(960, ...Object.values(effectivePositions).map((p) => p.x + p.width + rowGap));
  }, [effectivePositions]);

  const canvasHeight = useMemo(() => {
    const rowGap = 56;
    return Math.max(460, ...Object.values(effectivePositions).map((p) => p.y + p.height + rowGap));
  }, [effectivePositions]);

  const relationMetaByKey = useMemo(() => {
    const relationKeys = diagram.relations.map(
      (relation) => `${relation.fromTableId}:${relation.fromColumnId}:${relation.toTableId}:${relation.toColumnId}`,
    );

    const relationPairGroups = diagram.relations.reduce<Record<string, string[]>>((accumulator, relation) => {
      const key = `${relation.fromTableId}->${relation.toTableId}`;
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(`${relation.fromTableId}:${relation.fromColumnId}:${relation.toTableId}:${relation.toColumnId}`);
      return accumulator;
    }, {});

    return Object.fromEntries(
      relationKeys.map((key) => {
        const [fromTableId, , toTableId] = key.split(":");
        const pairKey = `${fromTableId}->${toTableId}`;
        const group = relationPairGroups[pairKey] || [];
        const index = Math.max(0, group.indexOf(key));
        return [key, { index, total: Math.max(1, group.length) }];
      }),
    ) as Record<string, { index: number; total: number }>;
  }, [diagram.relations]);

  const getRelationGeometry = useCallback(
    (relation: RelationDefinition, offsetX: number, offsetY: number): RelationGeometry | null => {
      const source = effectivePositions[relation.fromTableId];
      const target = effectivePositions[relation.toTableId];

      if (!source || !target) {
        return null;
      }

      const sourceTable = diagram.tables.find((table) => table.id === relation.fromTableId);
      const targetTable = diagram.tables.find((table) => table.id === relation.toTableId);
      const sourceColumnIndex = sourceTable?.columns.findIndex((column) => column.id === relation.fromColumnId) ?? -1;
      const targetColumnIndex = targetTable?.columns.findIndex((column) => column.id === relation.toColumnId) ?? -1;

      const sourceCenterX = source.x + source.width / 2;
      const sourceCenterY = source.y + source.height / 2;
      const targetCenterX = target.x + target.width / 2;
      const targetCenterY = target.y + target.height / 2;
      const sourceFromRight = targetCenterX >= sourceCenterX;
      const sourceFromBottom = targetCenterY >= sourceCenterY;

      const sourceRowY = sourceColumnIndex >= 0
        ? source.y + 80 + sourceColumnIndex * 36 + 18
        : source.y + source.height / 2;
      const targetRowY = targetColumnIndex >= 0
        ? target.y + 80 + targetColumnIndex * 36 + 18
        : target.y + target.height / 2;

      const horizontalOverlap = Math.min(source.x + source.width, target.x + target.width) - Math.max(source.x, target.x);
      const verticalGap = Math.abs(targetCenterY - sourceCenterY);
      const horizontalGap = Math.abs(targetCenterX - sourceCenterX);
      const useVerticalRouting = horizontalOverlap > 48 || verticalGap > horizontalGap * 1.15;
      const verticalEdgeOffset = 18;

      const startX = useVerticalRouting
        ? sourceCenterX
        : sourceFromRight
          ? source.x + source.width
          : source.x;
      const endX = useVerticalRouting
        ? targetCenterX
        : sourceFromRight
          ? target.x
          : target.x + target.width;
      const startY = useVerticalRouting
        ? sourceFromBottom
          ? source.y + source.height + verticalEdgeOffset
          : source.y - verticalEdgeOffset
        : sourceRowY;
      const endY = useVerticalRouting
        ? sourceFromBottom
          ? target.y - verticalEdgeOffset
          : target.y + target.height + verticalEdgeOffset
        : targetRowY;

      const metaKey = `${relation.fromTableId}:${relation.fromColumnId}:${relation.toTableId}:${relation.toColumnId}`;
      const laneMeta = relationMetaByKey[metaKey] ?? { index: 0, total: 1 };
      const laneOffset = (laneMeta.index - (laneMeta.total - 1) / 2) * 18;

      const startAbsX = startX + offsetX;
      const startAbsY = startY + offsetY;
      const endAbsX = endX + offsetX;
      const endAbsY = endY + offsetY;

      if (relation.fromTableId === relation.toTableId) {
        const loopTopY = Math.min(startAbsY, endAbsY) - 86 - laneOffset;
        const path = `M ${startAbsX} ${startAbsY} C ${startAbsX + 90} ${loopTopY}, ${endAbsX - 90} ${loopTopY}, ${endAbsX} ${endAbsY}`;

        return {
          path,
          labelX: (startAbsX + endAbsX) / 2,
          labelY: loopTopY - 8,
          startLabelX: startAbsX + 14,
          startLabelY: startAbsY - 8,
          endLabelX: endAbsX - 14,
          endLabelY: endAbsY - 8,
          startAnchor: "start",
          endAnchor: "end",
        };
      }

      if (useVerticalRouting) {
        const verticalDirection = endAbsY >= startAbsY ? 1 : -1;
        const controlOffset = Math.max(90, Math.abs(endAbsY - startAbsY) * 0.36);
        const c1x = startAbsX + laneOffset;
        const c2x = endAbsX + laneOffset;
        const c1y = startAbsY + verticalDirection * controlOffset;
        const c2y = endAbsY - verticalDirection * controlOffset;
        const path = `M ${startAbsX} ${startAbsY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endAbsX} ${endAbsY}`;

        return {
          path,
          labelX: (startAbsX + endAbsX) / 2 + laneOffset,
          labelY: (startAbsY + endAbsY) / 2 - 10,
          startLabelX: startAbsX,
          startLabelY: startAbsY + (sourceFromBottom ? -8 : 18),
          endLabelX: endAbsX,
          endLabelY: endAbsY + (sourceFromBottom ? 18 : -8),
          startAnchor: "middle",
          endAnchor: "middle",
        };
      }

      const direction = endAbsX >= startAbsX ? 1 : -1;
      const controlOffset = Math.max(90, Math.abs(endAbsX - startAbsX) * 0.36);
      const c1x = startAbsX + direction * controlOffset;
      const c2x = endAbsX - direction * controlOffset;
      const c1y = startAbsY + laneOffset;
      const c2y = endAbsY + laneOffset;
      const path = `M ${startAbsX} ${startAbsY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endAbsX} ${endAbsY}`;

      return {
        path,
        labelX: (startAbsX + endAbsX) / 2,
        labelY: (startAbsY + endAbsY) / 2 + laneOffset - 10,
        startLabelX: startAbsX + (sourceFromRight ? 14 : -14),
        startLabelY: startAbsY - 8,
        endLabelX: endAbsX + (sourceFromRight ? -14 : 14),
        endLabelY: endAbsY - 8,
        startAnchor: sourceFromRight ? "start" : "end",
        endAnchor: sourceFromRight ? "end" : "start",
      };
    },
    [diagram.tables, effectivePositions, relationMetaByKey],
  );

  const generateDiagramSVG = useCallback((): string => {
    const padding = 48;
    const allPos = Object.values(effectivePositions);
    if (allPos.length === 0) return "";

    const left = Math.min(...allPos.map((p) => p.x));
    const top = Math.min(...allPos.map((p) => p.y));
    const right = Math.max(...allPos.map((p) => p.x + p.width));
    const bottom = Math.max(...allPos.map((p) => p.y + p.height));
    const svgW = right - left + padding * 2;
    const svgH = bottom - top + padding * 2;
    const ox = -left + padding;
    const oy = -top + padding;
    const headerH = 80;
    const colH = 36;

    const parts: string[] = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`);
    parts.push(`<rect width="${svgW}" height="${svgH}" fill="#faf8f4"/>`);
    parts.push("<defs><marker id=\"arr\" markerWidth=\"10\" markerHeight=\"7\" refX=\"9\" refY=\"3.5\" orient=\"auto\"><polygon points=\"0 0,10 3.5,0 7\" fill=\"#1f7a5a\"/></marker>");

    for (const table of diagram.tables) {
      const safeId = table.id.replace(/[^a-z0-9]/gi, "");
      const pos = effectivePositions[table.id];
      const x = pos.x + ox;
      const y = pos.y + oy;
      const w = pos.width;
      const h = pos.height;
      parts.push(`<linearGradient id="g${safeId}" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#fdf7ef"/><stop offset="100%" stop-color="#f1eadf"/></linearGradient>`);
      parts.push(`<clipPath id="c${safeId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20"/></clipPath>`);
    }
    parts.push("</defs>");

    for (const rel of diagram.relations) {
      const geometry = getRelationGeometry(rel, ox, oy);
      if (!geometry) continue;

      parts.push(`<path d="${geometry.path}" fill="none" stroke="#1f7a5a" stroke-width="2.2" marker-end="url(#arr)"/>`);
      parts.push(`<text x="${geometry.labelX}" y="${geometry.labelY}" fill="#165e46" font-size="11" font-family="monospace" text-anchor="middle">${escapeXml(rel.fromColumn)} → ${escapeXml(rel.toColumn)}</text>`);
      parts.push(`<text x="${geometry.startLabelX}" y="${geometry.startLabelY}" fill="#0f766e" font-size="11" font-family="monospace" font-weight="600" text-anchor="${geometry.startAnchor}">${rel.sourceCardinality}</text>`);
      parts.push(`<text x="${geometry.endLabelX}" y="${geometry.endLabelY}" fill="#0f766e" font-size="11" font-family="monospace" font-weight="600" text-anchor="${geometry.endAnchor}">${rel.targetCardinality}</text>`);
    }

    for (const table of diagram.tables) {
      const safeId = table.id.replace(/[^a-z0-9]/gi, "");
      const pos = effectivePositions[table.id];
      const x = pos.x + ox;
      const y = pos.y + oy;
      const w = pos.width;
      const h = pos.height;

      parts.push(`<rect x="${x + 2}" y="${y + 6}" width="${w}" height="${h}" rx="20" fill="rgba(0,0,0,0.06)"/>`);
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="#fffdfa" stroke="#e7e5e4" stroke-width="1"/>`);
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${headerH}" fill="url(#g${safeId})" clip-path="url(#c${safeId})"/>`);
      parts.push(`<line x1="${x}" y1="${y + headerH}" x2="${x + w}" y2="${y + headerH}" stroke="#e7e5e4" stroke-width="1"/>`);
      parts.push(`<text x="${x + 20}" y="${y + 30}" fill="#1f7a5a" font-size="9" font-family="monospace" font-weight="600" letter-spacing="2">TABLE</text>`);
      parts.push(`<text x="${x + 20}" y="${y + 63}" fill="#0f172a" font-size="17" font-family="sans-serif" font-weight="600">${escapeXml(table.name || "名称未設定テーブル")}</text>`);

      table.columns.forEach((col, i) => {
        const rowY = y + headerH + i * colH;
        const midY = rowY + colH / 2;
        if (i % 2 === 1) {
          parts.push(`<rect x="${x}" y="${rowY}" width="${w}" height="${colH}" fill="rgba(0,0,0,0.012)" clip-path="url(#c${safeId})"/>`);
        }
        if (i > 0) {
          parts.push(`<line x1="${x + 12}" y1="${rowY}" x2="${x + w - 12}" y2="${rowY}" stroke="#e7e5e4" stroke-width="0.5"/>`);
        }
        parts.push(`<text x="${x + 16}" y="${midY + 5}" fill="#1e293b" font-size="12" font-family="monospace" font-weight="500">${escapeXml(col.name || "(empty)")}</text>`);
        parts.push(`<text x="${x + 160}" y="${midY + 5}" fill="#64748b" font-size="12" font-family="sans-serif">${escapeXml(col.dataType || "-")}</text>`);
        if (col.constraint) {
          const bc = getConstraintBadgeColors(col.constraint);
          const bw = Math.max(col.constraint.length * 7 + 16, 40);
          const bh = 20;
          const bx = x + w - 16 - bw;
          const by = midY - bh / 2;
          parts.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="${bc.bg}" stroke="${bc.border}" stroke-width="1"/>`);
          parts.push(`<text x="${bx + bw / 2}" y="${by + 13.5}" fill="${bc.text}" font-size="10" font-family="sans-serif" font-weight="500" text-anchor="middle">${escapeXml(col.constraint)}</text>`);
        }
      });
    }

    parts.push("</svg>");
    return parts.join("\n");
  }, [diagram.relations, diagram.tables, effectivePositions, getRelationGeometry]);

  const exportAsPng = useCallback(() => {
    const svgContent = generateDiagramSVG();
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = "er-diagram.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, [generateDiagramSVG]);

  return {
    diagram,
    effectivePositions,
    canvasWidth,
    canvasHeight,
    getRelationGeometry,
    generateDiagramSVG,
    exportAsPng,
  };
}
