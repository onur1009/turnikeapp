// Sunucu tarafı oyun işlemleri (Supabase, supabase/migrations/0002_duels_league.sql).
// Supabase ayarlı değilse ya da istek başarısızsa her fonksiyon null döner; çağıran taraf
// çevrimdışı akışa (bağlantıda skor, botlarla lig) düşer.
import { supabase, isCloudConfigured, ensureSession } from './supabaseClient';

const call = async (fn) => {
  if (!isCloudConfigured) return null;
  try {
    await ensureSession();
    return await fn();
  } catch (err) {
    console.warn('Cloud call failed:', err?.message || err);
    return null;
  }
};

// Düello/hayalet turunu gönder; sunucu kelimeleri bulmacaya göre doğrular. Dönüş: tur id'si.
export const submitRun = ({ seed, puzzle, found, seconds, timeline, name }) => call(async () => {
  const { data, error } = await supabase.rpc('submit_run', {
    p_seed: seed, p_puzzle: puzzle, p_found: found, p_seconds: Math.max(1, Math.min(120, seconds)), p_timeline: timeline, p_name: name,
  });
  if (error) throw error;
  return data;
});

export const fetchRun = (id) => call(async () => {
  const { data, error } = await supabase.from('runs').select('id, seed, name, word_count, seconds, timeline').eq('id', id).single();
  if (error) throw error;
  return data;
});

export const randomGhost = () => call(async () => {
  const { data, error } = await supabase.rpc('random_ghost');
  if (error) throw error;
  return data?.[0] || null;
});

export const leagueJoin = (week, name, tier) => call(async () => {
  const { data, error } = await supabase.rpc('league_join', { p_week: week, p_name: name, p_tier: tier });
  if (error) throw error;
  return data;
});

export const leagueAddPoints = (week, points) => call(async () => {
  const { data, error } = await supabase.rpc('league_add_points', { p_week: week, p_points: points });
  if (error) throw error;
  return data;
});

export const leagueGroup = (week, tier, groupNo) => call(async () => {
  const { data, error } = await supabase.from('league_members')
    .select('user_id, name, points').eq('week', week).eq('tier', tier).eq('group_no', groupNo)
    .order('points', { ascending: false }).limit(30);
  if (error) throw error;
  return data;
});

export const currentUserId = () => call(async () => (await ensureSession())?.user?.id || null);
