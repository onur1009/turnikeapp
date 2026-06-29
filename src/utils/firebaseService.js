// Gelecekte gerçek Firebase / Supabase entegrasyonu yapıldığında bu dosya güncellenecektir.
// Şimdilik bulut senkronizasyonunu simüle eden (Mock) bir yapı kullanıyoruz.

class MockCloudService {
  constructor() {
    this.isConnected = false;
    this.uid = "user_" + Math.random().toString(36).substr(2, 9);
    console.log("[Cloud] Servis başlatıldı. UID:", this.uid);
  }

  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        console.log("[Cloud] Bağlantı başarılı.");
        resolve(true);
      }, 800);
    });
  }

  async syncData(data) {
    if (!this.isConnected) {
      await this.connect();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        // Gerçek bir senaryoda burada fetch/axios ile Firebase veya Supabase'e yazma işlemi yapılır.
        localStorage.setItem('turnike_cloud_backup', JSON.stringify(data));
        console.log("[Cloud] Veri buluta eşitlendi:", data);
        resolve(true);
      }, 500);
    });
  }

  async fetchUserData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('turnike_cloud_backup');
        resolve(data ? JSON.parse(data) : null);
      }, 500);
    });
  }
}

export const cloudService = new MockCloudService();
