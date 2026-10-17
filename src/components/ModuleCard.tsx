import Link from 'next/link';
import { Check } from 'lucide-react';
import { ModuleIcon } from '@/components/ModuleIcon';
import { Badge } from '@/components/ui/card';

export interface ModuleCardData {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  installed: boolean;
  voteOpen: { yes: number; memberCount: number } | null;
}

export function ModuleCard({ m, slug }: { m: ModuleCardData; slug: string }) {
  return (
    <Link
      href={`/h/${slug}/library/${m.id}`}
      className="group flex h-full items-start gap-4 rounded-[1.75rem] border border-line bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-pop"
    >
      <span
        className={
          m.installed
            ? 'flex h-14 w-14 shrink-0 items-center justify-center rounded-t-full rounded-b-2xl bg-accent text-accent-ink transition group-hover:rounded-b-full'
            : 'flex h-14 w-14 shrink-0 items-center justify-center rounded-t-full rounded-b-2xl bg-surface-2 text-ink transition group-hover:rounded-b-full group-hover:bg-accent group-hover:text-accent-ink'
        }
      >
        <ModuleIcon name={m.icon} size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-extrabold">{m.name}</span>
          {m.installed ? (
            <Badge tone="ok">
              <Check size={12} className="mr-0.5" /> In your Habitat
            </Badge>
          ) : m.voteOpen ? (
            <Badge tone="accent">
              Vote: {m.voteOpen.yes}/{m.voteOpen.memberCount}
            </Badge>
          ) : null}
        </span>
        <span className="mt-0.5 block text-sm text-ink-soft">{m.tagline}</span>
      </span>
    </Link>
  );
}
