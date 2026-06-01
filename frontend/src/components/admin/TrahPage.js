import React, { useState, useEffect, useMemo } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import {
  Search, ChevronDown, ChevronRight, RefreshCw, Network,
  UnfoldVertical, FoldVertical, GitBranch,
} from 'lucide-react';
import { PageHeader, StatusPill, EmptyState, Pagination } from './primitives';
import { formatDate, calculateAge } from '../../utils/workflowHelpers';
import SilsilahPage from './SilsilahPage';

const PER_PAGE = 6;

export default function TrahPage({ autoExpandBreedingId }) {
  const [breeding, setBreeding] = useState([]);
  const [induk, setInduk] = useState([]);
  const [anakan, setAnakan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set());
  const [page, setPage] = useState(1);
  const [silsilahId, setSilsilahId] = useState(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (autoExpandBreedingId) {
      setExpanded(new Set([autoExpandBreedingId]));
      setSearch('');
    }
  }, [autoExpandBreedingId]);

  useEffect(() => { setPage(1); }, [search]);

  const load = async (force = false) => {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const [b, i, a] = await Promise.all([
        cachedAPI.getBreeding(force),
        cachedAPI.getAyamInduk(force),
        cachedAPI.getAyamAnakan(null, force),
      ]);
      setBreeding(b.data || []);
      setInduk(i.data || []);
      setAnakan(a.data || []);
      if (force) toast.success('Data disinkronkan');
    } catch {
      toast.error('Gagal memuat data trah');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const indukById = (id) => induk.find((x) => x.id === id);
  const anakanOf = (id) => anakan.filter((x) => x.breeding_id === id);

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return breeding
      .filter((b) => {
        if (autoExpandBreedingId) return b.id === autoExpandBreedingId;
        if (!q) return true;
        const p = indukById(b.pejantan_id);
        const bt = indukById(b.betina_id);
        const kids = anakanOf(b.id);
        return (
          p?.kode?.toLowerCase().includes(q) || bt?.kode?.toLowerCase().includes(q) ||
          p?.ras?.toLowerCase().includes(q) || bt?.ras?.toLowerCase().includes(q) ||
          kids.some((k) => k.kode?.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(a.tanggal_menetas || 0) - new Date(b.tanggal_menetas || 0));
  }, [breeding, induk, anakan, search, autoExpandBreedingId]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const ChickenCard = ({ chicken, role, date }) => {
    if (!chicken) return <div className="rounded-lg border border-dashed p-3 text-sm italic text-muted-foreground">Data tidak ditemukan</div>;
    const tone = role === 'pejantan' ? 'border-blue-200 bg-blue-50/60'
      : role === 'betina' ? 'border-pink-200 bg-pink-50/60'
      : 'border-amber-200 bg-amber-50/60';
    const label = role === 'pejantan' ? '♂ Pejantan' : role === 'betina' ? '♀ Betina' : '🐣 Anakan';
    return (
      <div className={cn('rounded-lg border p-3', tone)}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="font-mono text-sm font-bold">{chicken.kode}</span>
        </div>
        <p className="text-sm font-medium text-foreground">{chicken.ras || '—'}</p>
        <p className="text-xs text-muted-foreground">Warna: {chicken.warna || '—'}</p>
        {date && (
          <p className="mt-1 text-xs text-muted-foreground">
            {role === 'anakan' ? 'Menetas' : 'Lahir'}: {formatDate(date)} • {calculateAge(date)}
          </p>
        )}
        {chicken.status && <div className="mt-2"><StatusPill status={chicken.status} /></div>}
      </div>
    );
  };

  const Node = ({ b }) => {
    const p = indukById(b.pejantan_id);
    const bt = indukById(b.betina_id);
    const kids = anakanOf(b.id);
    const open = expanded.has(b.id);
    return (
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => toggle(b.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
            {open ? <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
            <div className="min-w-0">
              <p className="font-display font-semibold">{formatDate(b.tanggal_menetas)}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                <span className="text-blue-700">♂ {p?.kode || '?'}</span> × <span className="text-pink-700">♀ {bt?.kode || '?'}</span>
                {' • '}{kids.length} anakan
              </p>
            </div>
          </button>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setSilsilahId(b.id)}>
            <GitBranch className="mr-1.5 h-4 w-4" /> Lihat Hirarki
          </Button>
        </div>

        {open && (
          <div className="space-y-5 border-t p-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Induk</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ChickenCard chicken={p} role="pejantan" date={p?.tanggal_lahir} />
                <ChickenCard chicken={bt} role="betina" date={bt?.tanggal_lahir} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Keturunan ({kids.length})</p>
              {kids.length === 0 ? (
                <p className="rounded-lg border border-dashed py-5 text-center text-sm italic text-muted-foreground">Belum ada anakan dari breeding ini</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {kids.map((k) => <ChickenCard key={k.id} chicken={k} role="anakan" date={b.tanggal_menetas} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tampilan silsilah penuh untuk satu breeding
  if (silsilahId) {
    const b = breeding.find((x) => x.id === silsilahId);
    return (
      <SilsilahPage
        breeding={b}
        breedings={breeding}
        induk={induk}
        anakan={anakan}
        onBack={() => setSilsilahId(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Trah" description="Silsilah breeding — dari induk ke keturunan">
        <Button variant="outline" size="sm" onClick={() => setExpanded(new Set(breeding.map((b) => b.id)))}>
          <UnfoldVertical className="mr-2 h-4 w-4" />Buka semua
        </Button>
        <Button variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
          <FoldVertical className="mr-2 h-4 w-4" />Tutup semua
        </Button>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Sinkron
        </Button>
      </PageHeader>

      {!autoExpandBreedingId && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari kode induk, ras, atau anakan…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Memuat data…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Network} title={search ? 'Tidak ada hasil' : 'Belum ada data trah'} description={search ? 'Coba kata kunci lain.' : 'Tambahkan breeding terlebih dahulu.'} />
      ) : (
        <>
          <div className="space-y-3">
            {pageRows.map((b) => <Node key={b.id} b={b} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
