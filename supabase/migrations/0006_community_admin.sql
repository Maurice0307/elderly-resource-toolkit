-- =====================================================
-- 0006 community Q&A + admin infrastructure
-- =====================================================
-- Note: profiles.role ('user'|'moderator'|'admin') and profiles.points
--       already exist from migration 0001.
--       region_moderators table already exists from migration 0002.
-- =====================================================

-- ----- questions -----
create table if not exists public.questions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  region_id     uuid references public.regions(id) on delete set null,
  title         text not null,
  body          text,
  tags          text[] not null default '{}',
  status        text not null default 'open'
                  check (status in ('open','resolved','hidden')),
  answer_count  int  not null default 0,
  view_count    int  not null default 0,
  accepted_answer_id uuid,          -- no FK to avoid circular dep
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists questions_user_idx    on public.questions (user_id);
create index if not exists questions_region_idx  on public.questions (region_id);
create index if not exists questions_status_idx  on public.questions (status);

drop trigger if exists set_questions_updated_at on public.questions;
create trigger set_questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

-- ----- answers -----
create table if not exists public.answers (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  body         text not null,
  vote_count   int  not null default 0,
  is_accepted  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists answers_question_idx on public.answers (question_id);
create index if not exists answers_user_idx     on public.answers (user_id);

drop trigger if exists set_answers_updated_at on public.answers;
create trigger set_answers_updated_at
  before update on public.answers
  for each row execute function public.set_updated_at();

-- ----- answer_votes (upvote only; PK prevents double-voting) -----
create table if not exists public.answer_votes (
  answer_id  uuid not null references public.answers(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (answer_id, user_id)
);

-- ─── Triggers ────────────────────────────────────────────────────────

-- bump questions.answer_count
create or replace function public.bump_question_answer_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.questions set answer_count = answer_count + 1 where id = new.question_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.questions set answer_count = greatest(answer_count - 1, 0) where id = old.question_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_bump_answer_count on public.answers;
create trigger trg_bump_answer_count
  after insert or delete on public.answers
  for each row execute function public.bump_question_answer_count();

-- bump answers.vote_count and answerer points (+2 per upvote)
create or replace function public.bump_answer_vote()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.answers  set vote_count = vote_count + 1 where id = new.answer_id;
    update public.profiles set points     = points + 2
      where id = (select user_id from public.answers where id = new.answer_id);
    return new;
  elsif (tg_op = 'DELETE') then
    update public.answers  set vote_count = greatest(vote_count - 1, 0) where id = old.answer_id;
    update public.profiles set points     = greatest(points - 2, 0)
      where id = (select user_id from public.answers where id = old.answer_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_bump_answer_vote on public.answer_votes;
create trigger trg_bump_answer_vote
  after insert or delete on public.answer_votes
  for each row execute function public.bump_answer_vote();

-- +10 points when answer is accepted / -10 when un-accepted
create or replace function public.award_accepted_answer_points()
returns trigger language plpgsql as $$
begin
  if new.is_accepted = true and old.is_accepted = false then
    update public.profiles set points = points + 10 where id = new.user_id;
  elsif new.is_accepted = false and old.is_accepted = true then
    update public.profiles set points = greatest(points - 10, 0) where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_award_accepted_points on public.answers;
create trigger trg_award_accepted_points
  after update of is_accepted on public.answers
  for each row execute function public.award_accepted_answer_points();

-- ─── RLS ─────────────────────────────────────────────────────────────

alter table public.questions    enable row level security;
alter table public.answers      enable row level security;
alter table public.answer_votes enable row level security;

-- questions
drop policy if exists "questions_select"        on public.questions;
drop policy if exists "questions_insert"        on public.questions;
drop policy if exists "questions_update_own"    on public.questions;
drop policy if exists "questions_update_mod"    on public.questions;

create policy "questions_select" on public.questions
  for select using (status in ('open','resolved'));

create policy "questions_insert" on public.questions
  for insert with check (auth.uid() = user_id);

create policy "questions_update_own" on public.questions
  for update using (auth.uid() = user_id);

create policy "questions_update_mod" on public.questions
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin'))
  );

-- answers
drop policy if exists "answers_select"       on public.answers;
drop policy if exists "answers_insert"       on public.answers;
drop policy if exists "answers_update_own"   on public.answers;
drop policy if exists "answers_update_mod"   on public.answers;
drop policy if exists "answers_accept"       on public.answers;

create policy "answers_select" on public.answers
  for select using (true);

create policy "answers_insert" on public.answers
  for insert with check (auth.uid() = user_id);

create policy "answers_update_own" on public.answers
  for update using (auth.uid() = user_id);

-- allow question owner to accept/un-accept answers
create policy "answers_accept" on public.answers
  for update using (
    exists (select 1 from public.questions where id = question_id and user_id = auth.uid())
  );

create policy "answers_update_mod" on public.answers
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin'))
  );

-- answer_votes
drop policy if exists "votes_select"  on public.answer_votes;
drop policy if exists "votes_insert"  on public.answer_votes;
drop policy if exists "votes_delete"  on public.answer_votes;

create policy "votes_select" on public.answer_votes
  for select using (true);

create policy "votes_insert" on public.answer_votes
  for insert with check (auth.uid() = user_id);

create policy "votes_delete" on public.answer_votes
  for delete using (auth.uid() = user_id);

-- allow moderators/admin to update resources (approve/reject/ended)
drop policy if exists "resources_update_mod" on public.resources;
create policy "resources_update_mod" on public.resources
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin'))
  );
