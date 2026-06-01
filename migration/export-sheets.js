#!/usr/bin/env node
/**
 * Export data dari Google Sheets (via Apps Script V1 endpoint) ke file backup.
 *
 * Output (per run, di folder bertanggal):
 *   migration/backup/<timestamp>/<sheet>.json   -> array of rows (apa adanya dari sheet)
 *   migration/backup/<timestamp>/<sheet>.csv     -> versi CSV
 *   migration/backup/<timestamp>/_manifest.json  -> ringkasan: jumlah baris, kolom, sumber
 *   migration/backup/latest -> symlink ke run terbaru
 *
 * Sifat: READ-ONLY. Hanya HTTP GET ke endpoint, tidak mengubah apa pun.
 *
 * Jalankan: node migration/export-sheets.js
 */

const fs = require('fs');
const path = require('path');

// --- Ambil API URL dari frontend/.env.local (fallback .env) ---
function readApiUrl() {
  const candidates = [
    path.join(__dirname, '..', 'frontend', '.env.local'),
    path.join(__dirname, '..', 'frontend', '.env'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const txt = fs.readFileSync(file, 'utf8');
    const m = txt.match(/REACT_APP_SHEETS_API_URL\s*=\s*(.+)/);
    if (m) return m[1].trim();
  }
  throw new Error('REACT_APP_SHEETS_API_URL tidak ditemukan di frontend/.env.local atau frontend/.env');
}

const API_URL = process.env.SHEETS_API_URL || readApiUrl();

// Path = nama sheet yang diexpose endpoint V1 (tanpa filter user -> ambil semua)
const PATHS = ['ayam_induk', 'breeding', 'ayam_anakan'];

// --- Util: ubah array of objects -> CSV (kolom = union semua key, urutan stabil) ---
function toCsv(rows) {
  if (!rows.length) return '';
  const cols = [];
  for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(','));
  return lines.join('\n');
}

async function fetchPath(p) {
  const url = `${API_URL}?path=${encodeURIComponent(p)}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} untuk path=${p}`);
  const json = await res.json();
  if (!json || json.success !== true) {
    throw new Error(`Response tidak success untuk path=${p}: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return Array.isArray(json.data) ? json.data : [];
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(__dirname, 'backup', stamp);
  fs.mkdirSync(outDir, { recursive: true });

  console.log('🔗 Sumber  :', API_URL);
  console.log('📁 Output  :', outDir);
  console.log('');

  const manifest = { exportedAt: new Date().toISOString(), source: API_URL, sheets: {} };

  for (const p of PATHS) {
    process.stdout.write(`→ ${p} ... `);
    try {
      const rows = await fetchPath(p);
      const cols = [];
      for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);

      fs.writeFileSync(path.join(outDir, `${p}.json`), JSON.stringify(rows, null, 2));
      fs.writeFileSync(path.join(outDir, `${p}.csv`), toCsv(rows));

      manifest.sheets[p] = { rows: rows.length, columns: cols };
      console.log(`✅ ${rows.length} baris | kolom: ${cols.join(', ') || '(kosong)'}`);
    } catch (err) {
      manifest.sheets[p] = { error: String(err.message || err) };
      console.log(`❌ ${err.message || err}`);
    }
  }

  fs.writeFileSync(path.join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2));

  // Update pointer "latest"
  const latest = path.join(__dirname, 'backup', 'latest');
  try { fs.rmSync(latest, { recursive: true, force: true }); } catch (_) {}
  try { fs.symlinkSync(stamp, latest, 'dir'); } catch (_) {
    fs.writeFileSync(path.join(__dirname, 'backup', 'LATEST.txt'), stamp);
  }

  console.log('\n✔ Backup selesai. Manifest:');
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((e) => { console.error('\n💥 Gagal:', e); process.exit(1); });
