# Learning SaaS

AIパワードの学習プラットフォーム。会話の分岐管理機能を備えた高度なチャットインターフェースを提供します。

## 特徴

- 🤖 AI対話型学習システム
- 🌳 会話の分岐・履歴管理
- 🔐 Supabaseによるセキュアな認証
- 🎨 モダンでレスポンシブなUI
- 📝 Markdown対応
- 🧠 マインドマップ機能（開発中）

## 技術スタック

- **フロントエンド**: Next.js 15.3.3 (App Router), React 19, TypeScript 5
- **スタイリング**: Tailwind CSS 4, Framer Motion
- **状態管理**: Zustand 5.0.5
- **バックエンド**: Supabase (認証・データベース)
- **バリデーション**: Zod
- **その他**: React Flow, React Markdown

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm 8以上
- Supabaseアカウント

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd learning-saas
```

2. 依存関係をインストール
```bash
pnpm install
```

3. 環境変数を設定
`.env.local`ファイルを作成し、以下の変数を設定：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. データベースをセットアップ
README内のSQLスクリプトをSupabaseのSQLエディタで実行

5. 開発サーバーを起動
```bash
pnpm dev
```

## データベーススキーマ

```sql
-- UUID生成関数がない場合に pgcrypto を有効化
create extension if not exists "pgcrypto";

-- 会話テーブル
create table public.conversation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  title text,
  model text not null default 'gpt-4',
  system_prompt text,
  language varchar(10) not null default 'ja'
);

-- ユーザーごと・開始日時ソートのアクセスを高速化
create index idx_conversation_user_started
  on public.conversation(user_id, started_at desc);

-- メッセージテーブル
create table public.message (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversation(id) on delete cascade,
  parent_id uuid references public.message(id) on delete set null,
  role varchar(16) not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now(),
  is_deleted boolean not null default false
);

-- 親子関係の検索を高速化
create index idx_message_parent on public.message(parent_id);

-- 閉包テーブル（祖先⇔子孫関係の全探索を高速化）
create table public.message_closure (
  ancestor_id uuid not null references public.message(id) on delete cascade,
  descendant_id uuid not null references public.message(id) on delete cascade,
  depth int not null,
  primary key (ancestor_id, descendant_id)
);

-- 子孫から祖先をたどるクエリを高速化
create index idx_closure_descendant on public.message_closure(descendant_id);
```

## 開発ガイド

### プロジェクト構造

```
├── app/                    # Next.js App Router
├── stores/                 # Zustand状態管理
├── types/                  # TypeScript型定義
├── lib/                    # ユーティリティとカスタムフック
├── utils/                  # ヘルパー関数
└── docs/                   # ドキュメント
```

### 主要なスクリプト

```bash
pnpm dev        # 開発サーバー起動
pnpm build      # プロダクションビルド
pnpm start      # プロダクションサーバー起動
pnpm lint       # ESLintチェック
pnpm format     # Prettierフォーマット
```

## ドキュメント

- [APIドキュメント](./docs/API.md)
- [アーキテクチャドキュメント](./docs/ARCHITECTURE.md)

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。

## ライセンス

[MIT](LICENSE)
