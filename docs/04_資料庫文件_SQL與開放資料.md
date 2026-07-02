# 幸福好厝邊 ElderLink — 資料庫文件（SQL Schema & 政府開放資料）

> 資料庫：Supabase（PostgreSQL 15+）｜ 遷移檔：`supabase/migrations/0001–0015`
> 規模（現況）：22 張表、8 分類、67 細標籤、391 地區、**18,020 筆資源**
> 本文件之 CREATE TABLE 皆取自實際 migration，可直接於 Supabase SQL Editor 執行。

---

## 目錄
1. 資料模型總覽（ERD）
2. 擴充套件與共用函式
3. 完整 CREATE TABLE SQL（分模組）
4. 觸發器（Triggers）與去正規化計數
5. Row Level Security（RLS）策略摘要
6. 索引設計與查詢策略
7. 政府開放資料清單（含 data.gov.tw 編號）
8. 資料治理

---

## 1. 資料模型總覽（ERD 概念）

```
                         ┌──────────────┐
                         │   regions     │ (self-ref: county → district)
                         └──────┬───────┘
             region_id ┌────────┴─────────┐ home_region_id
                       ▼                  ▼
   categories 1─N subcategories       profiles ──1─N── questions ─1─N─ answers ─ answer_votes
        │              │  ▲(extra_subcats uuid[])         │
        │              │  │                               ├─ resource_bookmarks
        └──────────────┼──┘                               ├─ resource_likes
                       ▼                                   ├─ account_links (LINE/Google/phone)
                   resources ──N── resource_feedback / resource_reports
                       ▲
             daily_news │ activity_cards │ communication_scripts
             proposals ─ proposal_votes │ community_submissions │ content_reports
             line_messages │ line_user_prefs │ region_moderators
```

---

## 2. 擴充套件與共用函式

```sql
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";     -- 名稱模糊搜尋 (gin_trgm_ops)

-- 通用 updated_at 觸發器函式
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- 權限輔助
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

create or replace function public.is_region_moderator(uid uuid, rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.region_moderators rm
                 where rm.user_id = uid and rm.region_id = rid);
$$;
```

---

## 3. 完整 CREATE TABLE SQL

### 3.1 使用者與權限

```sql
-- profiles：使用者檔案（對應 auth.users）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  identity text check (identity in ('elder','family','volunteer','other')),
  home_region_id uuid references public.regions(id) on delete set null,
  points int not null default 0,
  role text not null default 'user' check (role in ('user','moderator','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_identity_idx on public.profiles (identity);

-- account_links：一個主帳號連結多種登入方式（避免重複帳號）
create table if not exists public.account_links (
  provider     text not null check (provider in ('line','google','phone','email')),
  provider_key text not null,                 -- LINE userId / Google email / 手機 E.164
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (provider, provider_key)
);
create index if not exists account_links_user_idx on public.account_links (user_id);

-- region_moderators：地區管理員（多對多）
create table if not exists public.region_moderators (
  region_id uuid not null references public.regions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  primary key (region_id, user_id)
);
```

### 3.2 地區與分類

```sql
-- regions：地區樹（national → county → district）
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('national','county','district')),
  parent_id uuid references public.regions(id) on delete set null,
  name text not null,
  code text not null unique,                  -- TW / TW-TYC / TW-TYC-ZL
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now()
);
create index if not exists regions_level_idx on public.regions (level);
create index if not exists regions_parent_idx on public.regions (parent_id);

-- categories：八大分類
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text,
  color text,
  sort_order int not null default 0
);

-- subcategories：67 個細標籤
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  unique (category_id, slug)
);
create index if not exists subcategories_category_idx on public.subcategories (category_id);
```

### 3.3 資源主表與互動

