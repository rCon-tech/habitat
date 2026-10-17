'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ModuleCard, type ModuleCardData } from '@/components/ModuleCard';
import { cn } from '@/lib/utils';

export interface BrowserWidget extends ModuleCardData {
  category: string;
  description: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  social: 'Social',
  plans: 'Plans',
  fun: 'Fun',
  practical: 'Practical',
};

/** Search and filter the widgets: by name or what they do, by kind, or just the ones you already have. */
export function WidgetBrowser({ widgets, slug }: { widgets: BrowserWidget[]; slug: string }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | string>('all');
  const categories = useMemo(() => [...new Set(widgets.map((w) => w.category))], [widgets]);
  const installedCount = widgets.filter((w) => w.installed).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return widgets.filter((w) => {
      if (filter === 'installed' && !w.installed) return false;
      if (filter !== 'all' && filter !== 'installed' && w.category !== filter) return false;
      return !q || `${w.name} ${w.tagline} ${w.description}`.toLowerCase().includes(q);
    });
  }, [widgets, query, filter]);

  const chip = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      aria-pressed={filter === value}
      onClick={() => setFilter(value)}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-bold transition',
        filter === value ? 'bg-ink text-background' : 'bg-surface-2 text-ink-soft hover:bg-line',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search widgets: scores, shopping, birthdays…"
          aria-label="Search widgets"
          className="h-12 w-full rounded-full border-2 border-line bg-surface pl-11 pr-4 text-base text-ink placeholder:text-ink-soft/70 hover:border-ink/25 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
        />
      </div>
      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        role="group"
        aria-label="Filter widgets"
      >
        {chip('all', `All ${widgets.length}`)}
        {chip('installed', `In your Habitat ${installedCount}`)}
        {categories.map((c) => chip(c, CATEGORY_LABEL[c] ?? c))}
      </div>
      {shown.length === 0 ? (
        <EmptyState title="No widgets match">Try a different word, or clear the filter.</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((w) => (
            <ModuleCard key={w.id} m={w} slug={slug} />
          ))}
        </div>
      )}
      <p className="text-center text-sm text-ink-soft">
        Missing something? Anyone can suggest a new widget, and the group votes on it.
      </p>
    </div>
  );
}
