# 📊 Contoh Data - Breeding Ayam Super

Dokumen ini berisi contoh data yang bisa Anda gunakan untuk testing atau sebagai referensi.

---

## 📋 Sheet 1: users

Data user akan otomatis terisi saat login pertama kali. Tidak perlu input manual.

| id | email | display_name | photo_url | uid | created_at |
|----|-------|--------------|-----------|-----|------------|
| uuid-001 | john@gmail.com | John Doe | https://... | google-uid-123 | 2024-01-15T10:00:00Z |
| uuid-002 | jane@gmail.com | Jane Smith | https://... | google-uid-456 | 2024-01-16T11:30:00Z |

---

## 🐓 Sheet 2: ayam_induk

### Contoh Data Ayam Jantan

| id | kode | jenis_kelamin | ras | warna | tanggal_lahir | pemilik_email |
|----|------|---------------|-----|-------|---------------|---------------|
| ind-001 | PJT-001 | Jantan | Bangkok | Hitam | 2023-01-15 | john@gmail.com |
| ind-002 | PJT-002 | Jantan | Saigon | Merah Hitam | 2023-02-20 | john@gmail.com |
| ind-003 | PJT-003 | Jantan | Burma | Putih | 2023-03-10 | john@gmail.com |
| ind-004 | PJT-004 | Jantan | Thailand | Coklat | 2023-01-25 | john@gmail.com |
| ind-005 | PJT-005 | Jantan | Manila | Abu-abu | 2023-04-05 | john@gmail.com |

### Contoh Data Ayam Betina

| id | kode | jenis_kelamin | ras | warna | tanggal_lahir | pemilik_email |
|----|------|---------------|-----|-------|---------------|---------------|
| ind-006 | BTN-001 | Betina | Bangkok | Hitam | 2023-02-10 | john@gmail.com |
| ind-007 | BTN-002 | Betina | Saigon | Merah | 2023-03-15 | john@gmail.com |
| ind-008 | BTN-003 | Betina | Burma | Putih | 2023-01-20 | john@gmail.com |
| ind-009 | BTN-004 | Betina | Thailand | Coklat | 2023-04-12 | john@gmail.com |
| ind-010 | BTN-005 | Betina | Manila | Abu-abu | 2023-02-28 | john@gmail.com |

### Tips Kode Ayam:
- **PJT**: Pejantan (Jantan)
- **BTN**: Betina
- **IND**: Indukan (general)
- Format: `[PREFIX]-[NOMOR]`
- Nomor bisa sequential (001, 002, dst)

### Ras Populer:
- Bangkok (Thailand)
- Saigon (Vietnam)
- Burma (Myanmar)
- Manila (Philippines)
- Shamo (Jepang)
- Asil (India/Pakistan)
- Lemon (Lokal)

### Warna Umum:
- Hitam
- Merah
- Putih
- Coklat
- Abu-abu
- Kuning
- Kombinasi (Hitam Merah, Merah Putih, dll)

---

## 💑 Sheet 3: breeding

| id | pejantan_id | betina_id | tanggal_kawin | tanggal_menetas | jumlah_anakan | pemilik_email |
|----|-------------|-----------|---------------|-----------------|---------------|---------------|
| br-001 | ind-001 | ind-006 | 2024-01-10 | 2024-02-01 | 8 | john@gmail.com |
| br-002 | ind-002 | ind-007 | 2024-01-15 | 2024-02-06 | 6 | john@gmail.com |
| br-003 | ind-003 | ind-008 | 2024-01-20 | 2024-02-11 | 7 | john@gmail.com |
| br-004 | ind-004 | ind-009 | 2024-02-01 | 2024-02-23 | 5 | john@gmail.com |
| br-005 | ind-001 | ind-007 | 2024-02-10 | 2024-03-03 | 9 | john@gmail.com |

### Informasi Breeding:
- **Masa Inkubasi**: Sekitar 21 hari (3 minggu)
- **Tanggal Kawin**: Saat ayam dijodohkan
- **Tanggal Menetas**: Perkiraan atau aktual telur menetas
- **Jumlah Anakan**: Total anak yang menetas

### Tips:
- Catat tanggal kawin untuk tracking
- Update jumlah anakan setelah telur menetas
- Bisa breeding ulang pejantan yang sama dengan betina berbeda
- Monitor kesehatan indukan setelah breeding

---

## 🐣 Sheet 4: ayam_anakan

