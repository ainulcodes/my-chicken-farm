import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { formatDate } from '../../utils/workflowHelpers';

/**
 * SilsilahPage — visualisasi pohon keturunan dari satu breeding (trah).
 *
 * Relasi:
 *  - breeding.pejantan_id/betina_id  -> ayam_induk.id  (induk)
 *  - ayam_anakan.breeding_id         -> breeding.id    (anakan)
 *  - anakan yang DIPROMOSIKAN jadi induk berbagi KODE yang sama
 *    -> dipakai untuk menyambung generasi (anakan -> jadi induk -> breeding baru).
 */
export default function SilsilahPage({ breeding, breedings = [], induk = [], anakan = [], onBack }) {
  const tree = useMemo(() => {
    if (!breeding) return null;
    const indukById = new Map(induk.map((i) => [i.id, i]));
    const indukByKode = new Map(induk.map((i) => [(i.kode || '').trim(), i]));
    const anakanByBreeding = anakan.reduce((acc, a) => {
      if (!acc[a.breeding_id]) acc[a.breeding_id] = [];
      acc[a.breeding_id].push(a);
      return acc;
    }, {});
    const visited = new Set();

    const buildCouple = (b) => {
      if (!b || visited.has(b.id)) return null;
      visited.add(b.id);
      return {
        breeding: b,
        pejantan: indukById.get(b.pejantan_id) || null,
        betina: indukById.get(b.betina_id) || null,
        children: (anakanByBreeding[b.id] || []).map(buildChild),
      };
    };

    const buildChild = (a) => {
      const promoted = indukByKode.get((a.kode || '').trim());
      let matings = [];
      if (promoted) {
        matings = breedings
          .filter((b) => (b.pejantan_id === promoted.id || b.betina_id === promoted.id) && !visited.has(b.id))
          .map((b) => {
            visited.add(b.id);
            const mateId = b.pejantan_id === promoted.id ? b.betina_id : b.pejantan_id;
            return {
              breeding: b,
              mate: indukById.get(mateId) || null,
              children: (anakanByBreeding[b.id] || []).map(buildChild),
            };
          });
      }
      return { anakan: a, matings };
    };

    return buildCouple(breeding);
  }, [breeding, breedings, induk, anakan]);

  if (!tree) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Kembali</Button>
        <p className="text-sm text-muted-foreground">Breeding tidak ditemukan.</p>
      </div>
    );
  }

  const totalKeturunan = anakan.filter((a) => a.breeding_id === breeding.id).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onBack} aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
              <GitBranch className="h-5 w-5 text-primary" /> Silsilah Keturunan
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Menetas {formatDate(breeding.tanggal_menetas)} • {totalKeturunan} keturunan langsung
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">🐓 Induk jantan</span>
        <span className="inline-flex items-center gap-1.5">🐔 Induk betina</span>
        <span className="inline-flex items-center gap-1.5">🐥 Anakan</span>
        <span className="inline-flex items-center gap-1.5"><Dot className="bg-blue-400" /> bingkai biru = jantan</span>
        <span className="inline-flex items-center gap-1.5"><Dot className="bg-pink-400" /> pink = betina</span>
      </div>

      {/* Pohon */}
      <div className="overflow-x-auto rounded-xl border bg-gradient-to-b from-muted/30 to-card p-6 scrollbar-thin">
        <div className="silsilah-tree min-w-max">
          <ul>
            <li>
              <CoupleCard couple={tree} />
              {tree.children.length > 0 && (
                <ul>{tree.children.map((c, i) => renderBranch(c, c.anakan.id || i))}</ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-komponen ---------- */

function Dot({ className }) {
  return <span className={cn('h-2.5 w-2.5 rounded-full', className)} />;
}

// Ilustrasi ayam sesuai jenis: induk jantan = jago, induk betina = betina, anakan = anak ayam
function illustration(type, gender) {
  if (type === 'anakan') return '🐥';
  return gender === 'Jantan' ? '🐓' : '🐔';
}

function ChickenNode({ chicken, type, variant }) {
  const isJantan = chicken?.jenis_kelamin === 'Jantan';
  const ring = variant === 'mate' ? 'ring-slate-300' : isJantan ? 'ring-blue-300' : 'ring-pink-300';
  const bg = variant === 'mate'
    ? 'from-slate-50 to-slate-100'
    : isJantan ? 'from-blue-50 to-sky-50' : 'from-pink-50 to-rose-50';
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm ring-2', bg, ring)}>
        {chicken ? illustration(type, chicken.jenis_kelamin) : '❓'}
      </div>
      <div className="max-w-[7rem] text-center leading-tight">
        <p className="truncate font-mono text-[11px] font-semibold text-foreground">{chicken?.kode || '—'}</p>
        {chicken?.warna && <p className="truncate text-[10px] text-muted-foreground">{chicken.warna}</p>}
      </div>
    </div>
  );
}

function CoupleCard({ couple }) {
  return (
    <div className="inline-flex flex-col items-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm ring-1 ring-primary/10">
        <ChickenNode chicken={couple.pejantan} type="induk" />
        <span className="text-lg text-muted-foreground">×</span>
        <ChickenNode chicken={couple.betina} type="induk" />
      </div>
    </div>
  );
}

/**
 * Render satu cabang anakan secara rekursif.
 * Sengaja berupa FUNGSI (bukan komponen self-referensi) supaya plugin
 * visual-edits tidak rekursi tak-hingga saat menelusuri binding komponen.
 */
function renderBranch(child, key) {
  const hasMatings = child.matings && child.matings.length > 0;
  return (
    <li key={key}>
      <ChickenNode chicken={child.anakan} type="anakan" />
      {hasMatings && (
        <ul>
          {child.matings.map((m, i) => (
            <li key={m.breeding?.id || i}>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-dashed bg-muted/40 px-2 py-1.5">
                <span className="text-sm text-muted-foreground">×</span>
                <ChickenNode chicken={m.mate} type="induk" variant="mate" />
              </div>
              {m.children.length > 0 && (
                <ul>{m.children.map((gc, j) => renderBranch(gc, gc.anakan.id || j))}</ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
