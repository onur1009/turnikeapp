export const LOST_ITEMS_SETS = [
  {
    id: 'nostalji',
    name: 'Nostalji Seti',
    buffType: 'hint_discount',
    buffValue: 0.20, // 20% discount on hints
    description: 'İpuçları %20 indirimli olur.',
    items: ['item_ticket', 'item_cassette', 'item_walkman']
  },
  {
    id: 'unutkan',
    name: 'Unutkan Yolcu Seti',
    buffType: 'extra_life',
    buffValue: 1, // Max lives +1
    description: 'Maksimum can limitini 1 artırır.',
    items: ['item_umbrella', 'item_glasses', 'item_book']
  },
  {
    id: 'gizli',
    name: 'Gizemli Paket',
    buffType: 'bonus_balance',
    buffValue: 1.5, // 1.5x multiplier on level complete
    description: 'Bölüm sonu kazancını 1.5x katlar.',
    items: ['item_key', 'item_diary', 'item_box']
  }
];

export const LOST_ITEMS_CATALOG = {
  item_ticket: { id: 'item_ticket', name: 'Eski Bilet', description: 'Nostaljik bir İstanbul bileti.', lore: '1998 yılına ait, yırtılmamış bir vapur jetonu. Sahibinin vapura son anda yetişemediği ve bir daha o vapura binmediği söylenir.', icon: 'confirmation_number', rarity: 'common', value: 20 },
  item_cassette: { id: 'item_cassette', name: 'Yarım Kalmış Şarkı', description: 'Bir kasetçalar kasedi.', lore: 'Üzerinde "Sana Özel" yazıyor. İçindeki şarkıların kimin için kaydedildiği sonsuza dek bir sır olarak kalacak.', icon: 'album', rarity: 'rare', value: 50 },
  item_walkman: { id: 'item_walkman', name: 'Bozuk Walkman', description: 'Pili bitmiş eski bir müzik çalar.', lore: 'Metroda uzun yolculukların yegane dostu. Hâlâ çalışıyor olabilir mi?', icon: 'headphones', rarity: 'epic', value: 120 },
  
  item_umbrella: { id: 'item_umbrella', name: 'Kayıp Şemsiye', description: 'Vapurda unutulmuş.', lore: 'Hafif rüzgarlı bir günde Kadıköy iskelesinde bırakılmış. Neredeyse hiç kullanılmamış.', icon: 'umbrella', rarity: 'common', value: 15 },
  item_glasses: { id: 'item_glasses', name: 'Güneş Gözlüğü', description: 'Yazdan kalma bir hatıra.', lore: 'Sahibi muhtemelen vapurdaki rüzgara karşı takmıştı ama inerken koltuğunda düşürdü.', icon: 'visibility', rarity: 'common', value: 25 },
  item_book: { id: 'item_book', name: 'Eski Kitap', description: 'Sayfaları sararmış bir roman.', lore: 'Ayraç olarak kullanılan metro biletine göre tam 134. sayfada heyecan doruktayken bırakılmış.', icon: 'menu_book', rarity: 'rare', value: 60 },
  
  item_key: { id: 'item_key', name: 'Derin Bir Sır', description: 'Henüz kimse bilmiyor.', lore: 'Eski bir konağın ya da unutulmuş bir deponun anahtarı. Üzerinde hafif bir pas var.', icon: 'key', rarity: 'rare', value: 75 },
  item_diary: { id: 'item_diary', name: 'Kilitli Günlük', description: 'Küçük bir kilidi olan not defteri.', lore: 'Sayfalarında İstanbul\'un keşfedilmemiş duraklarına dair gizli notlar olduğu fısıldanıyor.', icon: 'auto_stories', rarity: 'epic', value: 150 },
  item_box: { id: 'item_box', name: 'Mühürlü Kutu', description: 'Küçük ahşap bir kutu.', lore: 'Açılmamış ve açılması da pek tavsiye edilmiyor. Ağırlığı hissettiriyor ki içi boş değil.', icon: 'inventory_2', rarity: 'legendary', value: 300 },
};

export const getRandomItem = () => {
  const items = Object.values(LOST_ITEMS_CATALOG);
  const rand = Math.random() * 100;
  
  let targetRarity;
  if (rand < 60) targetRarity = 'common'; // 60% chance
  else if (rand < 90) targetRarity = 'rare'; // 30% chance
  else if (rand < 98) targetRarity = 'epic'; // 8% chance
  else targetRarity = 'legendary'; // 2% chance

  const filtered = items.filter(item => item.rarity === targetRarity);
  if (filtered.length === 0) return items[0].id;
  
  return filtered[Math.floor(Math.random() * filtered.length)].id;
};
