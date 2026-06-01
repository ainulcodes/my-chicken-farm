import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cachedAPI } from '../services/cachedApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Search, Lock, LayoutDashboard, Bird, Egg, ShieldCheck } from 'lucide-react';
import { StatusPill, GenderPill, EmptyState } from './admin/primitives';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/workflowHelpers';

export default function DashboardPublic() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [indukan, setIndukan] = useState([]);
  const [anakan, setAnakan] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [tab, setTab] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [i, a] = await Promise.all([cachedAPI.getAyamInduk(), cachedAPI.getAyamAnakan()]);
      setIndukan(i.data || []);
      setAnakan(a.data || []);
    } catch {
      toast.error('Gagal memuat katalog.');
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(() => {
    const normInduk = indukan.map((it) => ({
      ...it, type: 'Indukan', title: it.kode, subtitle: `${it.ras || '—'} • ${it.warna || '—'}`,
      date: it.tanggal_lahir, dateLabel: 'Lahir',
    }));
    const normAnakan = anakan.map((it) => ({
      ...it, type: 'Anakan', title: it.kode, subtitle: `${it.warna || '—'}`,
      date: null, dateLabel: 'Menetas',
    }));

    let rows = tab === 'indukan' ? normInduk : tab === 'anakan' ? normAnakan : [...normInduk, ...normAnakan];
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((it) => `${it.kode} ${it.ras || ''} ${it.warna || ''}`.toLowerCase().includes(q));
    if (status !== 'all') rows = rows.filter((it) => it.status === status);
    return rows;
  }, [indukan, anakan, tab, search, status]);

  const reset = () => { setSearch(''); setStatus('all'); setTab('all'); };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white">
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/15"
            onClick={() => navigate(isLoggedIn ? '/admin' : '/login')}
          >
            {isLoggedIn ? (
              <><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard Admin</>
            ) : (
              <><Lock className="mr-2 h-4 w-4" /> Login Admin</>
            )}
          </Button>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-16">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <Bird className="h-7 w-7" />
          </span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Galeri Peternakan</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/90 sm:text-lg">
            Katalog ayam indukan unggulan dan anakan berkualitas siap adopsi.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/80">
            <ShieldCheck className="h-4 w-4" /> {indukan.length} indukan • {anakan.length} anakan
          </div>
        </div>
      </header>

      {/* Filter toolbar — sticky, di bawah hero (tanpa tumpukan) */}
      <div className="sticky top-0 z-20 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:w-[280px]">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="indukan">Indukan</TabsTrigger>
              <TabsTrigger value="anakan">Anakan</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-1 gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari kode, ras, warna…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Sehat">Sehat</SelectItem>
                <SelectItem value="Dijual">Dijual</SelectItem>
                <SelectItem value="Sakit">Sakit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto mt-8 max-w-6xl px-4">
        {!loading && data.length > 0 && (
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Katalog</h2>
            <span className="text-sm text-muted-foreground">{data.length} ekor</span>
          </div>
        )}
        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Memuat katalog…</div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={Bird}
            title="Tidak ada data ditemukan"
            description="Coba ubah kata kunci atau filter."
            action={<Button variant="outline" onClick={reset}>Reset filter</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((it) => {
              const Icon = it.type === 'Indukan' ? Bird : Egg;
              return (
                <article key={`${it.type}-${it.id}`} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                    <Icon className="h-16 w-16 text-emerald-300 transition-transform duration-500 group-hover:scale-110" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                      {it.type}
                    </span>
                    {it.status && <span className="absolute right-3 top-3"><StatusPill status={it.status} /></span>}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-lg font-bold">{it.title}</h3>
                        <p className="truncate text-sm text-emerald-600">{it.subtitle}</p>
                      </div>
                      {it.jenis_kelamin && <GenderPill gender={it.jenis_kelamin} />}
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t pt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Kode</p>
                        <p className="font-mono">{it.kode}</p>
                      </div>
                      {it.ras && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Ras</p>
                          <p>{it.ras}</p>
                        </div>
                      )}
                      {it.date && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">{it.dateLabel}</p>
                          <p>{formatDate(it.date)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t bg-card py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Galeri Peternakan — Ternak Ayam.</p>
      </footer>
    </div>
  );
}
