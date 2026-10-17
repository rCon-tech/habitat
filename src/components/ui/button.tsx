import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-150 ease-out select-none whitespace-nowrap active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-accent-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)] hover:brightness-105 hover:shadow-[inset_0_-2px_0_rgb(0_0_0/0.12),0_8px_20px_-8px_var(--accent)]',
        secondary: 'bg-surface-2 text-ink hover:bg-line',
        ghost: 'text-ink hover:bg-surface-2',
        danger: 'bg-danger text-white hover:brightness-110 dark:text-[#1a0a10]',
        outline:
          'border-2 border-line bg-transparent text-ink hover:border-ink/40 hover:bg-surface',
      },
      size: {
        sm: 'h-8 px-3.5 text-[13px]',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
