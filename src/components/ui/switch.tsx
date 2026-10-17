'use client';

import * as S from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Switch({ className, ...props }: ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors data-[state=checked]:bg-accent',
        className,
      )}
      {...props}
    >
      <S.Thumb className="block h-6 w-6 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-accent-ink" />
    </S.Root>
  );
}
