import Link from 'next/link';
import { Users } from 'lucide-react';
import { Crest } from '@/components/Crest';
import { inkFor } from '@/lib/utils';

export interface HabitatCardData {
  slug: string;
  name: string;
  emoji: string;
  accent: string;
  memberCount: number;
}

/** Each Habitat's card wears its own pattern and colour, so you can find yours at a glance. */
export function HabitatCard({ h }: { h: HabitatCardData }) {
  return (
    <Link
      href={`/h/${h.slug}`}
      style={{ ['--accent' as string]: h.accent }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-pop"
    >
      <Crest
        seed={h.slug}
        cols={10}
        rows={3}
        className="h-28 w-full transition duration-500 group-hover:scale-[1.04]"
      />
      <span
        className="absolute left-5 top-[4.75rem] flex h-14 w-14 items-center justify-center rounded-t-full rounded-b-xl border-4 border-surface text-2xl"
        style={{ background: h.accent, color: inkFor(h.accent) }}
        aria-hidden
      >
        {h.emoji}
      </span>
      <span className="px-5 pb-5 pt-9">
        <span className="block font-display text-xl font-extrabold leading-tight">{h.name}</span>
        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft">
          <Users size={14} /> {h.memberCount} {h.memberCount === 1 ? 'person' : 'people'}
        </span>
      </span>
    </Link>
  );
}
