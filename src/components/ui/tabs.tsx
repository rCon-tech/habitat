'use client';

import * as T from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Tabs = T.Root;
export const TabsContent = T.Content;

export function TabsList({ className, ...props }: ComponentProps<typeof T.List>) {
  return (
    <T.List
      className={cn('mb-4 inline-flex rounded-full bg-surface-2 p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        'rounded-full px-5 py-1.5 text-sm font-bold text-ink-soft transition data-[state=active]:bg-ink data-[state=active]:text-background',
        className,
      )}
      {...props}
    />
  );
}
