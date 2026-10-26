-- Turnike liderlik tablosu + satır güvenliği (RLS)
-- Supabase SQL Editor'de bir kez çalıştırın. Ayrıca Authentication > Sign In / Providers
-- altında "Allow anonymous sign-ins" açık olmalı (oyun her oyuncuya anonim oturum açar).
--
-- Kural: herkes sıralamayı okuyabilir; her oyuncu yalnızca kendi satırını (auth.uid())
-- ekleyip güncelleyebilir. Böylece başkasının kullanıcı adıyla skor gönderilemez.
-- Not: Oyuncu kendi skorunu tarayıcıdan şişirebilir; bunu engellemek için skorun sunucuda
-- hesaplanması gerekir (bu migration kapsamında değil).

create table if not exists public.players (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique check (char_length(username) between 3 and 15),
  score      integer not null default 0 check (score >= 0),
  level      integer not null default 0 check (level >= 0),
  updated_at timestamptz not null default now()
);

-- Eski şemadan (username anahtarlı, user_id'siz) geçiş: kolon yoksa ekle
alter table public.players add column if not exists user_id uuid references auth.users (id) on delete cascade;
create unique index if not exists players_user_id_key on public.players (user_id);

alter table public.players enable row level security;

drop policy if exists "players are readable by everyone" on public.players;
create policy "players are readable by everyone"
  on public.players for select
  using (true);

drop policy if exists "players insert own row" on public.players;
create policy "players insert own row"
  on public.players for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "players update own row" on public.players;
create policy "players update own row"
  on public.players for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Silme politikası yok: istemciden satır silinemez.
