# 習慣トラッカー

Forgiveness-First設計の習慣形成アプリケーション

## 特徴

- **習慣強度スコア**: 1日のミスで進捗がリセットされない寛容なスコアリングシステム
- **グラデーショントラッキング**: 完了/未完了だけでなく、部分的な成功も評価
- **スキップ機能**: 正当な理由での休息日を設定可能
- **カレンダービュー**: 月単位で習慣の進捗を可視化
- **統計ダッシュボード**: 習慣の強度や達成率を分析

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **データベース**: SQLite + Prisma ORM
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Radix UI
- **状態管理**: Zustand

## セットアップ

### 必要要件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン（既存の場合はスキップ）
cd /mnt/c/Users/kiri/Documents/Projects/habit-tracker

# 依存関係のインストール
npm install

# データベースのセットアップ
npm run prisma:generate
npm run prisma:push

# 開発サーバーの起動
npm run dev
```

### 起動方法

開発環境で起動する場合：

```bash
cd /mnt/c/Users/kiri/Documents/Projects/habit-tracker && npm install && npm run dev
```

アプリケーションは http://localhost:3000 で利用可能になります。

## 使い方

1. **習慣の追加**: 「習慣を追加」ボタンをクリックして新しい習慣を作成
2. **トラッキングタイプの選択**:
   - バイナリ（完了/未完了）
   - カウント（回数）
   - 時間（分数）
   - パーセンテージ（達成率）
3. **日々の記録**: トップページで習慣をチェック
4. **進捗確認**: カレンダーや統計タブで進捗を確認

## ディレクトリ構造

```
habit-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── ui/               # UIコンポーネント
│   ├── HabitList.tsx     # 習慣リスト
│   ├── HabitForm.tsx     # 習慣作成フォーム
│   ├── CalendarView.tsx  # カレンダービュー
│   └── Statistics.tsx    # 統計ダッシュボード
├── lib/                   # ユーティリティ
├── prisma/               # Prismaスキーマ
│   └── schema.prisma    # データベーススキーマ
├── public/               # 静的ファイル
├── package.json          # 依存関係
├── tsconfig.json         # TypeScript設定
├── next.config.js        # Next.js設定
├── tailwind.config.js    # Tailwind CSS設定
└── README.md            # このファイル
```

## 開発

### データベースの操作

```bash
# Prisma Studioを起動（データベースのGUI）
npm run prisma:studio

# マイグレーションの実行
npm run prisma:migrate
```

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクション起動
npm run start
```

## ライセンス

MIT