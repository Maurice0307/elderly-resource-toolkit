-- 0009 點子提案專區：proposals + proposal_votes（真實後端）
-- 在 Supabase SQL editor 執行一次即可。

create table if not exists public.proposals (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text,
  proposer_name text,
  status        text not null default 'open' check (status in ('open','planning','adopted')),
  is_hot        boolean not null default false,
  vote_count    int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.proposal_votes (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (proposal_id, user_id)
);
create index if not exists proposal_votes_proposal_idx on public.proposal_votes (proposal_id);
create index if not exists proposal_votes_user_idx on public.proposal_votes (user_id);

-- RLS：提案公開可讀；投票只能管理自己的
alter table public.proposals enable row level security;
alter table public.proposal_votes enable row level security;

drop policy if exists "proposals public read" on public.proposals;
create policy "proposals public read" on public.proposals for select using (true);

drop policy if exists "proposal_votes read" on public.proposal_votes;
create policy "proposal_votes read" on public.proposal_votes for select using (true);
drop policy if exists "proposal_votes insert own" on public.proposal_votes;
create policy "proposal_votes insert own" on public.proposal_votes for insert with check (auth.uid() = user_id);
drop policy if exists "proposal_votes delete own" on public.proposal_votes;
create policy "proposal_votes delete own" on public.proposal_votes for delete using (auth.uid() = user_id);

-- vote_count 觸發器（投票增減自動維護）
create or replace function public.bump_proposal_votes()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.proposals set vote_count = vote_count + 1 where id = new.proposal_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.proposals set vote_count = greatest(0, vote_count - 1) where id = old.proposal_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists trg_proposal_votes on public.proposal_votes;
create trigger trg_proposal_votes
  after insert or delete on public.proposal_votes
  for each row execute function public.bump_proposal_votes();

-- 初始提案（只在尚無資料時種子）
insert into public.proposals (title, category, proposer_name, status, is_hot, vote_count)
select * from (values
  ('教用手機掛號看診',     '智慧生活',    '里長・文山區', 'open',     true,  48),
  ('台語版健康操影片',     '動動身體',    '志工 阿美',   'open',     false, 36),
  ('如何分辨投資群組詐騙', '防詐・假訊息', '長者 陳先生', 'open',     false, 31),
  ('社區共餐料理教學',     '生活技能',    '志工 小林',   'open',     false, 22),
  ('懷舊歌曲手語帶動唱',   '創意繪畫',    '長者 林阿嬤', 'adopted',  false, 15),
  ('陽台小菜園種植入門',   '花草植栽',    '家屬 王先生', 'open',     false, 11),
  ('剪紙藝術年節裝飾',     '手工美勞',    '志工 秀娟',   'planning', false, 8)
) as v(title, category, proposer_name, status, is_hot, vote_count)
where not exists (select 1 from public.proposals);