| id | breeding_id | kode | jenis_kelamin | warna | status | pemilik_email |
|----|-------------|------|---------------|-------|--------|---------------|
| ank-001 | br-001 | ANK-001-A | Jantan | Hitam | Sehat | john@gmail.com |
| ank-002 | br-001 | ANK-001-B | Betina | Hitam | Sehat | john@gmail.com |
| ank-003 | br-001 | ANK-001-C | Jantan | Hitam Merah | Sehat | john@gmail.com |
| ank-004 | br-001 | ANK-001-D | Betina | Merah | Dijual | john@gmail.com |
| ank-005 | br-002 | ANK-002-A | Jantan | Merah Hitam | Sehat | john@gmail.com |
| ank-006 | br-002 | ANK-002-B | Jantan | Merah | Sehat | john@gmail.com |
| ank-007 | br-002 | ANK-002-C | Betina | Hitam | Sakit | john@gmail.com |
| ank-008 | br-003 | ANK-003-A | Jantan | Putih | Sehat | john@gmail.com |
| ank-009 | br-003 | ANK-003-B | Betina | Putih | Sehat | john@gmail.com |
| ank-010 | br-003 | ANK-003-C | Jantan | Abu-abu | Mati | john@gmail.com |

### Sistem Kode Anakan:
- Format: `ANK-[BREEDING_NO]-[URUTAN]`
- Contoh: `ANK-001-A`, `ANK-001-B`, dst
- BREEDING_NO: Nomor breeding parent
- URUTAN: A, B, C, atau 1, 2, 3

### Status Anakan:
- **Sehat**: Kondisi normal, sedang dirawat
- **Sakit**: Sedang dalam perawatan/treatment
- **Dijual**: Sudah dijual/dipindahtangankan
- **Mati**: Sudah mati (untuk record)

### Tips Pengelolaan Anakan:
1. Beri kode yang sistematis untuk mudah tracking
2. Update status secara berkala
3. Catat anakan yang promising untuk jadi indukan
4. Track lineage (keturunan) untuk breeding berkualitas

---

## 📊 Contoh Skenario Lengkap

### Skenario: Breeding Bangkok x Saigon

**Step 1: Persiapan Indukan**
```
Pejantan: PJT-001 (Bangkok, Hitam)
Betina:   BTN-002 (Saigon, Merah)
```

**Step 2: Proses Breeding**
```
Tanggal Kawin: 2024-03-01
Tanggal Telur: 2024-03-02 (mulai bertelur)
Masa Inkubasi: 21 hari
Tanggal Menetas: 2024-03-23 (estimasi)
```

**Step 3: Hasil Breeding**
```
Total Telur: 10
Telur Menetas: 8
Gagal: 2

Anakan:
- ANK-BS-01: Jantan, Hitam Merah, Sehat
- ANK-BS-02: Jantan, Hitam, Sehat
- ANK-BS-03: Betina, Merah, Sehat
- ANK-BS-04: Jantan, Merah Hitam, Sehat
- ANK-BS-05: Betina, Hitam, Sehat
- ANK-BS-06: Jantan, Merah, Sehat
- ANK-BS-07: Betina, Merah Hitam, Sehat
- ANK-BS-08: Jantan, Hitam, Sehat
```

**Step 4: Monitoring & Update**
```
Umur 1 bulan:
- ANK-BS-01: Sehat, potensial jadi pejantan
- ANK-BS-04: Dijual (Rp 500.000)
- ANK-BS-07: Sakit (cacing)

Umur 3 bulan:
- ANK-BS-01: Sehat, latihan sparring
- ANK-BS-02: Dijual (Rp 750.000)
- ANK-BS-07: Sembuh, Sehat

Umur 6 bulan:
- ANK-BS-01: Promosi jadi indukan (ganti kode jadi PJT-006)
```

---

## 🎯 Best Practices

### 1. Naming Convention
- Gunakan prefix yang jelas (PJT, BTN, ANK)
- Sequential numbering untuk mudah tracking
- Dokumentasikan sistem kode Anda

### 2. Data Entry
- Input data segera setelah event (kawin, menetas)
- Selalu isi semua field yang required
- Gunakan format tanggal konsisten

### 3. Monitoring
- Review data breeding setiap minggu
- Update status anakan secara berkala
- Archive data old/tidak aktif

### 4. Record Keeping
- Jangan hapus data historical
- Gunakan status "Dijual" atau "Mati" daripada delete
- Backup Google Sheets secara berkala

### 5. Analysis
- Track success rate breeding per pasangan
- Identifikasi indukan dengan offspring terbaik
- Monitor pola warna dan karakteristik

---

## 📥 Import Contoh Data

Jika ingin import contoh data di atas:

1. Copy data dari tabel di atas
2. Paste ke Google Sheets (Ctrl+V atau Cmd+V)
3. Pastikan paste di row yang benar (di bawah header)
4. Adjust ID dan email sesuai kebutuhan
5. Refresh aplikasi untuk lihat data

**Atau**

1. Download template spreadsheet (jika tersedia)
2. File > Import ke Google Sheets Anda
3. Replace/Append data

---

Selamat mencoba! Data ini hanya contoh, silakan sesuaikan dengan data real Anda. 🐔📊
