"use client";

import { useEffect, useState } from "react";
import { POSITIONS_KEY, STORAGE_KEY } from "../constants";
import { TableDraft } from "../types";
import { useEditorAtoms } from "./useEditorAtoms";

export function useEditorPersistence() {
  const {
    tables,
    setTables,
    cardPositionOverrides,
    setCardPositionOverrides,
  } = useEditorAtoms();
  const [phase, setPhase] = useState<"checking" | "loading" | "ready">("checking");
  const [pendingTablesJson, setPendingTablesJson] = useState<string | null>(null);
  const [pendingPositionsJson, setPendingPositionsJson] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedTables = localStorage.getItem(STORAGE_KEY);
      const savedPositions = localStorage.getItem(POSITIONS_KEY);
      const hasData = Boolean(savedTables || savedPositions);

      if (!hasData) {
        setPhase("ready");
        return;
      }

      setPendingTablesJson(savedTables);
      setPendingPositionsJson(savedPositions);
      setPhase("loading");
    } catch {
      setPhase("ready");
    }
  }, []);

  useEffect(() => {
    if (phase !== "loading") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        if (pendingTablesJson) {
          setTables(JSON.parse(pendingTablesJson) as TableDraft[]);
        }
        if (pendingPositionsJson) {
          setCardPositionOverrides(JSON.parse(pendingPositionsJson) as Record<string, { x: number; y: number }>);
        }
      } catch {
        // Ignore broken saved data and continue with in-memory defaults.
      } finally {
        setPhase("ready");
      }
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pendingPositionsJson, pendingTablesJson, phase, setCardPositionOverrides, setTables]);

  useEffect(() => {
    if (phase !== "ready") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    } catch {}
  }, [phase, tables]);

  useEffect(() => {
    if (phase !== "ready") {
      return;
    }

    try {
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(cardPositionOverrides));
    } catch {}
  }, [cardPositionOverrides, phase]);

  return {
    isReady: phase === "ready",
    isHydratingStoredData: phase === "loading",
  };
}
