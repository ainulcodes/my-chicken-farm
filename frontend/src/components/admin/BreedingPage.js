import React, { useState, useEffect, useMemo } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, RefreshCw, Pencil, Trash2, HeartHandshake } from 'lucide-react';
import {
  PageHeader, DataTable, Pagination, Toolbar, EmptyState, ConfirmDialog,
} from './primitives';
import { formatDate, calculateAge, getAnakanProgress } from '../../utils/workflowHelpers';

const EMPTY = { pejantan_id: '', betina_id: '', tanggal_kawin: '', tanggal_menetas: '', jumlah_anakan: 0 };
const PER_PAGE = 10;

export default function BreedingPage() {
  const [list, setList] = useState([]);
  const [induk, setInduk] = useState([]);
  const [anakan, setAnakan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [filters, setFilters] = useState({ pejantan_id: 'all', betina_id: 'all' });
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, []);

  const load = async (force = false) => {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const [b, i, a] = await Promise.all([
        cachedAPI.getBreeding(force),
        cachedAPI.getAyamInduk(force),
        cachedAPI.getAyamAnakan(null, force),
      ]);
      setList(b.data || []);
      setInduk(i.data || []);
      setAnakan(a.data || []);
      if (force) toast.success('Data disinkronkan');
    } catch {
      toast.error('Gagal memuat data breeding');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pejantanList = useMemo(() => induk.filter((a) => a.jenis_kelamin === 'Jantan'), [induk]);
  const betinaList = useMemo(() => induk.filter((a) => a.jenis_kelamin === 'Betina'), [induk]);
  const indukById = (id) => induk.find((a) => a.id === id);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      pejantan_id: b.pejantan_id || '', betina_id: b.betina_id || '',
      tanggal_kawin: b.tanggal_kawin || '', tanggal_menetas: b.tanggal_menetas || '',
      jumlah_anakan: b.jumlah_anakan || 0,
    });
    setDialogOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const p = indukById(form.pejantan_id);
    const bt = indukById(form.betina_id);
    if (!p || p.jenis_kelamin !== 'Jantan') return toast.error('Pejantan harus ayam jantan');
    if (!bt || bt.jenis_kelamin !== 'Betina') return toast.error('Betina harus ayam betina');

    setSaving(true);
    try {
      if (editing) {
        const res = await cachedAPI.updateBreeding(editing.id, form);
        if (res.success) {
          setList((l) => l.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
          toast.success('Breeding diperbarui');
        }
      } else {
        const res = await cachedAPI.addBreeding(form);
        if (res.success && res.data) {
          setList((l) => [...l, res.data]);
          toast.success('Breeding ditambahkan');
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
      const res = await cachedAPI.deleteBreeding(id);
      if (res.success) {
        setList((l) => l.filter((x) => x.id !== id));
        toast.success('Breeding dihapus');
      }
    } catch {
      toast.error('Gagal menghapus data');
      load();
    }
  };

  const filtered = useMemo(() => {
    return list
      .filter((b) => {
        if (filters.pejantan_id !== 'all' && b.pejantan_id !== filters.pejantan_id) return false;
        if (filters.betina_id !== 'all' && b.betina_id !== filters.betina_id) return false;
        return true;
      })
      .sort((a, b) => new Date(a.tanggal_menetas || 0) - new Date(b.tanggal_menetas || 0));
  }, [list, filters]);

  useEffect(() => { setPage(1); }, [filters]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const PairCell = ({ b }) => {
    const p = indukById(b.pejantan_id);
    const bt = indukById(b.betina_id);
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5 text-sm">
        <span className="font-mono font-medium text-blue-700">♂ {p?.kode || '—'}</span>
        <span className="text-muted-foreground">×</span>
        <span className="font-mono font-medium text-pink-700">♀ {bt?.kode || '—'}</span>
      </span>
    );
  };

  const ProgressCell = ({ b }) => {
    const prog = getAnakanProgress(b, anakan);
    if (!prog.total) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="min-w-[110px]">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted-foreground">{prog.recorded}/{prog.total}</span>
          {prog.isComplete && <span className="font-medium text-emerald-600">Lengkap</span>}
        </div>
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${prog.percentage}%` }} /></div>
      </div>
    );
  };

  const columns = [
    { key: 'menetas', header: 'Menetas', render: (b) => <span className="font-medium">{formatDate(b.tanggal_menetas)}</span> },
    { key: 'pasangan', header: 'Pasangan', render: (b) => <PairCell b={b} /> },
    { key: 'umur', header: 'Umur', hideOnMobile: true, render: (b) => b.tanggal_menetas ? calculateAge(b.tanggal_menetas) : '—' },
    { key: 'jumlah', header: 'Jumlah Anakan', render: (b) => `${b.jumlah_anakan || 0} ekor` },
    { key: 'progress', header: 'Tercatat', render: (b) => <ProgressCell b={b} /> },
  ];

  const rowActions = (b) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setDeleteId(b.id)} aria-label="Hapus"><Trash2 className="h-4 w-4" /></Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Breeding" description={`${filtered.length} dari ${list.length} pasangan`}>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Sinkron
        </Button>
        <Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah Breeding</Button>
      </PageHeader>

      <Toolbar>
        <Select value={filters.pejantan_id} onValueChange={(v) => setFilters((f) => ({ ...f, pejantan_id: v }))}>
          <SelectTrigger className="sm:w-[200px]"><SelectValue placeholder="Pejantan" /></SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Semua Pejantan</SelectItem>
            {pejantanList.map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.ras}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.betina_id} onValueChange={(v) => setFilters((f) => ({ ...f, betina_id: v }))}>
          <SelectTrigger className="sm:w-[200px]"><SelectValue placeholder="Betina" /></SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Semua Betina</SelectItem>
            {betinaList.map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.ras}</SelectItem>)}
          </SelectContent>
        </Select>
      </Toolbar>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Memuat data…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title={list.length === 0 ? 'Belum ada breeding' : 'Tidak ada hasil'}
          description={list.length === 0 ? 'Catat pasangan breeding pertama Anda.' : 'Coba ubah filter.'}
          action={list.length === 0
            ? <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah Breeding</Button>
            : <Button variant="outline" onClick={() => setFilters({ pejantan_id: 'all', betina_id: 'all' })}>Reset filter</Button>}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={pageRows} rowKey={(b) => b.id} actions={rowActions} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Breeding' : 'Tambah Breeding'}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pejantan (Jantan)</Label>
              <Select value={form.pejantan_id} onValueChange={(v) => setForm({ ...form, pejantan_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Pilih pejantan" /></SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {pejantanList.map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.ras}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Indukan Betina</Label>
              <Select value={form.betina_id} onValueChange={(v) => setForm({ ...form, betina_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Pilih betina" /></SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {betinaList.map((a) => <SelectItem key={a.id} value={a.id}>{a.kode} — {a.ras}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tk">Tanggal Kawin <span className="text-muted-foreground">(opsional)</span></Label>
                <Input id="tk" type="date" value={form.tanggal_kawin} onChange={(e) => setForm({ ...form, tanggal_kawin: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tm">Tanggal Menetas</Label>
                <Input id="tm" type="date" value={form.tanggal_menetas} onChange={(e) => setForm({ ...form, tanggal_menetas: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ja">Jumlah Anakan</Label>
              <Input id="ja" type="number" min="0" value={form.jumlah_anakan} onChange={(e) => setForm({ ...form, jumlah_anakan: parseInt(e.target.value) || 0 })} />
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
        title="Hapus breeding ini?"
        description="Data breeding akan dihapus permanen."
      />
    </div>
  );
}