```sql
-- resources：資源主表（18,020 筆）
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  subcategory_id uuid not null references public.subcategories(id) on delete restrict,
  scope text not null default 'local' check (scope in ('national','local')),
  region_id uuid references public.regions(id) on delete set null,

  name text not null,
  summary text,
  description text,

  phone text,
  phone_hint text,
  address text,
  latitude numeric,
  longitude numeric,
  website_url text,
  hours jsonb,

  identity_tags text[] not null default '{}',
  tags text[] not null default '{}',

  source_url text,
  source_org text,                            -- 開放資料來源標註

  like_count int not null default 0,
  view_count int not null default 0,

  status text not null default 'active'
    check (status in ('active','pending','ended','archived')),

  submitted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 0014：多重細分類（主標籤 subcategory_id + 額外標籤 extra_subcats）
  extra_subcats uuid[] not null default '{}',
  -- 0015：收藏計數（去正規化，供「多人推薦」排序）
  bookmark_count int not null default 0,

  constraint resources_local_needs_region
    check (scope = 'national' or region_id is not null)
);
create index if not exists resources_subcategory_idx on public.resources (subcategory_id);
create index if not exists resources_region_idx on public.resources (region_id);
create index if not exists resources_status_idx on public.resources (status);
create index if not exists resources_identity_tags_idx on public.resources using gin (identity_tags);
create index if not exists resources_tags_idx on public.resources using gin (tags);
create index if not exists resources_name_trgm_idx on public.resources using gin (name gin_trgm_ops);
create index if not exists resources_extra_subcats_idx on public.resources using gin (extra_subcats);

-- resource_likes：說讚（PK 防重複；觸發器維護 like_count）
create table if not exists public.resource_likes (
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (resource_id, user_id)
);

-- resource_bookmarks：收藏（跨裝置同步；重算 bookmark_count）
create table if not exists public.resource_bookmarks (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, resource_id)
);

-- resource_feedback：評分/評論
create table if not exists public.resource_feedback (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- resource_reports：資料錯誤 / 服務結束回報
create table if not exists public.resource_reports (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  report_type text not null check (report_type in ('ended','wrong_info','duplicate','other')),
  detail text,
  status text not null default 'open' check (status in ('open','resolved','rejected')),
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
```

### 3.4 互助問答（Q&A）

```sql
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  region_id uuid references public.regions(id) on delete set null,
  title text not null,
  body text,
  tags text[] not null default '{}',
  status text not null default 'open' check (status in ('open','resolved','hidden')),
  answer_count int not null default 0,
  view_count int not null default 0,
  accepted_answer_id uuid,                    -- 無 FK，避免循環相依
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  vote_count int not null default 0,
  is_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.answer_votes (
  answer_id uuid not null references public.answers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (answer_id, user_id)
);
```

### 3.5 內容：活動圖卡 / 溝通錦囊 / 今日新知 / 投稿

```sql
-- activity_cards：活動圖卡（含 0007 媒體欄位）
create table if not exists public.activity_cards (
  id uuid primary key default gen_random_uuid(),
  group_slug text not null check (group_slug in ('move','create','smart','health','life')),
  slug text not null unique,
  title text not null,
  summary text,
  cover_emoji text,
  identity_tags text[] not null default '{}',
  steps jsonb not null default '[]',          -- [{order,title,description,tip?}]
  tags text[] not null default '{}',
  like_count int not null default 0,
  status text not null default 'active' check (status in ('active','draft','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cover_image_url text,
  hero_image_url text,
  video_url text,
  video_provider text check (video_provider in ('youtube','vimeo','self','none')),
  source_url text,
  source_org text,
  duration_min int,
  materials jsonb
);

-- communication_scripts：溝通錦囊（照著說的句子）
create table if not exists public.communication_scripts (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('volunteer','family','difficult')),
  slug text not null unique,
  title text not null,
  context text,
  ok_examples jsonb not null default '[]',    -- [{role,text}]
  ng_examples jsonb not null default '[]',    -- [{role,text,reason?}]
  tips text[] not null default '{}',
  tags text[] not null default '{}',
  like_count int not null default 0,
  status text not null default 'active' check (status in ('active','draft','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- daily_news：今日新知（LLM 改寫為長輩友善重點）
create table if not exists public.daily_news (
  id uuid primary key default gen_random_uuid(),
  source_org text not null,
  source_url text not null unique,
  title text not null,
  summary_md text not null,
  image_url text,
  tags text[] not null default '{}',
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','hidden','draft')),
  created_at timestamptz not null default now()
);
create index if not exists daily_news_status_published_idx on public.daily_news (status, published_at desc);

-- community_submissions：民眾投稿（活動 / 溝通方法）
create table if not exists public.community_submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('activity','script')),
  title text not null,
  payload jsonb not null default '{}',
  source_url text,
  contact text,
  submitted_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','needs_more_info')),
  review_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 3.6 許願提案 / 內容回報

```sql
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  proposer_name text,
  status text not null default 'open' check (status in ('open','planning','adopted')),
  is_hot boolean not null default false,
  vote_count int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.proposal_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (proposal_id, user_id)
);

