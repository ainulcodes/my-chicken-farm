/**
 * Supabase API — pengganti api-v1.js (Google Sheets).
 *
 * Interface SENGAJA dibuat identik dengan apiV1 lama supaya cachedApi.js dan
 * semua komponen tidak perlu diubah:
 *   getX()            -> Array
 *   addX(data)        -> { success, data }
 *   updateX(id, data) -> { success }
 *   deleteX(id)       -> { success }
 *
 * Nama kolom mengikuti skema Sheets (snake_case), sama persis dengan yang
 * dirender komponen: kode, jenis_kelamin, tanggal_lahir, pejantan_id, dst.
 */

import { supabase } from './supabaseClient';

// Hanya kolom yang relevan untuk tiap tabel (mencegah field asing masuk ke insert).
const FIELDS = {
  ayam_induk: [
    'kode', 'nama', 'marga', 'jenis_kelamin', 'ras', 'warna', 'tanggal_lahir', 'status',
    'folder_gdrive_id', 'folder_gdrive_url',
  ],
  breeding: [
    'pejantan_id', 'betina_id', 'tanggal_kawin', 'tanggal_menetas', 'jumlah_anakan',
  ],
  ayam_anakan: [
    'breeding_id', 'kode', 'nama', 'marga', 'jenis_kelamin', 'warna', 'status',
    'folder_gdrive_id', 'folder_gdrive_url',
  ],
};

// Ambil hanya field yang dikenal; ubah string kosong tanggal -> null.
function pick(table, data) {
  const out = {};
  for (const key of FIELDS[table]) {
    if (data[key] === undefined) continue;
    let v = data[key];
    if ((key.startsWith('tanggal_') || key === 'jumlah_anakan') && v === '') v = null;
    out[key] = v;
  }
  return out;
}

async function getAll(table, extra) {
  let query = supabase.from(table).select('*');
  if (extra && extra.eq) query = query.eq(extra.eq.col, extra.eq.val);
  const { data, error } = await query;
  if (error) {
    console.error(`Get ${table} error:`, error.message);
    return [];
  }
  return data || [];
}

async function addRow(table, data) {
  const { data: rows, error } = await supabase
    .from(table)
    .insert(pick(table, data))
    .select()
    .single();
  if (error) {
    console.error(`Add ${table} error:`, error.message);
    throw error;
  }
  return { success: true, data: rows };
}

async function updateRow(table, id, data) {
  const { error } = await supabase.from(table).update(pick(table, data)).eq('id', id);
  if (error) {
    console.error(`Update ${table} error:`, error.message);
    throw error;
  }
  return { success: true };
}

async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.error(`Delete ${table} error:`, error.message);
    throw error;
  }
  return { success: true };
}

class SupabaseAPI {
  // ---------- Ayam Induk ----------
  getAyamInduk() { return getAll('ayam_induk'); }
  addAyamInduk(data) { return addRow('ayam_induk', data); }
  updateAyamInduk(id, data) { return updateRow('ayam_induk', id, data); }
  deleteAyamInduk(id) { return deleteRow('ayam_induk', id); }

  // ---------- Breeding ----------
  getBreeding() { return getAll('breeding'); }
  addBreeding(data) { return addRow('breeding', data); }
  updateBreeding(id, data) { return updateRow('breeding', id, data); }
  deleteBreeding(id) { return deleteRow('breeding', id); }

  // ---------- Ayam Anakan ----------
  getAyamAnakan(breedingId = null) {
    return getAll('ayam_anakan', breedingId ? { eq: { col: 'breeding_id', val: breedingId } } : null);
  }
  addAyamAnakan(data) { return addRow('ayam_anakan', data); }
  updateAyamAnakan(id, data) { return updateRow('ayam_anakan', id, data); }
  deleteAyamAnakan(id) { return deleteRow('ayam_anakan', id); }
}

// Export dengan nama apiV1 agar drop-in di cachedApi.js
export const apiV1 = new SupabaseAPI();
