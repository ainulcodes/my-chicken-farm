/**
 * Auto-suggest kode ayam mengikuti pola data asli:
 *   PREFIX-GRUP-HURUF+NOMOR   contoh: BTN-001-H4, JTN-002-M3
 *
 * Aturan (hasil analisis data nyata):
 * - PREFIX : kelamin -> Betina "BTN"; Jantan "JNT" (indukan) / "JTN" (anakan)
 * - GRUP   : "001" indukan, "002" anakan
 * - HURUF  : inisial huruf pertama WARNA (Merah->M, Hitam->H, Putih->P)
 * - NOMOR  : urut per (kelamin + huruf-warna), GABUNGAN tabel indukan & anakan,
 *            lintas grup. Contoh "Betina Hitam": H1..H9 menyatu walau beda grup.
 *
 * @param allCodes  array berisi semua kode (string) dari indukan + anakan
 * @param opts      { gender, warna, module: 'indukan' | 'anakan' }
 * Hasil dijamin tidak bentrok dengan kode yang sudah ada.
 */
export function suggestKode(allCodes = [], { gender, warna, module }) {
  const w = (warna || '').trim();
  if (!gender || !w) return '';

  const letter = w.charAt(0).toUpperCase();
  const prefix = gender === 'Betina' ? 'BTN' : module === 'anakan' ? 'JTN' : 'JNT';
  const group = module === 'anakan' ? '002' : '001';

  // Kode satu kelamin: Betina -> BTN-*, Jantan -> JNT-* atau JTN-*
  const sexPrefixes = gender === 'Betina' ? ['BTN'] : ['JNT', 'JTN'];
  const re = new RegExp(`^(?:${sexPrefixes.join('|')})-\\d+-([A-Za-z]+)(\\d+)$`);

  const used = new Set(allCodes.map((c) => (c || '').trim()));
  let maxNum = 0;
  for (const c of allCodes) {
    const m = (c || '').trim().match(re);
    if (m && m[1].toUpperCase() === letter) {
      const n = parseInt(m[2], 10);
      if (n > maxNum) maxNum = n;
    }
  }

  let n = maxNum + 1;
  let candidate = `${prefix}-${group}-${letter}${n}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${prefix}-${group}-${letter}${n}`;
  }
  return candidate;
}
