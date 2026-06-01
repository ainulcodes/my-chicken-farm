import React, { useState, useEffect, useMemo } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, RefreshCw, Pencil, Trash2, Egg, Network, Flame } from 'lucide-react';
import {
  PageHeader, StatusPill, GenderPill, DataTable, Pagination,
  Toolbar, EmptyState, ConfirmDialog,
} from './primitives';
import { formatDate, getAgeInDays } from '../../utils/workflowHelpers';
import { suggestKode } from '../../utils/kode';
import { suggestNama, fullName } from '../../utils/nama';

const EMPTY = { breeding_id: '', kode: '', nama: '', marga: '', jenis_kelamin: '', warna: '', status: 'Sehat' };
const PER_PAGE = 10;

export default function AnakanPage({ onNavigateToTrah }) {
  const [list, setList] = useState([]);
  const [breedingList, setBreedingList] = useState([]);
  const [induk, setInduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [kodeAuto, setKodeAuto] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [filters, setFilters] = useState({ breeding_id: 'all', jenis_kelamin: 'all', status: 'all' });
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, []);

  const load = async (force = false) => {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const [a, b, i] = await Promise.all([
        cachedAPI.getAyamAnakan(null, force),
        cachedAPI.getBreeding(force),
        cachedAPI.getAyamInduk(force),
      ]);
      setList(a.data || []);
      setBreedingList(b.data || []);
      setInduk(i.data || []);
      if (force) toast.success('Data disinkronkan');
    } catch {
      toast.error('Gagal memuat data anakan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const breedingById = (id) => breedingList.find((b) => b.id === id);
  const indukById = (id) => induk.find((a) => a.id === id);
  const breedingLabel = (b) => {
    const p = indukById(b.pejantan_id);
    const bt = indukById(b.betina_id);
    return `${formatDate(b.tanggal_menetas)} • ${p?.kode || '?'} × ${bt?.kode || '?'}`;
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setKodeAuto(true); setDialogOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setKodeAuto(false);
    setForm({
      breeding_id: a.breeding_id || '', kode: a.kode || '', nama: a.nama || '', marga: a.marga || '',
      jenis_kelamin: a.jenis_kelamin || '', warna: a.warna || '', status: a.status || 'Sehat',
    });
    setDialogOpen(true);
  };

  // Pilih breeding -> marga mewarisi pejantan, nama otomatis.
  const onBreedingChange = (v) => {
    const b = breedingById(v);
    const pejantan = b ? indukById(b.pejantan_id) : null;
    const marga = pejantan?.marga || '';
    setForm((f) => {
      const next = { ...f, breeding_id: v, marga };
      if (!editing && (!f.nama || f.nama === '')) {
        next.nama = suggestNama(marga, list.map((x) => fullName(x.marga, x.nama)));
      }
      return next;
    });
  };

  // Kode otomatis dari (kelamin + warna), nomor gabungan anakan + indukan.
  const allCodes = useMemo(
    () => [...list.map((x) => x.kode), ...induk.map((x) => x.kode)],
    [list, induk]
  );

  const onGenderChange = (v) => {
    setForm((f) => {
      const next = { ...f, jenis_kelamin: v };
      if (kodeAuto) next.kode = suggestKode(allCodes, { gender: v, warna: f.warna, module: 'anakan' });
      return next;
    });
  };

  const onWarnaChange = (e) => {
    const warna = e.target.value;
    setForm((f) => {
      const next = { ...f, warna };
      if (kodeAuto) next.kode = suggestKode(allCodes, { gender: f.jenis_kelamin, warna, module: 'anakan' });
      return next;
    });
  };

  const onKodeChange = (e) => { setKodeAuto(false); setForm((f) => ({ ...f, kode: e.target.value })); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const res = await cachedAPI.updateAyamAnakan(editing.id, form);
        if (res.success) {
          setList((l) => l.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
          toast.success('Anakan diperbarui');
        }
      } else {
        const res = await cachedAPI.addAyamAnakan(form);
        if (res.success && res.data) {
          setList((l) => [...l, res.data]);
          toast.success('Anakan ditambahkan');
        }
      }
      setDialogOpen(false);
    } catch {
      toast.error('Gagal menyimpan data');
      load();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await cachedAPI.deleteAyamAnakan(id);
      if (res.success) {
        setList((l) => l.filter((x) => x.id !== id));
        toast.success('Anakan dihapus');
      }
    } catch {
      toast.error('Gagal menghapus data');
      load();
    }
  };

  const filtered = useMemo(() => list.filter((a) => {
    if (filters.breeding_id !== 'all' && a.breeding_id !== filters.breeding_id) return false;
    if (filters.jenis_kelamin !== 'all' && a.jenis_kelamin !== filters.jenis_kelamin) return false;
    if (filters.status !== 'all' && a.status !== filters.status) return false;
    return true;
  }), [list, filters]);

  useEffect(() => { setPage(1); }, [filters]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const isMature = (a) => {
    const b = breedingById(a.breeding_id);
    return b && getAgeInDays(b.tanggal_menetas) >= 180;
  };

  const columns = [
    {
      key: 'nama', header: 'Nama',
      render: (a) => {
        const fn = fullName(a.marga, a.nama);
        return (
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 font-medium">
              {fn || '—'}
              {isMature(a) && a.status === 'Sehat' && <Flame className="h-3.5 w-3.5 text-amber-500" title="Dewasa - siap promosi" />}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{a.kode}</p>
          </div>
        );
      },
    },
    { key: 'jk', header: 'Jenis Kelamin', render: (a) => <GenderPill gender={a.jenis_kelamin} /> },
    { key: 'warna', header: 'Warna', render: (a) => a.warna || '—' },
    {
      key: 'asal', header: 'Asal Breeding', hideOnMobile: true,
      render: (a) => {
        const b = breedingById(a.breeding_id);
        return b ? <span className="text-sm text-muted-foreground">{breedingLabel(b)}</span> : <span className="text-muted-foreground">—</span>;
      },
    },
    { key: 'status', header: 'Status', render: (a) => <StatusPill status={a.status} /> },
  ];

  const rowActions = (a) => (
    <div className="flex justify-end gap-1">
      {a.breeding_id && onNavigateToTrah && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-50 hover:text-violet-700" onClick={() => onNavigateToTrah(a.breeding_id)} aria-label="Lihat trah">
          <Network className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setDeleteId(a.id)} aria-label="Hapus"><Trash2 className="h-4 w-4" /></Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Ayam Anakan" description={`${filtered.length} dari ${list.length} ekor`}>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Sinkron
        </Button>
        <Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah Anakan</Button>
      </PageHeader>

      <Toolbar>
        <Select value={filters.breeding_id} onValueChange={(v) => setFilters((f) => ({ ...f, breeding_id: v }))}>
          <SelectTrigger className="flex-1 sm:max-w-[280px]"><SelectValue placeholder="Breeding" /></SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Semua Breeding</SelectItem>
            {breedingList.map((b) => <SelectItem key={b.id} value={b.id}>{breedingLabel(b)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.jenis_kelamin} onValueChange={(v) => setFilters((f) => ({ ...f, jenis_kelamin: v }))}>
          <SelectTrigger className="sm:w-[150px]"><SelectValue placeholder="Jenis Kelamin" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelamin</SelectItem>
            <SelectItem value="Jantan">Jantan</SelectItem>
            <SelectItem value="Betina">Betina</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
          <SelectTrigger className="sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Sehat">Sehat</SelectItem>
            <SelectItem value="Sakit">Sakit</SelectItem>
            <SelectItem value="Mati">Mati</SelectItem>
          </SelectContent>
        </Select>
      </Toolbar>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Memuat data…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Egg}
          title={list.length === 0 ? 'Belum ada anakan' : 'Tidak ada hasil'}
          description={list.length === 0 ? 'Catat anakan dari breeding yang sudah menetas.' : 'Coba ubah filter.'}
          action={list.length === 0
            ? <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah Anakan</Button>
            : <Button variant="outline" onClick={() => setFilters({ breeding_id: 'all', jenis_kelamin: 'all', status: 'all' })}>Reset filter</Button>}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={pageRows} rowKey={(a) => a.id} actions={rowActions} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Anakan' : 'Tambah Anakan'}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Asal Breeding</Label>
              <Select value={form.breeding_id} onValueChange={onBreedingChange} required>
                <SelectTrigger><SelectValue placeholder="Pilih breeding" /></SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {breedingList.map((b) => <SelectItem key={b.id} value={b.id}>{breedingLabel(b)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Jenis Kelamin</Label>
                <Select value={form.jenis_kelamin} onValueChange={onGenderChange} required>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jantan">Jantan</SelectItem>
                    <SelectItem value="Betina">Betina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sehat">Sehat</SelectItem>
                    <SelectItem value="Sakit">Sakit</SelectItem>
                    <SelectItem value="Mati">Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="warna">Warna</Label>
              <Input id="warna" value={form.warna} onChange={onWarnaChange} required placeholder="mis. Merah" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kode">Kode Ayam</Label>
              <Input id="kode" value={form.kode} onChange={onKodeChange} required placeholder="Isi jenis kelamin & warna…" />
              <p className="text-xs text-muted-foreground">
                {kodeAuto ? 'Otomatis dari kelamin + warna — boleh diubah.' : 'Diisi manual.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="marga">Marga <span className="text-muted-foreground">(ikut pejantan)</span></Label>
                <Input id="marga" value={form.marga} onChange={(e) => setForm({ ...form, marga: e.target.value })} placeholder="Pilih breeding dulu…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="mis. Wei" />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Nama lengkap: <span className="font-medium text-foreground">{fullName(form.marga, form.nama) || '—'}</span> · marga mewarisi pejantan, boleh diubah.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Hapus anakan ini?"
        description="Data ayam anakan akan dihapus permanen."
      />
    </div>
  );
}
