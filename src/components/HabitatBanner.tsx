'use client';

import { Users } from 'lucide-react';
import Link from 'next/link';
import { Crest } from '@/components/Crest';
import { MemberAvatar } from '@/components/MemberAvatar';
import { useHabitat } from '@/modules/sdk/context';

/** The top of a Habitat's home: its own pattern, its name, and the faces inside. */
export function HabitatBanner() {
  const { slug, name, emoji, description, members } = useHabitat();
  const shown = members.slice(0, 6);
  return (
    <section
      className="animate-rise relative isolate overflow-hidden rounded-[2rem] text-white shadow-card"
      aria-label={name}
    >
      <Crest seed={slug} className="absolute inset-0 -z-10 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1220]/85 via-[#0b1220]/35 to-transparent" />
      <div className="flex min-h-48 flex-col justify-end gap-4 p-5 pt-16 sm:min-h-56 sm:pt-24 sm:p-7">
        <div className="flex items-end gap-4">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-t-full rounded-b-2xl bg-accent text-3xl shadow-lg sm:h-20 sm:w-20 sm:text-4xl"
            aria-hidden
          >
            {emoji}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-extrabold leading-none sm:text-5xl">{name}</h1>
            {description && (
              <p className="mt-1.5 line-clamp-2 max-w-xl text-sm text-white/85 sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/h/${slug}/members`}
          className="flex w-fit items-center gap-3 rounded-full bg-[#0b1220]/55 py-1.5 pl-1.5 pr-4 text-sm font-semibold backdrop-blur hover:bg-[#0b1220]/70"
        >
          <span className="flex -space-x-2">
            {shown.map((m) => (
              <MemberAvatar key={m.id} member={m} size="sm" className="ring-2 ring-[#0b1220]" />
            ))}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} aria-hidden /> {members.length}{' '}
            {members.length === 1 ? 'person' : 'people'}
          </span>
        </Link>
      </div>
    </section>
  );
}
