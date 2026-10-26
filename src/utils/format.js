// Bakiye store'da kuruş olarak tutulur (1500 = ₺15,00)
export const formatKurus = (val) => `₺${(val / 100).toFixed(2).replace('.', ',')}`;
