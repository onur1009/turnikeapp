import { createClient } from '@supabase/supabase-js';

// TODO: Lütfen .env dosyanızı oluşturup VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini girin.
// Örnek:
// VITE_SUPABASE_URL=https://<your-project>.supabase.co
// VITE_SUPABASE_ANON_KEY=<your-anon-key>

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Basit bir wrapper servisi oluşturuyoruz.
export const cloudService = {
  // Liderlik tablosundaki en iyi 50 oyuncuyu çek
  getTopPlayers: async () => {
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
      return []; // Hata durumunda boş liste dön (oyun çökmesin)
    }
  },

  // Mevcut oyuncunun verisini kaydet/güncelle
  syncData: async (username, data) => {
    try {
      if (!username) return;

      const { score, level } = data;
      
      // Upsert: Kullanıcı adı varsa güncelle, yoksa ekle (username unique olmalı)
      const { error } = await supabase
        .from('players')
        .upsert({ 
          username, 
          score, 
          level, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'username' });

      if (error) throw error;
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  }
};
