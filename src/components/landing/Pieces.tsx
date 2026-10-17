import {
  BarChart3,
  Cake,
  CalendarDays,
  Gift,
  Images,
  MessageCircle,
  Newspaper,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tile {
  label: string;
  Icon: LucideIcon;
  bg: string;
  fg: string;
  shape: string;
  style: React.CSSProperties;
  drift?: string;
}

// The same colours a Habitat can pick for itself, each with text that clears 4.5:1.
const TILES: Tile[] = [
  {
    label: 'Feed',
    Icon: Newspaper,
    bg: '#2a3f73',
    fg: '#e9eefb',
    shape: 'rounded-t-full rounded-b-[2rem]',
    style: { left: '2%', top: '4%', width: 128, height: 156, ['--r' as string]: '-4deg' },
  },
  {
    label: 'Photos',
    Icon: Images,
    bg: '#2f7df6',
    fg: '#0b1220',
    shape: 'rounded-full',
    style: { left: '36%', top: '0%', width: 120, height: 120, ['--r' as string]: '5deg' },
    drift: '[animation-delay:-2s]',
  },
  {
    label: 'Events',
    Icon: CalendarDays,
    bg: '#f5a524',
    fg: '#0b1220',
    shape: 'rounded-[2rem]',
    style: { left: '66%', top: '8%', width: 132, height: 132, ['--r' as string]: '-3deg' },
    drift: '[animation-delay:-4s]',
  },
  {
    label: 'Chat',
    Icon: MessageCircle,
    bg: '#ff6a3d',
    fg: '#0b1220',
    shape: 'rounded-full',
    style: { left: '12%', top: '43%', width: 176, height: 84, ['--r' as string]: '3deg' },
    drift: '[animation-delay:-1s]',
  },
  {
    label: 'Polls',
    Icon: BarChart3,
    bg: '#6c4cf1',
    fg: '#ffffff',
    shape: 'rounded-t-full rounded-b-[2rem]',
    style: { left: '70%', top: '44%', width: 112, height: 140, ['--r' as string]: '4deg' },
    drift: '[animation-delay:-3s]',
  },
  {
    label: 'Wishlist',
    Icon: Gift,
    bg: '#f0506e',
    fg: '#0b1220',
    shape: 'rounded-full',
    style: { left: '44%', top: '46%', width: 100, height: 100, ['--r' as string]: '-6deg' },
    drift: '[animation-delay:-5s]',
  },
  {
    label: 'Birthdays',
    Icon: Cake,
    bg: '#12b3a8',
    fg: '#0b1220',
    shape: 'rounded-[2rem]',
    style: { left: '3%', top: '74%', width: 120, height: 104, ['--r' as string]: '-2deg' },
    drift: '[animation-delay:-6s]',
  },
];

/** "Built from pieces": a Habitat as tiles you can add, and the vote that adds them. Decorative; hidden from assistive tech. */
export function Pieces() {
  return (
    <div
      className="relative mx-auto h-[30rem] w-full max-w-[34rem] origin-top scale-[0.82] sm:scale-100"
      aria-hidden
    >
      {TILES.map(({ label, Icon, bg, fg, shape, style, drift }) => (
        <div
          key={label}
          className={cn(
            'animate-drift absolute flex flex-col items-center justify-center gap-1.5 shadow-[0_24px_40px_-20px_rgb(0_0_0/0.7)]',
            shape,
            drift,
          )}
          style={{ ...style, background: bg, color: fg }}
        >
          <Icon size={30} strokeWidth={2.2} />
          <span className="text-[13px] font-extrabold tracking-tight">{label}</span>
        </div>
      ))}

      <div
        className="animate-rise absolute bottom-0 right-0 w-[19rem] rounded-[1.75rem] bg-white p-5 text-[#0b1220] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] [animation-delay:0.3s]"
        style={{ transform: 'rotate(-2deg)' }}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#566176]">
          Vote · Rich proposed
        </p>
        <p className="mt-1 font-display text-xl font-extrabold leading-tight">
          Add Polls to the Lads?
        </p>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#eaeef6]">
          <div className="w-[60%] bg-[#ff6a3d]" />
          <div className="w-[20%] bg-[#0b1220]" />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-semibold">
          <span>3 of 5 said yes</span>
          <span className="rounded-full bg-[#ff6a3d] px-3 py-1 text-xs font-extrabold">Vote</span>
        </div>
      </div>
    </div>
  );
}