-- content_reports：內容問題回報（資源/活動/錦囊/新知）
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                         -- resource | activity | script | news
  subject text not null,
  reasons text[] not null default '{}',
  note text,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
```

### 3.7 LINE 相關

```sql
-- line_messages：LINE 對話紀錄（後台收件匣 / 客服）
create table if not exists public.line_messages (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null,
  display_name text,
  direction text not null check (direction in ('in','out')),
  text text not null,
  by_admin boolean not null default false,
  created_at timestamptz not null default now(),
  avatar_url text                             -- 0015：LINE 大頭貼
);
create index if not exists line_messages_user_idx on public.line_messages (line_user_id, created_at);

-- line_user_prefs：記住每位 LINE 使用者選的地區
create table if not exists public.line_user_prefs (
  line_user_id text primary key,
  region_id uuid references public.regions(id) on delete set null,
  region_name text,
  onboarded boolean not null default false,
  updated_at timestamptz not null default now()
);
```

---

## 4. 觸發器與去正規化計數

以觸發器維護計數欄位與積分，避免每次查詢即時彙總：

| 觸發器 | 對象 | 作用 |
|---|---|---|
| `bump_resource_like_count` | resource_likes ins/del | 維護 `resources.like_count` |
| `bump_question_answer_count` | answers ins/del | 維護 `questions.answer_count` |
| `bump_answer_vote` | answer_votes ins/del | 維護 `answers.vote_count`＋答題者 `points +2` |
| `award_accepted_answer_points` | answers update is_accepted | 最佳解答者 `points +10` |
| `bump_proposal_votes` | proposal_votes ins/del | 維護 `proposals.vote_count` |
| `set_updated_at` | 多表 before update | 自動更新 `updated_at` |
| `handle_new_user` | auth.users insert | 自動建立對應 `profiles` |

> 收藏計數 `bookmark_count` 由應用層（server action）於收藏/取消時重算。

---

## 5. Row Level Security（RLS）策略摘要

所有表啟用 RLS。原則：**公開內容可讀、寫入受控、敏感表僅服務端存取**。

| 表 | 讀 | 寫 |
|---|---|---|
| profiles | 全部可讀 | 只能改自己 |
| regions/categories/subcategories | 全部可讀 | 僅 admin |
| resources | `active` 或（admin／該區 moderator／投稿者本人） | 投稿者可新增；admin／moderator 可改；admin 可刪 |
| resource_likes / bookmarks | 公開讀 | 只能管理自己的 |
| questions | `open`/`resolved` 可讀 | 本人可改；moderator/admin 可改 |
| answers | 全部可讀 | 本人可改；提問者可採納；moderator/admin 可改 |
| activity_cards / scripts / daily_news | `active` 可讀 | 僅 admin |
| account_links / line_messages / line_user_prefs / content_reports | 僅 service role | 僅 service role |

實作上：使用者 session 走 `createClient`（受 RLS）；後台與彙整走 `createAdminClient`（service role 繞過 RLS）。

---

## 6. 索引設計與查詢策略

- **GIN 索引**：`identity_tags`、`tags`、`extra_subcats`（陣列重疊 `&&`）、`name`（pg_trgm 模糊）。
- **B-tree 索引**：外鍵（subcategory_id、region_id、category_id、parent_id）、status、時間欄位。
- **查詢（廣召回 OR）**：
  ```
  subcategory_id.in.(...) OR extra_subcats.ov.{...}
  OR name.ilike.%tok% OR summary.ilike.%tok%
  ```
- **地區篩選**：`scope.eq.national` OR `region_id.in.(縣市 + 其下行政區 + 父縣市)`。
- **排序（應用層相關度計分）**：細標籤命中 > 名稱 > 標籤 > 摘要，分桶後再 全國→縣市→區→收藏數。
- **注意**：PostgREST 預設 select 上限 1000 筆；統計/彙整需分頁或用 `count`，避免筆數低估。

---

## 7. 政府開放資料清單（Open Data）

平台資源整合自 **data.gov.tw** 及各縣市開放資料。核心資料集與編號（`https://data.gov.tw/dataset/編號`）：

