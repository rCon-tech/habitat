import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The Habitat mark: an H built from two legs that are the same shape turned upside down: one
 * round-topped, one round-bottomed. Two sides of a group, joined by a bar, each the other's mirror.
 * The geometry lives in one place (and in scripts/brand.mjs for the exported icons).
 */
const LEFT = 'M14 51V19a6 6 0 0 1 12 0V51Z';
const RIGHT = 'M38 13h12v32a6 6 0 0 1-12 0Z';
const BAR = { x: 26, y: 27, width: 12, height: 10 };

type Tone = 'ember' | 'navy' | 'cream';

const TONES: Record<Tone, { tile: string; h: string }> = {
  ember: { tile: '#ff6a3d', h: '#0b1220' }, // the app icon
  navy: { tile: '#101b33', h: '#f4f6fb' },
  cream: { tile: '#f4f6fb', h: '#101b33' },
};

export function LogoMark({
  size = 32,
  tone = 'ember',
  className,
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const c = TONES[tone];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Habitat"
      className={cn('shrink-0', className)}
    >
      <rect width="64" height="64" rx="18" fill={c.tile} />
      <path d={LEFT} fill={c.h} />
      <path d={RIGHT} fill={c.h} />
      <rect {...BAR} fill={c.h} />
    </svg>
  );
}

/** Mark plus lowercase wordmark. The text takes the colour of its surroundings. */
export function Logo({
  href = '/',
  size = 'md',
  tone = 'ember',
  className,
}: {
  href?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: Tone;
  className?: string;
}) {
  const px = { sm: 26, md: 32, lg: 44, xl: 64 }[size];
  const text = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' }[size];
  const body = (
    <>
      <LogoMark size={px} tone={tone} />
      <span
        className={cn('font-display font-extrabold lowercase leading-none tracking-tight', text)}
        style={{ fontVariationSettings: "'wdth' 90" }}
      >
        habitat
      </span>
    </>
  );
  const cls = cn('inline-flex items-center gap-2.5', className);
  return href ? (
    <Link href={href} className={cls} aria-label="Habitat home">
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  );
}
