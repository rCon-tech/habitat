'use client';

import * as D from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

/** A centred dialog on desktop and a bottom sheet on phones. */
export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-nav/70 backdrop-blur-sm" />
      <D.Content
        className={cn(
          'safe-bottom animate-rise fixed z-50 w-full max-w-lg border border-line bg-surface p-6 shadow-pop',
          'bottom-0 left-1/2 -translate-x-1/2 rounded-t-[2rem] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]',
          'max-h-[90dvh] overflow-y-auto',
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <D.Title className="font-display text-xl font-extrabold tracking-tight">
              {title}
            </D.Title>
            {description ? (
              <D.Description className="mt-1 text-sm text-ink-soft">{description}</D.Description>
            ) : (
              <D.Description className="sr-only">{title}</D.Description>
            )}
          </div>
          <D.Close
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-soft hover:bg-surface-2"
          >
            <X size={20} />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}
