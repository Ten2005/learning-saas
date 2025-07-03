# API Documentation

## Overview
このドキュメントは、Learning SaaSのAPIエンドポイントについて説明します。

## Base URL
```
http://localhost:3000/api
```

## Authentication
すべてのAPIエンドポイントはSupabaseによる認証が必要です。認証はセッションベースで、ミドルウェアによって自動的に処理されます。

## Endpoints

### Conversations

#### 会話一覧の取得
```
GET /api/conversation
```

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "started_at": "2024-01-01T00:00:00Z",
      "is_deleted": false,
      "title": "会話のタイトル",
      "model": "gpt-4",
      "system_prompt": null,
      "language": "ja"
    }
  ]
}
```

#### 会話の作成
```
POST /api/conversation
```

**Request Body:**
```json
{
  "title": "新しい会話"
}
```

**Response:**
```json
{
  "conversation": {
    "id": "uuid",
    "user_id": "uuid",
    "started_at": "2024-01-01T00:00:00Z",
    "is_deleted": false,
    "title": "新しい会話",
    "model": "gpt-4",
    "system_prompt": null,
    "language": "ja"
  }
}
```

#### 会話の削除
```
DELETE /api/conversation/[id]
```

**Response:**
```json
{
  "success": true
}
```

### Messages

#### メッセージ一覧の取得
```
GET /api/conversation/[id]/messages
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "parent_id": null,
      "role": "user",
      "content": "メッセージ内容",
      "created_at": "2024-01-01T00:00:00Z",
      "is_deleted": false
    }
  ]
}
```

#### メッセージの作成
```
POST /api/conversation/[id]/messages
```

**Request Body:**
```json
{
  "role": "user",
  "content": "メッセージ内容",
  "parent_id": "uuid" // オプション：分岐元のメッセージID
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "conversation_id": "uuid",
    "parent_id": "uuid",
    "role": "user",
    "content": "メッセージ内容",
    "created_at": "2024-01-01T00:00:00Z",
    "is_deleted": false
  }
}
```

### Chat

#### AI応答の取得
```
POST /api/chat/response
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "こんにちは"
    },
    {
      "role": "assistant",
      "content": "こんにちは！どのようにお手伝いできますか？"
    }
  ]
}
```

**Response:**
```json
{
  "message": "AI生成されたレスポンス"
}
```

## Error Handling

すべてのAPIエンドポイントは、エラーが発生した場合、以下の形式でレスポンスを返します：

```json
{
  "error": "エラーメッセージ"
}
```

**HTTPステータスコード:**
- `200`: 成功
- `400`: 不正なリクエスト
- `401`: 認証エラー
- `404`: リソースが見つからない
- `500`: サーバーエラー

## Type Definitions

詳細な型定義については、`/types/api.ts`を参照してください。

## Rate Limiting

現在、レート制限は実装されていませんが、将来的に実装される予定です。

## Versioning

現在のAPIバージョンは`v1`です。将来的にバージョニングが導入される場合、URLパスに含まれる予定です。