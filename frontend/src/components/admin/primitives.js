import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';

/* ------------------------------------------------------------------ */
/* PageHeader — judul halaman + deskripsi + aksi (responsif)           */
/* ------------------------------------------------------------------ */
export function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard — kartu statistik ringkas (ikon lucide + angka)            */
/* ------------------------------------------------------------------ */
const TONE = {
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  sky: 'bg-sky-50 text-sky-600 ring-sky-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function StatCard({ icon: Icon, label, value, hint, tone = 'emerald' }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-lg ring-1', TONE[tone])}>
          {Icon && <Icon className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold leading-tight text-foreground">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatusPill — badge berwarna dengan titik (status & jenis kelamin)   */
/* ------------------------------------------------------------------ */
const STATUS_TONE = {
  Sehat: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Sakit: 'bg-rose-50 text-rose-700 ring-rose-200',
  Dijual: 'bg-sky-50 text-sky-700 ring-sky-200',
  Mati: 'bg-slate-100 text-slate-600 ring-slate-200',
};
const DOT_TONE = {
  Sehat: 'bg-emerald-500',
  Sakit: 'bg-rose-500',
  Dijual: 'bg-sky-500',
  Mati: 'bg-slate-400',
};

export function StatusPill({ status }) {
  const tone = STATUS_TONE[status] || 'bg-slate-100 text-slate-600 ring-slate-200';
  const dot = DOT_TONE[status] || 'bg-slate-400';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', tone)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {status || '—'}
    </span>
  );
}

export function GenderPill({ gender }) {
  const isJantan = gender === 'Jantan';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        isJantan ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-pink-50 text-pink-700 ring-pink-200'
      )}
    >
      {isJantan ? '♂' : '♀'} {gender || '—'}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar — pembungkus baris filter / pencarian                       */
/* ------------------------------------------------------------------ */
export function Toolbar({ children, className }) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center', className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState — keadaan kosong yang ramah                              */
/* ------------------------------------------------------------------ */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-7 w-7" />
        </span>
      )}
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DataTable — tabel di desktop, kartu bertumpuk di mobile             */
/*   columns: [{ key, header, render?(row), className?, hideOnMobile? }]*/
/* ------------------------------------------------------------------ */
export function DataTable({ columns, rows, rowKey, actions, className }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
      {/* Desktop */}
      <div className="hidden overflow-x-auto scrollbar-thin md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} className={cn('px-4 py-3', c.headerClassName)}>{c.header}</th>
              ))}
              {actions && <th className="px-4 py-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b transition-colors last:border-0 hover:bg-muted/30">
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="space-y-2 p-4">
            {columns.filter((c) => !c.hideOnMobile).map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-3 text-sm">
                <span className="shrink-0 text-muted-foreground">{c.header}</span>
                <span className="text-right">{c.render ? c.render(row) : row[c.key]}</span>
              </div>
            ))}
            {actions && <div className="flex justify-end gap-2 pt-2">{actions(row)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination — navigasi halaman ringkas                               */
/* ------------------------------------------------------------------ */
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (i === page - 2 || i === page + 2) pages.push('…');
  }
  return (
    <div className="flex items-center justify-center gap-1">
      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
        Sebelumnya
      </Button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            className="w-9"
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        )
      )}
      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Berikutnya
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ConfirmDialog — konfirmasi hapus (pengganti window.confirm)         */
/* ------------------------------------------------------------------ */
export function ConfirmDialog({ open, onOpenChange, onConfirm, title = 'Hapus data ini?', description = 'Tindakan ini tidak dapat dibatalkan.', confirmLabel = 'Hapus' }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
