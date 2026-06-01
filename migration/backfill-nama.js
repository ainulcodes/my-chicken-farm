#!/usr/bin/env node
/**
 * Isi nama & marga untuk data LAMA (yang masih kosong).
 *  - Tiap indukan dapat marga unik (tema makhluk kuno China) + nama.
 *  - Tiap anakan: marga mewarisi pejantan-nya + nama.
 *
 * Prasyarat:
 *  1. Sudah menjalankan migration/add-nama-marga.sql di Supabase.
 *  2. migration/.env berisi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY.
 *
 * Idempoten: baris yang sudah punya nama dilewati. Jalankan:
 *   node migration/backfill-nama.js
 */
const fs = require('fs');
const path = require('path');

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
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('❌ Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di migration/.env'); process.exit(1); }

const MARGA_POOL = ['Long','Feng','Qilin','Hu','Bao','Ying','Peng','Luan','He','Jiao','Kun','Chi','Lang','Pixiu','Taotie','Yazi','Suanni','Chiwen','Ao','Kui','Hong','She','Gui','Zhu'];
const NAMA_POOL = ['Long','Feng','Hu','Ying','Bao','Lang','Jiao','Peng','Luan','He','Kun','Chi','Wei','Fei','Lei','Yan','Yun','Tian','Hai','Shan','Jin','Yu'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function api(method, path, body) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res;
}
const getAll = async (table) => (await (await fetch(`${URL}/rest/v1/${table}?select=*`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })).json());

async function main() {
  const [induk, breeding] = await Promise.all([getAll('ayam_induk'), getAll('breeding')]);
  const anakan = await getAll('ayam_anakan');

  // --- Indukan: marga unik ---
  const usedMarga = new Set(induk.map((i) => (i.marga || '').trim()).filter(Boolean));
  const margaById = {};
  let poolIdx = 0;
  let updInduk = 0;
  for (const i of induk) {
    if ((i.marga || '').trim()) { margaById[i.id] = i.marga.trim(); continue; }
    let marga;
    do { marga = MARGA_POOL[poolIdx % MARGA_POOL.length] + (poolIdx >= MARGA_POOL.length ? String(Math.floor(poolIdx / MARGA_POOL.length) + 1) : ''); poolIdx++; } while (usedMarga.has(marga));
    usedMarga.add(marga);
    margaById[i.id] = marga;
    const nama = i.nama || rand(NAMA_POOL);
    await api('PATCH', `ayam_induk?id=eq.${i.id}`, { marga, nama });
    updInduk++;
  }
  console.log(`✅ Indukan diisi: ${updInduk}`);

  // --- Anakan: marga ikut pejantan ---
  const breedingById = Object.fromEntries(breeding.map((b) => [b.id, b]));
  let updAnakan = 0;
  for (const a of anakan) {
    if ((a.nama || '').trim() && (a.marga || '').trim()) continue;
    const b = breedingById[a.breeding_id];
    const marga = (b && margaById[b.pejantan_id]) || a.marga || '';
    const nama = a.nama || rand(NAMA_POOL);
    await api('PATCH', `ayam_anakan?id=eq.${a.id}`, { marga, nama });
    updAnakan++;
  }
  console.log(`✅ Anakan diisi: ${updAnakan}`);
  console.log('\n✔ Backfill nama selesai.');
}
main().catch((e) => { console.error('💥 Gagal:', e.message); process.exit(1); });
