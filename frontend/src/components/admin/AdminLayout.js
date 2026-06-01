import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Sheet, SheetContent } from '../ui/sheet';
import { Bird, Menu, LogOut, ExternalLink } from 'lucide-react';

/**
 * AdminLayout — app-shell profesional.
 * Desktop: sidebar tetap di kiri. Mobile: topbar + drawer (Sheet).
 *
 * Props:
 *   nav: [{ id, label, icon }]
 *   current, onNavigate(id)
 *   onLogout(), onViewPublic()
 *   children
 */
export default function AdminLayout({ nav, current, onNavigate, onLogout, onViewPublic, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const Brand = (
    <div className="flex items-center gap-2.5 px-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Bird className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-sm font-bold text-foreground">Ternak Ayam</p>
        <p className="text-[11px] text-muted-foreground">Manajemen Breeding</p>
      </div>
    </div>
  );

  const NavList = ({ onItemClick }) => (
    <nav className="flex-1 space-y-1 px-3">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); onItemClick?.(); }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className={cn('h-[18px] w-[18px]', active ? 'text-primary' : '')} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  const Footer = ({ onItemClick }) => (
    <div className="space-y-1 border-t p-3">
      {onViewPublic && (
        <button
          onClick={() => { onViewPublic(); onItemClick?.(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          Lihat Galeri Publik
        </button>
      )}
      <button
        onClick={() => { onLogout(); onItemClick?.(); }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Keluar
      </button>
    </div>
  );

  const currentLabel = nav.find((n) => n.id === current)?.label || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b">{Brand}</div>
        <div className="flex flex-1 flex-col overflow-y-auto py-4 scrollbar-thin">
          <NavList />
        </div>
        <Footer />
      </aside>

      {/* Drawer mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b">{Brand}</div>
            <div className="flex flex-1 flex-col overflow-y-auto py-4 scrollbar-thin">
              <NavList onItemClick={() => setMobileOpen(false)} />
            </div>
            <Footer onItemClick={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Konten */}
      <div className="lg:pl-64">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-base font-semibold">{currentLabel}</span>
        </header>

        <main className="mx-auto max-w-6xl animate-fadeIn px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
