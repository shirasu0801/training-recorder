# 筋トレ記録 (Training Recorder)

Go + React + SQLiteを使用した筋トレ管理Webアプリケーション

## 機能

- **トレーニング記録**: 日付・種目・セット数・レップ数・重量を記録
- **種目管理**: 種目の追加・編集・削除、筋肉グループ別カテゴリ分け
- **履歴表示**: 過去のワークアウト一覧、日付・種目でフィルタリング
- **統計・グラフ**: 種目別の重量推移グラフ、週間・月間ボリューム表示、自己ベスト記録
- **ワークアウトプラン**: トレーニングテンプレート作成、プランに基づいたワークアウト開始
- **目標設定**: 種目別の目標重量・レップ数設定、達成率の表示
- **リマインダー**: ワークアウト予定のブラウザ通知

## 技術スタック

- **Backend**: Go (Gin framework)
- **Frontend**: React + TypeScript + Vite
- **Database**: SQLite
- **Charts**: Recharts

## 起動方法

### 1. バックエンドの起動

```bash
cd backend
go run main.go
```

サーバーが http://localhost:8080 で起動します。

### 2. フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

開発サーバーが http://localhost:5173 で起動します。

### 3. アプリケーションにアクセス

ブラウザで http://localhost:5173 にアクセスしてください。

## プロジェクト構造

```
training-recorder/
├── backend/
│   ├── main.go              # エントリーポイント
│   ├── go.mod
│   ├── handlers/            # HTTPハンドラー
│   ├── models/              # データモデル
│   └── database/            # DB接続・初期化
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/             # API通信
│       ├── components/      # UIコンポーネント
│       ├── pages/           # ページコンポーネント
│       └── types/           # TypeScript型定義
│
└── data/
    └── training.db          # SQLiteデータベース
```

## API エンドポイント

### Exercises
- `GET /api/exercises` - 種目一覧
- `POST /api/exercises` - 種目追加
- `PUT /api/exercises/:id` - 種目更新
- `DELETE /api/exercises/:id` - 種目削除

### Workouts
- `GET /api/workouts` - ワークアウト一覧
- `POST /api/workouts` - ワークアウト記録
- `PUT /api/workouts/:id` - ワークアウト更新
- `DELETE /api/workouts/:id` - ワークアウト削除

### Plans
- `GET /api/plans` - プラン一覧
- `POST /api/plans` - プラン作成
- `GET /api/plans/:id` - プラン詳細
- `PUT /api/plans/:id` - プラン更新
- `DELETE /api/plans/:id` - プラン削除

### Goals
- `GET /api/goals` - 目標一覧
- `POST /api/goals` - 目標作成
- `PUT /api/goals/:id` - 目標更新
- `DELETE /api/goals/:id` - 目標削除

### Stats
- `GET /api/stats/exercise/:id` - 種目別統計
- `GET /api/stats/volume` - ボリューム統計
- `GET /api/stats/records` - 自己ベスト一覧
