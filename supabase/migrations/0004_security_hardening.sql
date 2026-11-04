-- Güvenlik sertleştirmesi (0001–0003'ten SONRA, Supabase SQL Editor'da bir kez çalıştır).
-- Kapattığı açıklar:
--  1. Puzzles zehirleme: ilk gönderen bir seed için istediği kelimeleri kaydedebiliyordu.
--     Artık kelimeler yalnızca büyük harf (Türkçe dahil), 2–10 harf, en çok 12 kelime.
--  2. Depolama şişirme: timeline jsonb ve found dizisi sınırsızdı; artık boyut sınırlı.
--  3. Spam: bir hesap saniyede yüzlerce tur gönderebiliyordu; saatte 60 tur sınırı.
--  4. Lig: p_week serbest metindi (gelecek haftalara ya da çöp haftalara katılım). Artık yalnızca
--     bu hafta (katılım) ve bu hafta (puan) kabul edilir.
--  5. İsimler: kontrol karakterleri ve yön değiştiren Unicode (RTL override) temizlenir;
--     sıralamada başka oyuncu gibi görünme / metni ters çevirme engellenir.
--  6. runs.user_id herkese açıktı; istemci bu kolonu okumuyor, okuma izni kaldırıldı.

-- ---------- Yardımcılar ----------
create or replace function public.clean_name(p text, p_max integer default 16)
returns text language sql immutable set search_path = public as $$
  select left(coalesce(nullif(trim(regexp_replace(coalesce(p, ''),
    '[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩﻿]', '', 'g')), ''), 'Yolcu'), p_max);
$$;

create or replace function public.current_week()
returns text language sql stable set search_path = public as $$
  select to_char(now() at time zone 'Europe/Istanbul', 'IYYY-"W"IW');
$$;

create or replace function public.valid_words(p text[])
returns boolean language sql immutable set search_path = public as $$
  select p is not null and cardinality(p) between 1 and 12
     and not exists (select 1 from unnest(p) w where w !~ '^[A-ZÇĞİÖŞÜ]{2,10}$');
$$;

-- ---------- Tur gönder ----------
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
  if not valid_words(p_puzzle) or cardinality(p_puzzle) < 2 then raise exception 'invalid_puzzle'; end if;
  if cardinality(coalesce(p_found, '{}')) > 12 then raise exception 'invalid_words'; end if;
  if p_timeline is not null and (jsonb_typeof(p_timeline) <> 'array'
     or jsonb_array_length(p_timeline) > 24 or pg_column_size(p_timeline) > 2048) then
    raise exception 'invalid_timeline';
  end if;
  if (select count(*) from runs where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limited';
  end if;
  insert into puzzles (seed, words) values (p_seed, p_puzzle) on conflict (seed) do nothing;
  select words into v_words from puzzles where seed = p_seed;
  if (select array_agg(w order by w) from unnest(v_words) w) is distinct from
     (select array_agg(w order by w) from unnest(p_puzzle) w) then
    raise exception 'puzzle_mismatch';
  end if;
  select coalesce(array_agg(distinct f), '{}') into v_found from unnest(coalesce(p_found, '{}')) f where f = any (v_words);
  if cardinality(v_found) <> cardinality(coalesce(p_found, '{}')) then raise exception 'invalid_words'; end if;
  if p_seconds < 1 or p_seconds > 120 or p_seconds < floor(cardinality(v_found) * 1.5) then
    raise exception 'invalid_time';
  end if;
  insert into runs (seed, user_id, name, found, word_count, seconds, timeline)
  values (p_seed, auth.uid(), clean_name(p_name), v_found, cardinality(v_found), p_seconds, coalesce(p_timeline, '[]'::jsonb))
  returning id into v_id;
  return v_id;
end $$;

-- ---------- Lig ----------
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
  -- İstemci saati gece yarısı farkıyla bir önceki haftada olabilir; ikisi de kabul
  if p_week is distinct from current_week()
     and p_week is distinct from to_char(now() at time zone 'Europe/Istanbul' - interval '1 day', 'IYYY-"W"IW') then
    raise exception 'invalid_week';
  end if;
  select * into v_row from league_members where week = p_week and user_id = auth.uid();
  if found then return v_row; end if;
  select tier into v_prev from league_members where user_id = auth.uid() and week < p_week order by week desc limit 1;
  v_tier := greatest(1, least(5, coalesce(p_tier, 1)));
  if v_prev is null then v_tier := 1;
  elsif abs(v_tier - v_prev) > 1 then v_tier := v_prev; end if;
  -- Aynı gruba eşzamanlı yerleşmede 30'u aşmamak için hafta+lig başına kilit
  perform pg_advisory_xact_lock(hashtext(p_week || ':' || v_tier));
  select group_no into v_group from league_members
    where week = p_week and tier = v_tier group by group_no having count(*) < 30 order by group_no limit 1;
  if v_group is null then
    select coalesce(max(group_no), 0) + 1 into v_group from league_members where week = p_week and tier = v_tier;
  end if;
  insert into league_members (week, user_id, name, tier, group_no)
  values (p_week, auth.uid(), clean_name(p_name), v_tier, v_group)
  returning * into v_row;
  return v_row;
end $$;

create or replace function public.league_add_points(p_week text, p_points integer)
returns integer
language plpgsql security definer set search_path = public as $$
declare v_points integer;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update league_members
    set points = least(5000, points + greatest(0, least(50, p_points))), updated_at = now()
    where week = p_week and user_id = auth.uid()
      and (week = current_week() or week = to_char(now() at time zone 'Europe/Istanbul' - interval '1 day', 'IYYY-"W"IW'))
    returning points into v_points;
  return v_points;
end $$;

-- ---------- Liderlik tablosu: isim temizliği ----------
create or replace function public.players_clean()
returns trigger language plpgsql set search_path = public as $$
begin
  new.username := clean_name(new.username, 15);
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists players_clean on public.players;
create trigger players_clean before insert or update on public.players
  for each row execute function public.players_clean();

-- ---------- Kolon gizliliği: runs.user_id okunamaz ----------
revoke select on public.runs from anon, authenticated;
grant select (id, seed, name, found, word_count, seconds, timeline, created_at) on public.runs to anon, authenticated;

-- ---------- Yetkiler ----------
-- clean_name saf fonksiyon; players tetikleyicisi oyuncu yetkisiyle çağırdığı için authenticated açık kalır
revoke all on function public.valid_words(text[]) from public, anon, authenticated;
revoke all on function public.submit_run(bigint, text[], text[], integer, jsonb, text) from public, anon;
revoke all on function public.league_join(text, text, integer) from public, anon;
revoke all on function public.league_add_points(text, integer) from public, anon;
grant execute on function public.submit_run(bigint, text[], text[], integer, jsonb, text) to authenticated;
grant execute on function public.league_join(text, text, integer) to authenticated;
grant execute on function public.league_add_points(text, integer) to authenticated;
