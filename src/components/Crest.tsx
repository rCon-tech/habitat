import { hashString, seeded } from '@/lib/utils';

type Piece = 'legUp' | 'legDown' | 'bar' | 'dot' | 'arch' | 'none';

/**
 * A pattern unique to each Habitat. It is scattered pieces of the logo (legs, bars, dots, arches)
 * drawn in the Habitat's own accent, so no two groups look alike and the pattern is recognisably Habitat's.
 * The same seed always gives the same picture. Pure SVG: renders on the server, no JavaScript.
 */
export function Crest({
  seed,
  cols = 16,
  rows = 6,
  className,
  density = 0.62,
}: {
  seed: string;
  cols?: number;
  rows?: number;
  className?: string;
  density?: number;
}) {
  const rand = seeded(hashString(seed));
  const CELL = 40;
  const kinds: Piece[] = ['legUp', 'legDown', 'bar', 'dot', 'arch'];
  // The fills follow the Habitat's accent, so the crest recolours itself when the accent changes.
  const fills = [
    'var(--accent)',
    'var(--accent)',
    'color-mix(in oklab, var(--accent) 55%, white)',
    'color-mix(in oklab, var(--accent) 45%, #18264a)',
    '#1f3060',
  ];
  const cells: Array<{ x: number; y: number; kind: Piece; fill: string }> = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const filled = rand() < density;
      const kind = filled ? kinds[Math.floor(rand() * kinds.length)]! : 'none';
      const fill = fills[Math.floor(rand() * fills.length)]!;
      cells.push({ x, y, kind, fill });
    }
  }
  return (
    <svg
      viewBox={`0 0 ${cols * CELL} ${rows * CELL}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={className}
      style={{ background: '#101b33' }}
    >
      {cells.map(({ x, y, kind, fill }) => {
        const ox = x * CELL;
        const oy = y * CELL;
        switch (kind) {
          case 'legUp':
            return (
              <path
                key={`${x}-${y}`}
                transform={`translate(${ox + 12} ${oy + 4})`}
                d="M0 32V8a8 8 0 0 1 16 0v24Z"
                fill={fill}
              />
            );
          case 'legDown':
            return (
              <path
                key={`${x}-${y}`}
                transform={`translate(${ox + 12} ${oy + 4})`}
                d="M0 0h16v24a8 8 0 0 1-16 0Z"
                fill={fill}
              />
            );
          case 'bar':
            return (
              <rect
                key={`${x}-${y}`}
                x={ox + 4}
                y={oy + 14}
                width="32"
                height="12"
                rx="6"
                fill={fill}
              />
            );
          case 'dot':
            return <circle key={`${x}-${y}`} cx={ox + 20} cy={oy + 20} r="10" fill={fill} />;
          case 'arch':
            return (
              <path
                key={`${x}-${y}`}
                transform={`translate(${ox + 6} ${oy + 6})`}
                d="M0 28V14a14 14 0 0 1 28 0v14Z"
                fill={fill}
              />
            );
          default:
            return null;
        }
      })}
    </svg>
  );
}
