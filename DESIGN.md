# 習慣トラッカー システム設計書

## 1. システムアーキテクチャ

### 全体構成
```
┌─────────────────────────────────────────────────────────────┐
│                         クライアント層                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│   モバイルアプリ  │   ウィジェット   │     ウェブアプリ       │
│  (React Native) │  (iOS/Android)  │      (React)          │
└────────┬────────┴────────┬────────┴────────┬────────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                   ┌────────┴────────┐
                   │  共通コアライブラリ │
                   │  (TypeScript)    │
                   └────────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────┴─────┐     ┌─────┴─────┐    ┌──────┴──────┐
    │ローカルDB │     │  同期エンジン │    │ 分析エンジン  │
    │ (SQLite) │     │  (WebDAV/   │    │    (AI)     │
    └──────────┘     │  Dropbox)   │    └─────────────┘
                     └─────┬─────┘
                           │
                   ┌───────┴────────┐
                   │ クラウドバックエンド │
                   │  (オプショナル)     │
                   └──────────────────┘
```

### アーキテクチャ原則
- **Local-First**: すべてのデータはローカルに保存、オフライン完全動作
- **Progressive Disclosure**: 基本機能から高度機能への段階的開放
- **Forgiveness-First**: 失敗を前提とした寛容な設計
- **Zero-Click Tracking**: 自動記録を優先
- **Cross-Platform**: 単一コードベースで複数プラットフォーム対応

### レイヤー設計

#### 1. プレゼンテーション層
- **React Native**: iOS/Androidアプリ
- **React Web**: プログレッシブウェブアプリ
- **Native Widgets**: iOS Widget Kit / Android Widget

#### 2. アプリケーション層
- **Core Library**: 習慣管理ロジック、スコア計算
- **Sync Engine**: データ同期とコンフリクト解決
- **Analytics Engine**: パターン分析とインサイト生成
- **Notification Service**: コンテキスト認識通知

#### 3. データ層
- **Local Storage**: SQLite（構造化データ）+ JSON（設定）
- **Cloud Storage**: PostgreSQL + Redis（キャッシュ）
- **File Storage**: WebDAV/Dropbox（バックアップ）

## 2. データベーススキーマ

### ローカルデータベース (SQLite)

```sql
-- 習慣定義
CREATE TABLE habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tracking_type TEXT CHECK(tracking_type IN ('binary', 'count', 'time', 'percentage')),
    target_value REAL, -- 目標値（カウント/時間/パーセンテージ用）
    target_unit TEXT, -- 単位（minutes, times, percent等）
    frequency_type TEXT CHECK(frequency_type IN ('daily', 'weekly', 'custom')),
    frequency_days TEXT, -- JSON配列 [1,3,5] = 月水金
    color TEXT,
    icon TEXT,
    reminder_time TEXT, -- HH:MM形式
    reminder_context TEXT, -- JSON（位置情報、アクティビティ等）
    auto_track_source TEXT, -- HealthKit/GoogleFit統合設定
    strength_score REAL DEFAULT 0.0, -- 習慣強度スコア（0-100）
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived BOOLEAN DEFAULT FALSE
);

-- 習慣記録
CREATE TABLE habit_records (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    status TEXT CHECK(status IN ('completed', 'partial', 'skipped', 'missed')),
    value REAL, -- 実際の値（カウント/時間/パーセンテージ）
    completion_rate REAL, -- 完了率（0.0-1.0）
    note TEXT, -- ユーザーメモ
    skip_reason TEXT, -- スキップ理由
    auto_tracked BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id),
    UNIQUE(habit_id, date)
);

-- 習慣スコア履歴
CREATE TABLE habit_scores (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL,
    strength_score REAL NOT NULL, -- その日の習慣強度スコア
    momentum_score REAL, -- 勢いスコア（連続性）
    consistency_score REAL, -- 一貫性スコア（週/月の実行率）
    FOREIGN KEY (habit_id) REFERENCES habits(id)
);

-- インサイト（分析結果）
CREATE TABLE insights (
    id TEXT PRIMARY KEY,
    habit_id TEXT,
    type TEXT, -- 'pattern', 'correlation', 'suggestion'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data TEXT, -- JSON形式の詳細データ
    priority INTEGER DEFAULT 0,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL,
    expires_at TEXT,
    FOREIGN KEY (habit_id) REFERENCES habits(id)
);

-- ユーザー設定
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 同期メタデータ
CREATE TABLE sync_metadata (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT CHECK(operation IN ('create', 'update', 'delete')),
    timestamp TEXT NOT NULL,
    synced BOOLEAN DEFAULT FALSE,
    sync_timestamp TEXT
);
```

### クラウドデータベース (PostgreSQL)

