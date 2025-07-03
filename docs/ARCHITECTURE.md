# アーキテクチャドキュメント

## 概要

Learning SaaSは、Next.js 15（App Router）を基盤とした、AIパワードの学習プラットフォームです。本ドキュメントでは、システムのアーキテクチャと設計思想について説明します。

## 技術スタック

### フロントエンド
- **Next.js 15.3.3**: React フレームワーク（App Router使用）
- **React 19**: UIライブラリ
- **TypeScript 5**: 型安全性の確保
- **Tailwind CSS 4**: ユーティリティファーストのCSSフレームワーク
- **Framer Motion**: アニメーションライブラリ

### 状態管理
- **Zustand 5.0.5**: 軽量な状態管理ライブラリ
- 複数の専門化されたストアによる責任の分離

### バックエンド・認証
- **Supabase**: BaaS（Backend as a Service）
  - 認証管理
  - PostgreSQLデータベース
  - リアルタイム通信（将来実装予定）

### その他のライブラリ
- **React Flow**: マインドマップ機能用
- **React Markdown**: Markdown表示
- **Lucide React**: アイコンライブラリ
- **Zod**: スキーマバリデーション

## ディレクトリ構造

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連のルートグループ
│   ├── (dashboard)/       # ダッシュボードルートグループ
│   ├── api/               # APIルート
│   ├── components/        # コンポーネント
│   └── layout.tsx         # ルートレイアウト
├── stores/                # Zustandストア
│   ├── authStore.ts       # 認証状態
│   ├── messageStore.ts    # メッセージ管理
│   ├── chatActionStore.ts # チャットアクション
│   ├── toastStore.ts      # 通知管理
│   └── ...
├── types/                 # TypeScript型定義
│   ├── index.ts          # 基本型定義
│   └── api.ts            # API関連の型とバリデーション
├── lib/                   # ユーティリティとカスタムフック
│   └── hooks/            # カスタムフック
├── utils/                 # ヘルパー関数
└── docs/                  # ドキュメント
```

## アーキテクチャの特徴

### 1. レイヤードアーキテクチャ

```
┌─────────────────────────────────────┐
│      Presentation Layer (UI)         │
├─────────────────────────────────────┤
│    Custom Hooks & Store Actions      │
├─────────────────────────────────────┤
│        State Management Layer        │
├─────────────────────────────────────┤
│          API Layer (REST)            │
├─────────────────────────────────────┤
│     Data Layer (Supabase/DB)        │
└─────────────────────────────────────┘
```

### 2. 状態管理の設計

状態管理は機能ごとに分離されたZustandストアで実装：

- **authStore**: 認証とユーザー情報
- **messageStore**: メッセージデータとツリー構造の管理
- **chatActionStore**: チャット送信アクション
- **conversationStore**: 会話一覧の管理
- **toastStore**: 通知システム
- **uiStore**: UI状態（サイドバー等）

### 3. データフローパターン

```
Component
    ↓
Custom Hook (useMessages, useConversations)
    ↓
Zustand Store Action
    ↓
API Request (with Zod validation)
    ↓
Supabase Database
```

### 4. エラーハンドリング戦略

1. **グローバルエラーバウンダリー**: 予期しないエラーをキャッチ
2. **APIエラー処理**: 統一されたエラーレスポンス形式
3. **トースト通知**: ユーザーフレンドリーなエラー表示
4. **型安全性**: Zodによるランタイムバリデーション

### 5. 認証フロー

```
Middleware → Supabase Auth → Protected Routes
     ↓
Auth Store ← onAuthStateChange
```

## 主要な機能

### 1. 会話の分岐管理

メッセージはツリー構造で管理され、任意のポイントから新しい会話ブランチを作成可能：

```
Message A
    ├── Message B
    │   ├── Message C
    │   └── Message D (branch)
    └── Message E (branch)
```

### 2. リアルタイム更新

現在はイベント駆動（CustomEvent）で実装されていますが、将来的にSupabaseのリアルタイム機能への移行を予定。

### 3. 型安全性

- TypeScriptによる静的型チェック
- Zodによるランタイムバリデーション
- APIレスポンスの型保証

## パフォーマンス最適化

1. **コード分割**: Next.jsの自動コード分割
2. **遅延読み込み**: 必要に応じたコンポーネントの読み込み
3. **メモ化**: 重い計算処理の結果をキャッシュ
4. **最適化されたレンダリング**: 必要な部分のみの再レンダリング

## セキュリティ考慮事項

1. **認証**: Supabaseによるセキュアな認証
2. **認可**: Row Level Security（RLS）による細かいアクセス制御
3. **入力検証**: Zodによるサーバーサイドバリデーション
4. **XSS対策**: Reactのデフォルトエスケープ機能

## 今後の改善計画

1. **テスト**: 単体テストとE2Eテストの追加
2. **CI/CD**: 自動デプロイメントパイプラインの構築
3. **監視**: エラー監視とパフォーマンスモニタリング
4. **国際化**: 多言語対応
5. **アクセシビリティ**: WCAG準拠の改善

## 開発ガイドライン

### コーディング規約

1. **命名規則**: 
   - コンポーネント: PascalCase
   - 関数・変数: camelCase
   - 定数: UPPER_SNAKE_CASE

2. **ファイル構成**:
   - 1ファイル1コンポーネント/機能
   - インデックスファイルでのエクスポート集約

3. **型定義**:
   - interfaceよりtypeを優先
   - 共通型は`types/`ディレクトリに配置

### ベストプラクティス

1. **早期リターン**: ネストを減らすため
2. **カスタムフックの活用**: ロジックの再利用
3. **エラーハンドリング**: try-catchとエラーバウンダリーの適切な使用
4. **パフォーマンス**: 不要な再レンダリングの回避

## デプロイメント

現在のデプロイメント戦略：
- **プラットフォーム**: Vercel（推奨）
- **環境変数**: Supabase接続情報
- **ビルドコマンド**: `pnpm build`