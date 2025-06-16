This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



SQL

-- UUID生成関数がない場合に pgcrypto を有効化
create extension if not exists "pgcrypto";

-- 会話テーブル
create table public.conversation (
  id             uuid      primary key default gen_random_uuid(),
  user_id        uuid      not null references auth.users(id) on delete cascade,
  started_at     timestamptz not null default now(),
  is_deleted     boolean   not null default false,
  title          text,
  -- 以下はマインドマップアプリの設定例
  model          text      not null default 'gpt-4',
  system_prompt  text,
  language       varchar(10) not null default 'ja'
);

-- ユーザーごと・開始日時ソートのアクセスを高速化
create index idx_conversation_user_started
  on public.conversation(user_id, started_at desc);


-- メッセージテーブル
create table public.message (
  id              uuid      primary key default gen_random_uuid(),
  conversation_id uuid      not null references public.conversation(id) on delete cascade,
  parent_id       uuid      references public.message(id) on delete set null,
  role            varchar(16) not null check (role in ('user','assistant','system')),
  content         text      not null,
  created_at      timestamptz not null default now(),
  is_deleted      boolean   not null default false
);

-- 親子関係の検索を高速化
create index idx_message_parent on public.message(parent_id);


-- 閉包テーブル（祖先⇔子孫関係の全探索を高速化）
create table public.message_closure (
  ancestor_id    uuid  not null references public.message(id) on delete cascade,
  descendant_id  uuid  not null references public.message(id) on delete cascade,
  depth          int   not null,
  primary key (ancestor_id, descendant_id)
);

-- 子孫から祖先をたどるクエリを高速化
create index idx_closure_descendant on public.message_closure(descendant_id);
