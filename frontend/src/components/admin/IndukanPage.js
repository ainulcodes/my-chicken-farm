import React, { useState, useEffect, useMemo } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, RefreshCw, Pencil, Trash2, Search, Bird } from 'lucide-react';
import {
  PageHeader, StatusPill, GenderPill, DataTable, Pagination,
  Toolbar, EmptyState, ConfirmDialog,
} from './primitives';
import { calculateAge, formatDate, getBreedingCount } from '../../utils/workflowHelpers';
import { suggestKode } from '../../utils/kode';

const EMPTY = { kode: '', jenis_kelamin: '', ras: '', warna: '', tanggal_lahir: '', status: 'Sehat' };
const PER_PAGE = 10;

export default function IndukanPage() {
  const [list, setList] = useState([]);
  const [breedingList, setBreedingList] = useState([]);
  const [anakanCodes, setAnakanCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [kodeAuto, setKodeAuto] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ ras: 'all', jenis_kelamin: 'all', status: 'all' });
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, []);

  const load = async (force = false) => {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const [a, b, an] = await Promise.all([
        cachedAPI.getAyamInduk(force),
        cachedAPI.getBreeding(force),
        cachedAPI.getAyamAnakan(null, force),
      ]);
      setList(a.data || []);
      setBreedingList(b.data || []);
      setAnakanCodes((an.data || []).map((x) => x.kode));
      if (force) toast.success('Data disinkronkan');
    } catch {
      toast.error('Gagal memuat data indukan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setKodeAuto(true); setDialogOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setKodeAuto(false);
    setForm({
      kode: a.kode || '', jenis_kelamin: a.jenis_kelamin || '', ras: a.ras || '',
      warna: a.warna || '', tanggal_lahir: a.tanggal_lahir || '', status: a.status || 'Sehat',
    });
    setDialogOpen(true);
  };

  // Kode otomatis dari (kelamin + warna), nomor gabungan indukan + anakan.
  const allCodes = useMemo(
    () => [...list.map((x) => x.kode), ...anakanCodes],
    [list, anakanCodes]
  );

  const onGenderChange = (v) => {
    setForm((f) => {
      const next = { ...f, jenis_kelamin: v };
      if (kodeAuto) next.kode = suggestKode(allCodes, { gender: v, warna: f.warna, module: 'indukan' });
      return next;
    });
  };

  const onWarnaChange = (e) => {
    const warna = e.target.value;
    setForm((f) => {
      const next = { ...f, warna };
      if (kodeAuto) next.kode = suggestKode(allCodes, { gender: f.jenis_kelamin, warna, module: 'indukan' });
      return next;
    });
  };

  const onKodeChange = (e) => { setKodeAuto(false); setForm((f) => ({ ...f, kode: e.target.value })); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const res = await cachedAPI.updateAyamInduk(editing.id, form);
        if (res.success) {
          setList((l) => l.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
          toast.success('Indukan diperbarui');
        }
      } else {
        const res = await cachedAPI.addAyamInduk(form);
        if (res.success && res.data) {
          setList((l) => [...l, res.data]);
          toast.success('Indukan ditambahkan');
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
      const res = await cachedAPI.deleteAyamInduk(id);
      if (res.success) {
        setList((l) => l.filter((x) => x.id !== id));
        toast.success('Indukan dihapus');
      }
    } catch {
      toast.error('Gagal menghapus data');
      load();
    }
  };

  const uniqueRas = useMemo(
    () => [...new Set(list.map((a) => a.ras))].filter(Boolean).sort(),
    [list]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((a) => {
      if (filters.ras !== 'all' && a.ras !== filters.ras) return false;
      if (filters.jenis_kelamin !== 'all' && a.jenis_kelamin !== filters.jenis_kelamin) return false;
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (q && !(`${a.kode} ${a.ras} ${a.warna}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [list, filters, search]);

  useEffect(() => { setPage(1); }, [filters, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const columns = [
    { key: 'kode', header: 'Kode', render: (a) => <span className="font-mono font-semibold">{a.kode}</span> },
    { key: 'jk', header: 'Jenis Kelamin', render: (a) => <GenderPill gender={a.jenis_kelamin} /> },
    { key: 'ras', header: 'Ras', render: (a) => a.ras || '—' },
    { key: 'warna', header: 'Warna', render: (a) => a.warna || '—' },
    {
      key: 'umur', header: 'Umur',
      render: (a) => a.tanggal_lahir
        ? <span title={formatDate(a.tanggal_lahir)}>{calculateAge(a.tanggal_lahir)}</span>
        : <span className="text-muted-foreground">—</span>,
    },
    { key: 'status', header: 'Status', render: (a) => <StatusPill status={a.status} /> },
    {
      key: 'riwayat', header: 'Breeding', hideOnMobile: true,
      render: (a) => {
        const n = getBreedingCount(a.id, breedingList);
        return n > 0 ? <span className="text-muted-foreground">{n}×</span> : <span className="text-muted-foreground">—</span>;
      },
    },
  ];

  const rowActions = (a) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setDeleteId(a.id)} aria-label="Hapus">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ayam Indukan"
        description={`${filtered.length} dari ${list.length} ekor`}
      >
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Sinkron
        </Button>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Indukan
        </Button>
      </PageHeader>

      <Toolbar>
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kode, ras, atau warna…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filters.jenis_kelamin} onValueChange={(v) => setFilters((f) => ({ ...f, jenis_kelamin: v }))}>
          <SelectTrigger className="sm:w-[150px]"><SelectValue placeholder="Jenis Kelamin" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelamin</SelectItem>
            <SelectItem value="Jantan">Jantan</SelectItem>
            <SelectItem value="Betina">Betina</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.ras} onValueChange={(v) => setFilters((f) => ({ ...f, ras: v }))}>
          <SelectTrigger className="sm:w-[150px]"><SelectValue placeholder="Ras" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ras</SelectItem>
            {uniqueRas.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
          <SelectTrigger className="sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Sehat">Sehat</SelectItem>
            <SelectItem value="Sakit">Sakit</SelectItem>
            <SelectItem value="Dijual">Dijual</SelectItem>
            <SelectItem value="Mati">Mati</SelectItem>
          </SelectContent>
        </Select>
      </Toolbar>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Memuat data…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bird}
          title={list.length === 0 ? 'Belum ada indukan' : 'Tidak ada hasil'}
          description={list.length === 0 ? 'Tambahkan ayam indukan pertama Anda.' : 'Coba ubah kata kunci atau filter.'}
          action={list.length === 0
            ? <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah Indukan</Button>
            : <Button variant="outline" onClick={() => { setSearch(''); setFilters({ ras: 'all', jenis_kelamin: 'all', status: 'all' }); }}>Reset filter</Button>}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={pageRows} rowKey={(a) => a.id} actions={rowActions} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {/* Form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Indukan' : 'Tambah Indukan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
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
                    <SelectItem value="Dijual">Dijual</SelectItem>
                    <SelectItem value="Mati">Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ras">Ras</Label>
                <Input id="ras" value={form.ras} onChange={(e) => setForm({ ...form, ras: e.target.value })} required placeholder="mis. Bangkok" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="warna">Warna</Label>
                <Input id="warna" value={form.warna} onChange={onWarnaChange} required placeholder="mis. Merah" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kode">Kode Ayam</Label>
              <Input id="kode" value={form.kode} onChange={onKodeChange} required placeholder="Isi jenis kelamin & warna…" />
              <p className="text-xs text-muted-foreground">
                {kodeAuto ? 'Otomatis dari kelamin + warna — boleh diubah.' : 'Diisi manual.'}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tgl">Tanggal Lahir <span className="text-muted-foreground">(opsional)</span></Label>
              <Input id="tgl" type="date" value={form.tanggal_lahir} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} />
            </div>
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
        title="Hapus indukan ini?"
        description="Data ayam indukan akan dihapus permanen."
      />
    </div>
  );
}
