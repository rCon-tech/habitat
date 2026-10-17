'use client';

import { useQuery } from '@tanstack/react-query';
import { Home, Menu, Puzzle, Settings, Users, Vote } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HabitatSwitcher } from '@/components/HabitatSwitcher';
import { Logo, LogoMark } from '@/components/Logo';
import { ModuleIcon } from '@/components/ModuleIcon';
import { NotificationBell } from '@/components/NotificationBell';
import { UserMenu } from '@/components/UserMenu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api-client';
import type { Role } from '@/lib/permissions';
import type { ProposalDTO } from '@/lib/proposals';
import { cn } from '@/lib/utils';
import { isAdmin, useHabitat } from '@/modules/sdk/context';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  match?: (path: string) => boolean;
}

export function HabitatShell({
  habitat,
  user,
  role,
  nav,
  children,
}: {
  habitat: { slug: string; name: string; emoji: string; accent: string };
  user: { name: string; email: string; image: string | null };
  role: Role;
  nav: Array<{ id: string; label: string; icon: string }>;
  children: ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const { habitatId } = useHabitat();
  const [moreOpen, setMoreOpen] = useState(false);
  const base = `/h/${habitat.slug}`;

  // A vote finishing elsewhere can add or remove modules: re-read the nav from the server.
  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener('habitat:modules-changed', refresh);
    return () => window.removeEventListener('habitat:modules-changed', refresh);
  }, [router]);

  const { data: open } = useQuery({
    queryKey: ['habitat', habitatId, 'proposals', 'open'],
    queryFn: () =>
      apiFetch<{ proposals: ProposalDTO[] }>(`/api/habitats/${habitatId}/proposals?status=open`),
    refetchInterval: 20_000,
  });
  const waiting = (open?.proposals ?? []).filter((p) => !p.myVote).length;

  // Without a live connection, notice a vote ending (it may have added or removed a module) and re-read the nav.
  const openIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!open) return;
    const now = new Set(open.proposals.map((p) => p.id));
    const before = openIds.current;
    openIds.current = now;
    if (before && [...before].some((id) => !now.has(id))) router.refresh();
  }, [open, router]);

  const items: NavItem[] = [
    { href: base, label: 'Home', icon: <Home size={20} />, match: (p) => p === base },
    ...nav.map((n) => ({
      href: `${base}/m/${n.id}`,
      label: n.label,
      icon: <ModuleIcon name={n.icon} />,
      match: (p: string) => p.startsWith(`${base}/m/${n.id}`),
    })),
    { href: `${base}/members`, label: 'Members', icon: <Users size={20} /> },
    { href: `${base}/library`, label: 'Library', icon: <Puzzle size={20} /> },
    { href: `${base}/proposals`, label: 'Votes', icon: <Vote size={20} />, badge: waiting },
    ...(isAdmin(role)
      ? [{ href: `${base}/settings`, label: 'Settings', icon: <Settings size={20} /> }]
      : []),
  ];
  const active = (i: NavItem) => (i.match ? i.match(path) : path.startsWith(i.href));
  const primary = items.slice(0, 4);
  const rest = items.slice(4);
  const moreActive = rest.some(active);

  const sideLink = (i: NavItem) => (
    <Link
      key={i.href}
      href={i.href}
      aria-current={active(i) ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold transition',
        active(i) ? 'bg-nav-2 text-nav-ink' : 'text-nav-soft hover:bg-white/5 hover:text-nav-ink',
      )}
    >
      {active(i) && (
        <span
          className="absolute -left-3 top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-r-full bg-accent"
          aria-hidden
        />
      )}
      <span className={cn('transition', active(i) && 'text-accent')}>{i.icon}</span>
      <span>{i.label}</span>
      {!!i.badge && (
        <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-extrabold text-accent-ink">
          {i.badge}
        </span>
      )}
    </Link>
  );

  const tabLink = (i: NavItem, inSheet = false) => (
    <Link
      key={i.href}
      href={i.href}
      onClick={() => setMoreOpen(false)}
      aria-current={active(i) ? 'page' : undefined}
      className={
        inSheet
          ? cn(
              'flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold',
              active(i) ? 'bg-surface-2' : 'hover:bg-surface-2',
            )
          : 'relative flex flex-1 flex-col items-center gap-1 pb-1.5 pt-2 text-[11px] font-semibold'
      }
    >
      {inSheet ? (
        <>
          {i.icon}
          <span>{i.label}</span>
          {!!i.badge && (
            <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-ink">
              {i.badge}
            </span>
          )}
        </>
      ) : (
        <>
          <span
            className={cn(
              'flex h-8 w-14 items-center justify-center rounded-full transition',
              active(i) ? 'bg-accent text-accent-ink' : 'text-nav-soft',
            )}
          >
            {i.icon}
          </span>
          <span className={active(i) ? 'text-nav-ink' : 'text-nav-soft'}>{i.label}</span>
          {!!i.badge && (
            <span className="absolute right-[18%] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-nav" />
          )}
        </>
      )}
    </Link>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-[88rem]">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-4 bg-nav p-4 pl-5 text-nav-ink md:flex">
        <div className="px-1 pt-1">
          <Logo size="sm" className="text-nav-ink" />
        </div>
        <HabitatSwitcher current={habitat} tone="nav" />
        <nav aria-label="Habitat" className="flex flex-1 flex-col gap-1 overflow-y-auto pl-3 pr-1">
          {items.map(sideLink)}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-background/85 px-3 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <Link href="/" aria-label="Habitat home" className="shrink-0">
              <LogoMark size={34} />
            </Link>
            <HabitatSwitcher current={habitat} tone="plain" />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-1">
            <NotificationBell />
            <UserMenu name={user.name} email={user.email} image={user.image} />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-3 py-3 pb-28 md:px-6 md:pb-10">{children}</main>
      </div>

      <nav
        aria-label="Habitat"
        className="safe-bottom fixed inset-x-2 bottom-2 z-40 flex rounded-[1.75rem] bg-nav px-1 shadow-pop md:hidden"
      >
        {primary.map((i) => tabLink(i))}
        {rest.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-1 flex-col items-center gap-1 pb-1.5 pt-2 text-[11px] font-semibold"
          >
            <span
              className={cn(
                'flex h-8 w-14 items-center justify-center rounded-full transition',
                moreActive ? 'bg-accent text-accent-ink' : 'text-nav-soft',
              )}
            >
              <Menu size={20} />
            </span>
            <span className={moreActive ? 'text-nav-ink' : 'text-nav-soft'}>More</span>
            {waiting > 0 && !primary.some((p) => p.badge) && (
              <span className="absolute right-[18%] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-nav" />
            )}
          </button>
        )}
      </nav>
      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent title="More">
          <div className="flex flex-col gap-1">{rest.map((i) => tabLink(i, true))}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
