'use client';

import * as M from '@radix-ui/react-dropdown-menu';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;

export function DropdownMenuContent({ className, ...props }: ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        sideOffset={6}
        align="end"
        className={cn(
          'animate-rise z-50 min-w-52 rounded-2xl border border-line bg-surface p-1.5 shadow-pop',
          className,
        )}
        {...props}
      />
    </M.Portal>
  );
}

export function DropdownMenuItem({
  className,
  danger,
  ...props
}: ComponentProps<typeof M.Item> & { danger?: boolean }) {
  return (
    <M.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium outline-none data-[highlighted]:bg-surface-2',
        danger && 'text-danger',
        className,
      )}
      {...props}
    />
  );
}

export const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <M.Separator className={cn('my-1 h-px bg-line', className)} />
);

export const DropdownMenuLabel = ({ children }: { children: ReactNode }) => (
  <M.Label className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
    {children}
  </M.Label>
);