```sql
-- ユーザー
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- デバイス
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    device_token TEXT UNIQUE,
    platform TEXT,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 同期データ（E2EE対応）
CREATE TABLE sync_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    device_id UUID REFERENCES devices(id),
    encrypted_data TEXT, -- 暗号化されたJSONデータ
    data_hash TEXT, -- データ整合性チェック用
    version INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. API設計

### 3.1 RESTful APIエンドポイント

#### 認証
```
POST   /api/auth/signup       # ユーザー登録
POST   /api/auth/signin       # ログイン
POST   /api/auth/signout      # ログアウト
GET    /api/auth/session      # セッション取得
```

#### 習慣管理
```
GET    /api/habits            # 習慣一覧取得
POST   /api/habits            # 習慣作成
GET    /api/habits/:id        # 習慣詳細取得
PUT    /api/habits/:id        # 習慣更新
DELETE /api/habits/:id        # 習慣削除
PATCH  /api/habits/:id/toggle # アクティブ状態切り替え
```

#### チェックイン
```
GET    /api/checkins          # チェックイン履歴取得
POST   /api/checkins          # チェックイン登録
DELETE /api/checkins/:id      # チェックイン取消
GET    /api/checkins/today    # 本日のチェックイン状況
GET    /api/checkins/calendar # カレンダー用データ取得
```

#### 統計
```
GET    /api/stats/overview    # 全体統計
GET    /api/stats/habits/:id  # 習慣別統計
GET    /api/stats/trends      # トレンド分析
GET    /api/stats/streaks     # 連続記録情報
```


## 4. ディレクトリ構造

```
habit-tracker/
├── packages/                    # Monorepoパッケージ
│   ├── core/                   # 共通コアライブラリ
│   │   ├── src/
│   │   │   ├── models/         # データモデル
│   │   │   ├── services/       # ビジネスロジック
│   │   │   ├── utils/          # ユーティリティ
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mobile/                  # React Nativeアプリ
│   │   ├── src/
│   │   │   ├── components/     # UIコンポーネント
│   │   │   ├── screens/        # 画面
│   │   │   ├── navigation/     # ナビゲーション
│   │   │   ├── hooks/          # カスタムフック
│   │   │   ├── services/       # ネイティブサービス
│   │   │   └── App.tsx
│   │   ├── ios/                # iOSネイティブコード
│   │   ├── android/            # Androidネイティブコード
│   │   ├── package.json
│   │   └── metro.config.js
│   │
│   ├── web/                     # Webアプリ
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── App.tsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── api/                     # バックエンドAPI（オプショナル）
│   │   ├── src/
│   │   │   ├── routes/         # APIルート
│   │   │   ├── controllers/    # コントローラー
│   │   │   ├── services/       # サービス層
│   │   │   ├── middleware/     # ミドルウェア
│   │   │   └── index.ts
│   │   ├── prisma/             # データベーススキーマ
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── widgets/                 # ネイティブウィジェット
│       ├── ios/                # iOS Widget Extension
│       └── android/            # Android Widget
│
├── docs/                        # ドキュメント
│   ├── api/                    # API仕様
│   ├── architecture/           # アーキテクチャ文書
│   └── guides/                 # ユーザーガイド
│
├── scripts/                     # ビルド・デプロイスクリプト
├── .github/                     # GitHub Actions
├── package.json                 # ルートpackage.json
├── pnpm-workspace.yaml         # pnpmワークスペース設定
├── turbo.json                  # Turborepo設定
└── README.md
```

## 5. 技術スタック

### フロントエンド
- **フレームワーク**: React Native 0.73+ (Expo SDK 50)
- **Web**: React 18 + Vite
- **状態管理**: Zustand
- **スタイリング**: Tailwind CSS (NativeWind for RN)
- **フォーム**: React Hook Form + Zod
- **ナビゲーション**: React Navigation 6
- **アニメーション**: Reanimated 3 + Lottie

### バックエンド
- **ランタイム**: Node.js 20 LTS
- **フレームワーク**: Fastify
- **ORM**: Prisma
- **認証**: JWT + Refresh Token
- **暗号化**: libsodium (E2EE)

### データベース
- **ローカル**: SQLite 3 (better-sqlite3)
- **クラウド**: PostgreSQL 15 + Redis
- **同期**: CRDT (Yjs) for conflict resolution

### インフラ・ツール
- **モノレポ**: pnpm + Turborepo
- **ビルド**: EAS Build (Expo)
- **CI/CD**: GitHub Actions
- **ホスティング**: Vercel (Web) + Railway (API)
- **分析**: PostHog (プライバシー重視)

### 外部連携
- **HealthKit/Google Fit**: react-native-health
- **WebDAV**: webdav-client
- **Dropbox**: Dropbox SDK
- **通知**: OneSignal

### AI・分析
- **ローカルAI**: TensorFlow.js Lite
- **パターン分析**: Time Series Analysis (statsmodels.js)
- **自然言語処理**: compromise.js (軽量NLP)

## 6. セキュリティ設計

### データ保護
- ローカルデータ: SQLCipher暗号化
- 通信: TLS 1.3
- クラウド同期: E2EE (End-to-End Encryption)
- パスワード: Argon2id ハッシング

### プライバシー
- データ最小化原則
- オプトイン型の分析
- GDPR/CCPA準拠
- ローカル処理優先

## 7. パフォーマンス目標

### 応答性
- アプリ起動: < 2秒
- 画面遷移: < 100ms
- データ同期: バックグラウンド実行

### スケーラビリティ
- 習慣数: 無制限（UIは段階的表示）
- 記録履歴: 5年分保持
- 同時デバイス: 最大10台

## 8. 段階的リリース計画

### Phase 0 - MVP (3ヶ月)
- 習慣強度スコアシステム
- グラデーショントラッキング
- ローカルストレージ
- 基本的なカレンダービュー
- iOS/Androidアプリ

### Phase 1 - v1.0 (2ヶ月)
- 自動記録（HealthKit/Google Fit）
- AIインサイト（基本）
- コンテキスト認識リマインダー
- ウィジェット
- WebDAV/Dropbox同期

### Phase 2 - Growth (3ヶ月)
- ソーシャル機能（オプショナル）
- 高度な分析
- Webアプリ
- Apple Watch/Wear OS対応
- E2EEクラウド同期（有料）