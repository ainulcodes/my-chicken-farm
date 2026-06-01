/**
 * Generator nama ayam bertema makhluk/binatang kuno China (Latin / aksara Indonesia).
 *  - Marga (nama keluarga): unik per indukan.
 *  - Nama panggilan: dari pool, dikombinasikan jadi "Marga Nama" (urutan China).
 *  Contoh: "Long Wei" (naga-perkasa), "Feng Yun" (phoenix-awan), "Hu Lei" (harimau-petir).
 */

// Marga = makhluk legendaris China
export const MARGA_POOL = [
  'Long',    // 龙  naga
  'Feng',    // 凤  phoenix
  'Qilin',   // 麒麟 kilin
  'Hu',      // 虎  harimau
  'Bao',     // 豹  macan tutul
  'Ying',    // 鹰  elang
  'Peng',    // 鹏  roc raksasa
  'Luan',    // 鸾  burung phoenix
  'He',      // 鹤  bangau
  'Jiao',    // 蛟  naga air
  'Kun',     // 鲲  ikan raksasa
  'Chi',     // 螭  naga tanpa tanduk
  'Lang',    // 狼  serigala
  'Pixiu',   // 貔貅 pixiu
  'Taotie',  // 饕餮 taotie
  'Yazi',    // 睚眦 yazi
  'Suanni',  // 狻猊 suanni
  'Chiwen',  // 螭吻 chiwen
  'Ao',      // 鳌  kura naga
  'Kui',     // 夔  makhluk berkaki satu
  'Hong',    // 虹  ular pelangi
  'She',     // 蛇  ular
  'Gui',     // 龟  kura-kura
  'Zhu',     // 朱(雀) burung merah
];

// Nama panggilan = campuran makhluk + kata gagah
export const NAMA_POOL = [
  'Long', 'Feng', 'Hu', 'Ying', 'Bao', 'Lang', 'Jiao', 'Peng', 'Luan', 'He', 'Kun', 'Chi',
  'Wei',  // 威 perkasa
  'Fei',  // 飞 terbang
  'Lei',  // 雷 petir
  'Yan',  // 焱 api
  'Yun',  // 云 awan
  'Tian', // 天 langit
  'Hai',  // 海 laut
  'Shan', // 山 gunung
  'Jin',  // 金 emas
  'Yu',   // 玉 giok
];

/** Marga unik untuk indukan baru (tidak bentrok dengan marga yang sudah ada). */
export function suggestMarga(usedMargas = []) {
  const used = new Set(usedMargas.map((m) => (m || '').trim()).filter(Boolean));
  const free = MARGA_POOL.find((m) => !used.has(m));
  if (free) return free;
  // Pool habis -> kombinasikan dua kata makhluk (mis. "Long Feng")
  for (const a of MARGA_POOL) {
    for (const b of MARGA_POOL) {
      const cand = `${a}${b.toLowerCase()}`;
      if (!used.has(cand)) return cand;
    }
  }
  return MARGA_POOL[0];
}

/** Nama panggilan; usahakan "Marga Nama" belum dipakai. */
export function suggestNama(marga, usedFullNames = []) {
  const used = new Set(usedFullNames.map((n) => (n || '').trim()).filter(Boolean));
  const shuffled = [...NAMA_POOL].sort(() => Math.random() - 0.5);
  for (const n of shuffled) {
    if (!used.has(`${marga} ${n}`.trim())) return n;
  }
  return NAMA_POOL[Math.floor(Math.random() * NAMA_POOL.length)];
}

/** Gabungan nama lengkap (urutan China: marga dulu). */
export function fullName(marga, nama) {
  return [marga, nama].map((x) => (x || '').trim()).filter(Boolean).join(' ');
}
