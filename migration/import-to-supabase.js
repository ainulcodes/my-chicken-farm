#!/usr/bin/env node
/**
 * Import data hasil backup (JSON) ke Supabase.
 *
 * Prasyarat:
 *   1. Sudah menjalankan schema.sql di Supabase (tabel sudah ada).
 *   2. Sudah membuat migration/.env (lihat migration/.env.example):
 *        SUPABASE_URL=https://xxxx.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=eyJ...   (service_role, BUKAN anon — agar lolos RLS)
 *
 * Jalankan:
 *   node migration/import-to-supabase.js
 *   node migration/import-to-supabase.js --dir migration/backup/<timestamp>   (pilih backup tertentu)
 *
 * Sifat: idempotent (upsert by id) — aman dijalankan ulang.
 */

const fs = require('fs');
const path = require('path');

// ---------- Load migration/.env ----------
function loadEnv() {
  const file = path.join(__dirname, '.env');
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di migration/.env');
  console.error('   Lihat contoh di migration/.env.example');
  process.exit(1);
}

// ---------- Tentukan folder backup ----------
function resolveBackupDir() {
  const idx = process.argv.indexOf('--dir');
  if (idx !== -1 && process.argv[idx + 1]) return path.resolve(process.argv[idx + 1]);
  const latest = path.join(__dirname, 'backup', 'latest');
  if (fs.existsSync(latest)) return latest;
  // fallback: cari run terbaru secara alfabet (timestamp ISO -> urut)
  const base = path.join(__dirname, 'backup');
  const runs = fs.readdirSync(base).filter((d) => /^\d{4}-/.test(d)).sort();
  if (!runs.length) throw new Error('Tidak ada folder backup. Jalankan export-sheets.js dulu.');
  return path.join(base, runs[runs.length - 1]);
}
const BACKUP_DIR = resolveBackupDir();

// ---------- Helper konversi ----------
// Tanggal di Sheets disimpan sebagai tengah-malam WIB lalu jadi UTC
// (mis. "2024-05-31T17:00:00.000Z" = 1 Juni 2024 di WIB).
// Format ulang ke YYYY-MM-DD pakai zona Asia/Jakarta supaya tidak mundur 1 hari.
const wibFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
});
function toWibDate(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return wibFmt.format(d); // "2024-06-01"
}
function toInt(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}
function blankToNull(v) {
  return v === '' || v === undefined ? null : v;
}

// ---------- Mapper per tabel ----------
const MAP = {
  ayam_induk: (r) => ({
    id: r.id,
    kode: r.kode,
    jenis_kelamin: blankToNull(r.jenis_kelamin),
    ras: blankToNull(r.ras),
    warna: blankToNull(r.warna),
    tanggal_lahir: toWibDate(r.tanggal_lahir),
    status: blankToNull(r.status),
    folder_gdrive_id: blankToNull(r.folder_gdrive_id),
    folder_gdrive_url: blankToNull(r.folder_gdrive_url),
  }),
  breeding: (r) => ({
    id: r.id,
    pejantan_id: blankToNull(r.pejantan_id),
    betina_id: blankToNull(r.betina_id),
    tanggal_kawin: toWibDate(r.tanggal_kawin),
    tanggal_menetas: toWibDate(r.tanggal_menetas),
    jumlah_anakan: toInt(r.jumlah_anakan),
  }),
  ayam_anakan: (r) => ({
    id: r.id,
    breeding_id: blankToNull(r.breeding_id),
    kode: blankToNull(r.kode),
    jenis_kelamin: blankToNull(r.jenis_kelamin),
    warna: blankToNull(r.warna),
    status: blankToNull(r.status),
    folder_gdrive_id: blankToNull(r.folder_gdrive_id),
    folder_gdrive_url: blankToNull(r.folder_gdrive_url),
  }),
};

// Urutan WAJIB mengikuti foreign key: induk -> breeding -> anakan
const ORDER = ['ayam_induk', 'breeding', 'ayam_anakan'];

async function upsert(table, rows) {
  if (!rows.length) return { count: 0 };
  const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=id`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${table}: HTTP ${res.status} ${txt.slice(0, 400)}`);
  }
  return { count: rows.length };
}

async function main() {
  console.log('🗄️  Target :', SUPABASE_URL);
  console.log('📁 Backup :', BACKUP_DIR);
  console.log('');

  for (const table of ORDER) {
    const file = path.join(BACKUP_DIR, `${table}.json`);
    if (!fs.existsSync(file)) {
      console.log(`⏭️  ${table}: file tidak ada, dilewati`);
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const mapped = raw.map(MAP[table]);
    process.stdout.write(`→ ${table}: ${mapped.length} baris ... `);
    try {
      await upsert(table, mapped);
      console.log('✅');
    } catch (err) {
      console.log('❌');
      console.error('   ', err.message);
      process.exit(1);
    }
  }

  console.log('\n✔ Import selesai. Cek di Supabase Table Editor.');
}

main().catch((e) => { console.error('💥 Gagal:', e); process.exit(1); });
