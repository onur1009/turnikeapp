-- Turnike C aşaması: doğrulanan düello turları, hayalet rakip ve Haftalık Hat Ligi.
-- 0001_players_rls.sql'den SONRA, Supabase SQL Editor'de bir kez çalıştırın.
-- "Allow anonymous sign-ins" açık olmalı (oyun her oyuncuya anonim oturum açar).
--
-- Güvenlik modeli: tablolara istemciden doğrudan yazılamaz (insert/update politikası yok);
-- tüm yazmalar aşağıdaki security definer fonksiyonlarla yapılır ve fonksiyonlar girdiyi
-- doğrular. Herkes tabloları okuyabilir (skorlar ve lig sıralaması herkese açıktır).

-- ---------- Bulmacalar: seed -> kelime listesi (ilk gönderen kaydeder) ----------
create table if not exists public.puzzles (
  seed       bigint primary key,
  words      text[] not null check (cardinality(words) between 2 and 12),
  created_at timestamptz not null default now()
);

-- ---------- Turlar: bir oyuncunun bir bulmacadaki sonucu ----------
create table if not exists public.runs (
  id          uuid primary key default gen_random_uuid(),
  seed        bigint not null references public.puzzles (seed) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 16),
  found       text[] not null,
  word_count  integer not null check (word_count >= 0),
  seconds     integer not null check (seconds between 1 and 120),
  timeline    jsonb not null default '[]'::jsonb, -- [{ "w": "KELİME", "t": saniye }]
  created_at  timestamptz not null default now()
);
create index if not exists runs_seed_idx on public.runs (seed);
create index if not exists runs_created_idx on public.runs (created_at desc);

alter table public.puzzles enable row level security;
alter table public.runs enable row level security;
drop policy if exists "puzzles readable" on public.puzzles;
create policy "puzzles readable" on public.puzzles for select using (true);
drop policy if exists "runs readable" on public.runs;
create policy "runs readable" on public.runs for select using (true);

-- Tur gönder: bulmaca kelimeleri seed'e kayıtlı olanla aynı olmalı, bulunan kelimeler
-- bulmacanın içinde ve tekrarsız olmalı, süre kelime başına en az 1,5 saniye olmalı.
-- Kelime sayısını sunucu hesaplar; istemcinin söylediği sayıya güvenilmez.
create or replace function public.submit_run(
  p_seed bigint, p_puzzle text[], p_found text[], p_seconds integer, p_timeline jsonb, p_name text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_words text[];
  v_found text[];
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  insert into puzzles (seed, words) values (p_seed, p_puzzle) on conflict (seed) do nothing;
  select words into v_words from puzzles where seed = p_seed;
  if (select array_agg(w order by w) from unnest(v_words) w) is distinct from
     (select array_agg(w order by w) from unnest(p_puzzle) w) then
    raise exception 'puzzle_mismatch';
  end if;
  select coalesce(array_agg(distinct f), '{}') into v_found from unnest(p_found) f where f = any (v_words);
  if cardinality(v_found) <> cardinality(p_found) then raise exception 'invalid_words'; end if;
  if p_seconds < 1 or p_seconds > 120 or p_seconds < floor(cardinality(v_found) * 1.5) then
    raise exception 'invalid_time';
  end if;
  insert into runs (seed, user_id, name, found, word_count, seconds, timeline)
  values (p_seed, auth.uid(), left(coalesce(nullif(trim(p_name), ''), 'Yolcu'), 16), v_found,
          cardinality(v_found), p_seconds, coalesce(p_timeline, '[]'::jsonb))
  returning id into v_id;
  return v_id;
end $$;

-- Hayalet rakip: başka bir oyuncunun yakın zamandaki, en az 2 kelimelik rastgele turu
create or replace function public.random_ghost()
returns setof public.runs
language sql security definer set search_path = public as $$
  select * from runs
  where user_id is distinct from auth.uid() and word_count >= 2
    and created_at > now() - interval '30 days'
  order by random() limit 1;
$$;

-- ---------- Haftalık Hat Ligi ----------
-- week: 'YYYY-Www' (ISO hafta), tier: 1 Tramvay … 5 Boğaz, group_no: 30'luk grup
create table if not exists public.league_members (
  week       text not null,
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 16),
  tier       integer not null check (tier between 1 and 5),
  group_no   integer not null,
  points     integer not null default 0 check (points >= 0),
  updated_at timestamptz not null default now(),
  primary key (week, user_id)
);
create index if not exists league_group_idx on public.league_members (week, tier, group_no, points desc);
alter table public.league_members enable row level security;
drop policy if exists "league readable" on public.league_members;
create policy "league readable" on public.league_members for select using (true);

-- Lige katıl (haftada bir): istenen lig önceki haftanınkinden en fazla bir basamak farklı olabilir.
-- Boş yeri olan (30'dan az) ilk gruba yerleşir, yoksa yeni grup açar.
create or replace function public.league_join(p_week text, p_name text, p_tier integer)
returns public.league_members
language plpgsql security definer set search_path = public as $$
declare
  v_prev integer;
  v_tier integer;
  v_group integer;
  v_row league_members;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  select * into v_row from league_members where week = p_week and user_id = auth.uid();
  if found then return v_row; end if;
  select tier into v_prev from league_members where user_id = auth.uid() and week < p_week order by week desc limit 1;
  v_tier := greatest(1, least(5, coalesce(p_tier, 1)));
  if v_prev is null then v_tier := 1;
  elsif abs(v_tier - v_prev) > 1 then v_tier := v_prev; end if;
  select group_no into v_group from league_members
    where week = p_week and tier = v_tier group by group_no having count(*) < 30 order by group_no limit 1;
  if v_group is null then
    select coalesce(max(group_no), 0) + 1 into v_group from league_members where week = p_week and tier = v_tier;
  end if;
  insert into league_members (week, user_id, name, tier, group_no)
  values (p_week, auth.uid(), left(coalesce(nullif(trim(p_name), ''), 'Yolcu'), 16), v_tier, v_group)
  returning * into v_row;
  return v_row;
end $$;

-- Puan ekle: tek çağrıda en fazla 50 puan, haftada en fazla 5000 (aşırı şişirmeyi sınırlar)
create or replace function public.league_add_points(p_week text, p_points integer)
returns integer
language plpgsql security definer set search_path = public as $$
declare v_points integer;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update league_members
    set points = least(5000, points + greatest(0, least(50, p_points))), updated_at = now()
    where week = p_week and user_id = auth.uid()
    returning points into v_points;
  return v_points;
end $$;

revoke all on function public.submit_run(bigint, text[], text[], integer, jsonb, text) from public, anon;
revoke all on function public.random_ghost() from public, anon;
revoke all on function public.league_join(text, text, integer) from public, anon;
revoke all on function public.league_add_points(text, integer) from public, anon;
grant execute on function public.submit_run(bigint, text[], text[], integer, jsonb, text) to authenticated;
grant execute on function public.random_ghost() to authenticated;
grant execute on function public.league_join(text, text, integer) to authenticated;
grant execute on function public.league_add_points(text, integer) to authenticated;
