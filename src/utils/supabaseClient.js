import { createClient } from '@supabase/supabase-js';

// Liderlik tablosu Supabase'te tutulur. Ayar için Vercel'de (ve yerelde .env.local'de):
//   VITE_SUPABASE_URL=https://<proje>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon key>
// Veritabanı tarafı: supabase/migrations/0001_players_rls.sql çalıştırılmalı ve
// Authentication > Sign In / Providers altında "Anonymous sign-ins" açılmalı.
// Supabase panelinden kopyalanan NEXT_PUBLIC_* adları da kabul edilir (vite.config envPrefix)
const env = import.meta.env;
const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ayar yoksa istemci hiç oluşturulmaz; eskiden yer tutucu adrese istek atıp hata üretiyordu
export const isCloudConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isCloudConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// Her oyuncu arka planda anonim bir Supabase oturumu alır. RLS kuralları bir satırı yalnızca
// sahibinin (auth.uid() = user_id) yazabilmesine izin verir; böylece kimse başkasının
// kullanıcı adıyla skor gönderip üzerine yazamaz.
export const ensureSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
};

export const cloudService = {
  // Liderlik tablosundaki en iyi 50 oyuncuyu çek. Hata ya da ayar yoksa null döner
  // (boş tablo [] ile bağlantı hatası ayırt edilebilsin).
  getTopPlayers: async () => {
    if (!isCloudConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('players')
        .select('username, score, level')
        .order('score', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase fetch error:', err);
      return null;
    }
  },

  // Mevcut oyuncunun verisini kaydet/güncelle (satır anahtarı: anonim oturumun user_id'si)
  syncData: async (username, data) => {
    if (!isCloudConfigured || !username) return;
    try {
      const session = await ensureSession();
      const { score, level } = data;
      const { error } = await supabase
        .from('players')
        .upsert({
          user_id: session.user.id,
          username,
          score,
          level,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // 23505: kullanıcı adı başka bir oyuncuya ait
      if (error) throw error;
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  }
};
