import React, { useState, useEffect, useMemo } from 'react';
import { cachedAPI } from '../../services/cachedApi';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import {
  Bird, HeartHandshake, Egg, Flame, RefreshCw, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { PageHeader, StatCard, StatusPill, GenderPill, EmptyState } from './primitives';
import {
  filterBreedingByWorkflow, filterMatureAnakan, formatDate, calculateAge,
} from '../../utils/workflowHelpers';

export default function AdminDashboard({ onNavigate, onNavigateToTrah }) {
  const [induk, setInduk] = useState([]);
  const [breeding, setBreeding] = useState([]);
  const [anakan, setAnakan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async (force = false) => {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const [i, b, a] = await Promise.all([
        cachedAPI.getAyamInduk(force),
        cachedAPI.getBreeding(force),
        cachedAPI.getAyamAnakan(null, force),
      ]);
      setInduk(i.data || []);
      setBreeding(b.data || []);
      setAnakan(a.data || []);
      if (force) toast.success('Data disinkronkan');
    } catch {
      toast.error('Gagal memuat ringkasan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const indukById = (id) => induk.find((x) => x.id === id);
  const healthyInduk = useMemo(() => induk.filter((i) => i.status === 'Sehat'), [induk]);
  const newBreeding = useMemo(() => filterBreedingByWorkflow(breeding, anakan, 'new'), [breeding, anakan]);
  const readyToRecord = useMemo(() => filterBreedingByWorkflow(breeding, anakan, 'ready-to-record'), [breeding, anakan]);
  const matureAnakan = useMemo(() => filterMatureAnakan(anakan, breeding), [anakan, breeding]);

  const recentInduk = useMemo(
    () => [...induk].sort((a, b) => new Date(b.tanggal_lahir || 0) - new Date(a.tanggal_lahir || 0)).slice(0, 5),
    [induk]
  );

  const stats = [
    { icon: Bird, label: 'Indukan Sehat', value: healthyInduk.length, hint: `${induk.length} total indukan`, tone: 'emerald' },
    { icon: HeartHandshake, label: 'Breeding', value: breeding.length, hint: 'Total pasangan tercatat', tone: 'sky' },
    { icon: Egg, label: 'Anakan', value: anakan.length, hint: 'Total anakan tercatat', tone: 'amber' },
    { icon: Flame, label: 'Siap Promosi', value: matureAnakan.length, hint: 'Anakan dewasa & sehat', tone: 'violet' },
  ];

  const insights = [
    { title: 'Breeding baru menetas', desc: 'Umur < 3 bulan, dalam pemantauan', count: newBreeding.length, tone: 'amber', to: 'breeding' },
    { title: 'Siap dicatat anakan', desc: 'Umur 3+ bulan, waktunya mencatat', count: readyToRecord.length, tone: 'sky', to: 'breeding' },
    { title: 'Anakan siap promosi', desc: 'Umur 6+ bulan & sehat', count: matureAnakan.length, tone: 'violet', to: 'anakan' },
  ];

  const TONE_RING = {
    amber: 'before:bg-amber-400',
    sky: 'before:bg-sky-400',
    violet: 'before:bg-violet-400',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Ringkasan" description="Pantau kondisi peternakan sekilas">
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Sinkron
        </Button>
      </PageHeader>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Memuat ringkasan…</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Insight / perlu perhatian */}
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold">Perlu perhatian</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {insights.map((it) => (
                <button
                  key={it.title}
                  onClick={() => onNavigate(it.to)}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border bg-card p-4 pl-5 text-left shadow-sm transition-shadow hover:shadow-md',
                    'before:absolute before:inset-y-0 before:left-0 before:w-1', TONE_RING[it.tone]
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-3xl font-bold">{it.count}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="mt-1 font-medium">{it.title}</p>
                  <p className="text-xs text-muted-foreground">{it.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Indukan terbaru */}
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-display font-semibold">Indukan terbaru</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('indukan')} className="text-muted-foreground">
                Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {recentInduk.length === 0 ? (
              <EmptyState icon={Bird} title="Belum ada indukan" description="Tambahkan ayam indukan dari menu Indukan." />
            ) : (
              <ul className="divide-y">
                {recentInduk.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold">{a.kode}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.ras || '—'} • {a.warna || '—'}
                        {a.tanggal_lahir && ` • ${calculateAge(a.tanggal_lahir)}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <GenderPill gender={a.jenis_kelamin} />
                      <StatusPill status={a.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
