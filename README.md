ER 図プレビューをブラウザ上で生成する Next.js アプリです。

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## できること

- テーブル名を入力して、テーブル単位で追加
- カラム行を `+ カラム追加` で増やしながら入力
- 制約はプルダウンから選択
- `FK` を選ぶと参照テーブルと参照カラムを固定 UI で指定
- 入力内容から ER 図プレビューを即時更新

## 入力項目

- カラム名
- 内容
- 制約
- 型
- 値例
- 補足
- 参照テーブル
- 参照カラム

`参照テーブル` と `参照カラム` は、制約で `FK` を選択した場合に使います。


