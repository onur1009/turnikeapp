-- KVKK m.7 ve Google Play hesap silme şartı: oyuncu kendi verisini uygulama içinden siler.
-- auth.users satırı silinince players, runs ve league_members satırları "on delete cascade" ile gider.
-- Supabase panelinde SQL Editor'da bir kez çalıştır.

create or replace function public.delete_my_data()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'oturum yok';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_data() from public, anon;
grant execute on function public.delete_my_data() to authenticated;

-- Saklama süreleri (imha politikası): eski düello turları ve lig kayıtları periyodik silinir.
-- pg_cron eklentisi açıksa (Database > Extensions) haftalık temizlik:
--   select cron.schedule('turnike-retention', '0 4 * * 1', $$
--     delete from public.runs where created_at < now() - interval '90 days';
--     delete from public.league_members where week < to_char(now() - interval '8 weeks', 'IYYY-"W"IW');
--   $$);
