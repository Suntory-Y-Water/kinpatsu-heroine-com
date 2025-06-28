# CLAUDE.md

このファイルは、このリポジトリでコードを作業する際のClaude Code (claude.ai/code) 向けのガイダンスです。

## プロジェクト概要

kinpatsu-hiroin.com (金髪ヒロイン.com) は、アニメの金髪ヒロインを発見・評価するためのフルスタックWebアプリケーションです。
HonoXフレームワークで構築され、Cloudflare Workersエッジコンピューティングプラットフォームにデプロイされています。

## 技術スタック

- **フレームワーク**: HonoX (Hono.js上に構築されたSSRフレームワーク)
- **ランタイム**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite互換) + Drizzle ORM
- **ストレージ**: Cloudflare R2 (キャラクター画像用)
- **フロントエンド**: JSX + Islands Architecture、Tailwind CSS v4
- **ビルド**: Vite + TypeScript
- **テスト**: Vitest (ユニット・結合テスト)
- **リンティング**: Biome (ESLint/Prettierの代替)
- **パッケージマネージャー**: pnpm

## 主要な開発コマンド

```bash
# 開発
pnpm dev                    # ホストバインディングで開発サーバー起動
pnpm preview               # ローカルWrangler開発環境起動
pnpm preview:remote        # ビルド後、Wranglerリモートで実行

# ビルド・デプロイ
pnpm build                 # クライアント・サーバーバンドルをビルド
pnpm deploy                # 本番環境へデプロイ (deploy.sh実行)
pnpm deploy:with-vars      # 環境変数付きでデプロイ

# コード品質
pnpm lint                  # Biomeリンター実行
pnpm lint:fix              # リンティング問題を自動修正
pnpm format                # Biomeでコード整形
pnpm test                  # 全テスト実行 (ユニット + 結合)
pnpm test:unit             # ユニットテストのみ実行
pnpm test:integration      # 結合テストのみ実行

# データベース管理
pnpm db:generate           # データベースマイグレーション生成
pnpm db:push               # スキーマ変更をデータベースにプッシュ
pnpm db:studio             # Drizzle Studio起動
pnpm db:local              # ローカルマイグレーション実行 (最新)
pnpm db:local:all          # 全ローカルマイグレーション実行

# 開発ツール
pnpm typegen               # Wrangler型定義生成
pnpm tail                  # Cloudflare Workersログ表示
```

## アーキテクチャ概要

### ファイルベースルーティング (HonoX)
- `app/routes/` でファイルベースルーティングを使用してルート定義
- 特殊ファイル: `_renderer.tsx` (レイアウト)、`_middleware.ts`、`_404.tsx`、`_error.tsx`
- 動的ルート: パラメータ化URLのための `[id].tsx`
- クライアントサイドインタラクティビティのための `app/islands/` のIslandsコンポーネント

### 主要ディレクトリ
- `app/components/` - 再利用可能なUIコンポーネント
- `app/lib/` - ビジネスロジックとユーティリティ
  - `app/lib/db/` - Drizzle ORMでのデータベース操作
  - `app/lib/api/` - 外部API連携
  - `app/lib/storage/` - Cloudflare R2ファイル操作
- `app/config/drizzle/` - データベーススキーマとマイグレーション
- `app/types/` - TypeScript型定義
- `test-unit/` と `test-integration/` - テストスイート

### データベーススキーマ
コアエンティティ: Works (アニメ)、Characters、Streaming Sites、Like History、管理者承認ワークフロー付きRegistration Queue

## 開発ガイドライン

### コード品質要件
- リンティングと整形にBiomeを使用 (`pnpm lint` と `pnpm format`)
- コミット前にテスト実行 (`pnpm test`)
- TypeScript strict mode使用 - `any`型の使用禁止
- `let`より`const`を優先、ネストを減らすためのearly return使用
- マジックナンバーは名前付き定数に置き換える
- 関数は単一責任の原則に従う

### HonoXパターン
- 適切なHTTPメソッドエクスポート (GET, POST, PUT, DELETE) でルートハンドラに `createRoute()` 使用
- クライアントサイドステートとインタラクティビティにIslandsコンポーネント使用
- JSXレスポンス用の `c.render()` でサーバーサイドレンダリング
- ルートでは利用可能だがIslands内では利用不可のコンテキストオブジェクト (`c`)

### エラーハンドリング
- エラーハンドリングには `neverthrow` Result型を使用
- constでの同期エラーハンドリングにはIIFE (即時実行関数式) を使用

### ファイル命名と構造
- ディレクトリとコンポーネントはkebab-caseを使用
- ビジネスドメインを反映した明確で説明的な名前
- 関連機能をグループ化
- 類似コンポーネント間での一貫したパターン

### Islandsアーキテクチャ
- インタラクティブなコンポーネントのみをIslandsとして実装
- IslandsはReactライクなフック (useState等) を使用可能
- 必要なデータをpropsとしてIslandsに渡す
- Islands内ではHonoコンテキスト (`c`) にアクセス不可

### 管理機能
- ログイン試行追跡と制限機能
- 登録キューを通じたコンテンツ承認ワークフロー
- Cloudflare R2との画像アップロード連携
- アニメ発見のためのストリーミングサイト管理

## ソースコード作成後のチェック

- [ ] pnpm run lint でリントエラーは発生していません
- [ ] pnpm run test:unit または pnpm run test:integrationでテストでFAILしているものはありません

重複を避けるため、新しいコンポーネントを作成する前に既存の実装を必ず確認してください。データベース操作、API連携、コンポーネント構造の確立されたパターンに従ってください。