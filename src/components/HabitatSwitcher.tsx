'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { cn, inkFor } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Mine {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  accent: string;
}

/** `nav` sits on the navy sidebar; `plain` sits on the page background. */
export function HabitatSwitcher({
  current,
  tone = 'plain',
}: {
  current: { slug: string; name: string; emoji: string; accent: string };
  tone?: 'nav' | 'plain';
}) {
  const { data } = useQuery({
    queryKey: ['my-habitats'],
    queryFn: () => apiFetch<{ habitats: Mine[] }>('/api/habitats'),
    staleTime: 60_000,
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex min-w-0 items-center gap-2.5 rounded-2xl text-left transition',
          tone === 'nav'
            ? 'w-full bg-nav-2 p-2.5 text-nav-ink hover:brightness-125'
            : 'max-w-[58vw] px-1.5 py-1 hover:bg-surface-2',
        )}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-t-full rounded-b-lg text-lg"
          style={{ background: current.accent, color: inkFor(current.accent) }}
          aria-hidden
        >
          {current.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-extrabold leading-tight">
            {current.name}
          </span>
          {tone === 'nav' && <span className="block text-xs text-nav-soft">Switch Habitat</span>}
        </span>
        <ChevronsUpDown
          size={16}
          className={cn('shrink-0', tone === 'nav' ? 'text-nav-soft' : 'text-ink-soft')}
          aria-hidden
        />
        <span className="sr-only">Switch Habitat</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(data?.habitats ?? []).map((h) => (
          <DropdownMenuItem key={h.id} asChild>
            <Link href={`/h/${h.slug}`}>
              <span aria-hidden>{h.emoji}</span> {h.name}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/new">
            <Plus size={16} /> New Habitat
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">All my Habitats</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