| 資料集 | 編號 | 對應分類 | 筆數(約) |
|---|---|---|---|
| 長照 ABC 據點 | **88270** | 醫療健康／社會資源 | 14,402 |
| 全國老人福利機構名冊 | **8572**（老人福利機構 146256） | 社會資源 | 722 |
| 健保特約醫事機構－醫學中心 | **39280** | 醫療健康 | |
| 健保特約醫事機構－區域醫院 | **39281** | 醫療健康 | |
| 健保特約醫事機構－地區醫院 | **39282** | 醫療健康 | 649（合計） |
| 健保特約醫事機構－診所 | **39283** | 醫療健康 | |
| 健保特約醫事機構－藥局 | **39284** | 醫療健康 | |
| 社區照顧關懷據點 | **159489 / 95192 / 97429** | 休閒活動／社會資源 | |
| 居家護理機構 | **97491 / 146270 / 114415** | 醫療健康 | 413 |
| 樂齡學習中心（全國） | **163769**（臺中 83902、臺南 103755） | 教育進修 | |
| 長青學苑（含樂齡學習中心） | **114374** | 教育進修 | |
| 各縣市老人假牙補助合約院所 | 臺北 129840/121494、屏東 135048、嘉義市 130486、花蓮 149001… | 補助申請 | 1,000+ |

**其他來源**：各縣市老人文康・福利服務中心、長青學苑；心理諮商／治療所；社區大學；老人健康檢查合約院所；復康巴士與無障礙運輸；身心障礙輔具服務；公費疫苗接種院所；及交通部、勞動部、內政部（消防/警政）、金管會、教育部、疾管署、國健署等部會資料。

> 授權：所引用之政府開放資料依原始授權（多為政府資料開放授權條款）；平台原創內容採 CC BY 4.0。每筆資源以 `source_org` 標註來源，並提醒以官方最新公告為準。

---

## 8. 資料治理（Data Governance）

- **正確性**：標註來源、提供回報（resource_reports / resource_feedback / content_reports）、提醒以官方為準。
- **更新**：規劃定期重新匯入開放資料；今日新知已有 `api/cron/fetch-news` 排程。
- **匯入正規化**：對應 `subcategory_id`、`region_id`、`scope`；處理 Big5 編碼；去重與多標籤合併（`extra_subcats`）。
- **隱私**：最小蒐集、不外流、可一鍵刪除帳號；三種登入不存密碼。
- **版本控管**：所有 schema 變更以 `supabase/migrations` 管理（0001–0015）。
