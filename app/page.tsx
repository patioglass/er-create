"use client";

import { DefinitionInput } from "./components/DefinitionInput";
import { PreviewSection } from "./components/PreviewSection";
import { RulesSummary } from "./components/RulesSummary";
import { useEditorPersistence } from "./hooks/useEditorPersistence";

export default function Home() {
  const { isReady, isHydratingStoredData } = useEditorPersistence();

  if (!isReady) {
    if (!isHydratingStoredData) {
      return null;
    }

    return (
      <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-[color:var(--background)] px-6 py-10 text-slate-900">
        <div className="rounded-2xl border border-stone-200 bg-white/80 px-6 py-4 text-sm font-medium text-stone-700 shadow-sm backdrop-blur">
          読み込み中
        </div>
      </main>
    );
  }

  return (
    <div className="fade-in-soft min-h-screen w-full overflow-x-auto">
      <main className="mx-auto flex min-h-screen min-w-[900px] flex-col px-6 py-5 text-slate-900 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[color:var(--surface)] p-6 backdrop-blur xl:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(31,122,90,0.18),transparent_70%)]" />
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-10">
                <p className="font-mono text-sm uppercase tracking-[0.32em] text-[color:var(--accent)]">ER Create</p>
                <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
                  DBの図をそれっぽく作るツール
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--ink-soft)]">
                  ER図を超厳格に作りたいわけでもないけど、DBを図式したいと思って作ったもの。ネットワーク通信なしで、localStorageでの保存（ブラウザだけ）で完結してます。
                </p>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--ink-soft)]">
                  テーブル同士のリレーションは、外部キー制約を指定すると自動的に線で結ばれます。テーブルやカラムの順序はドラッグで入れ替え可能です。
                </p>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1">
              <DefinitionInput />

              <PreviewSection />
            </div>

            <RulesSummary />
          </div>
        </section>
      </main>
    </div>
  );
}
